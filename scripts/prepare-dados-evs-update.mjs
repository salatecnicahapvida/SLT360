// Private operator tool. Reads DADOS EVS and writes audit artifacts outside this public repository.
import fs from 'node:fs/promises';
import path from 'node:path';
import * as XLSX from 'xlsx';

const [inputPath, outputDir] = process.argv.slice(2);
if (!inputPath || !outputDir) throw new Error('Informe a planilha DADOS EVS e um diretório privado de saída.');
const repositoryRoot = process.cwd() + path.sep;
if (path.resolve(outputDir).startsWith(repositoryRoot)) throw new Error('O diretório de saída precisa ficar fora do repositório público.');

const normalize = (value) => String(value ?? '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .trim()
  .toLowerCase();

function numberValue(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const text = String(value ?? '').trim();
  if (!text) return 0;
  const normalized = text.includes(',')
    ? text.replace(/\./g, '').replace(',', '.')
    : text;
  const parsed = Number(normalized.replace(/[^0-9.+-]/g, ''));
  if (!Number.isFinite(parsed)) throw new Error(`Valor numérico inválido: ${text}`);
  return parsed;
}

function isoDate(value) {
  if (value instanceof Date && Number.isFinite(value.valueOf())) return value.toISOString().replace('Z', '');
  return String(value ?? '').trim();
}

const workbook = XLSX.read(await fs.readFile(inputPath), { type: 'buffer', cellDates: true });
const sheetName = workbook.SheetNames[0];
const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1, defval: null, raw: true });
const headerIndex = rows.findIndex((row) => row.some((value) => normalize(value) === 'projeto'));
if (headerIndex < 0) throw new Error('Cabeçalho Projeto não encontrado.');
const headers = rows[headerIndex].map(normalize);
const column = (name) => {
  const index = headers.indexOf(normalize(name));
  if (index < 0) throw new Error(`Coluna obrigatória ausente: ${name}`);
  return index;
};
const columns = {
  project: column('Projeto'),
  revision: column('Revisão'),
  date: column('Data do arquivo'),
  item: column('Item'),
  description: column('Descrição'),
  value: column('Valor'),
  area: column('Área total equivalente (m²)'),
  technician: column('Técnico'),
};

const grouped = new Map();
for (const [offset, row] of rows.slice(headerIndex + 1).entries()) {
  if (!row.some((value) => value !== null && value !== '')) continue;
  const project = String(row[columns.project] ?? '').trim();
  const description = String(row[columns.description] ?? '').trim();
  if (!project || !description) throw new Error(`Linha ${headerIndex + offset + 2}: Projeto ou Descrição vazio.`);
  // Preserve the numeric precision stored by Excel. Some calculated lines carry
  // fractions of a cent and rounding every row changes the source grand total.
  const value = numberValue(row[columns.value]);
  const item = String(row[columns.item] ?? '').trim();
  const revision = String(row[columns.revision] ?? '').trim();
  const date = isoDate(row[columns.date]);
  const area = numberValue(row[columns.area]);
  const technician = String(row[columns.technician] ?? '').trim();
  const record = grouped.get(project) || { project, revision, date, area, technician, items: [], total: 0 };
  for (const [field, current] of [['revision', revision], ['date', date], ['area', area], ['technician', technician]]) {
    if (String(record[field]) !== String(current)) throw new Error(`Metadado ${field} divergente na obra ${project}.`);
  }
  record.items.push({ item, description, value });
  record.total += value;
  grouped.set(project, record);
}

const projects = [...grouped.values()];
if (projects.length !== 856) throw new Error(`Esperadas 856 obras, encontradas ${projects.length}.`);
const itemCount = projects.reduce((sum, project) => sum + project.items.length, 0);
if (itemCount !== 9795) throw new Error(`Esperadas 9.795 linhas, encontradas ${itemCount}.`);
const consolidatedObraRows = projects.flatMap((project) => project.items).filter((item) => normalize(item.description) === 'obra');
if (consolidatedObraRows.length) throw new Error(`Ainda existem ${consolidatedObraRows.length} linhas consolidadas com a descrição Obra.`);

const source = path.basename(inputPath);
const payload = {
  source,
  sheet: sheetName,
  projectCount: projects.length,
  itemCount,
  total: Math.round(projects.reduce((sum, project) => sum + project.total, 0) * 100) / 100,
  zeroAreaProjects: projects.filter((project) => !project.area).length,
  projects,
};

const auditInput = projects.map(({ project, revision, date, area, technician, total, items }) => ({
  project, revision, date, area, technician, total, itemCount: items.length,
}));
const auditBase64 = Buffer.from(JSON.stringify(auditInput), 'utf8').toString('base64');
const auditSql = `
create or replace function pg_temp.canonical_ev_work_name(value text)
returns text language plpgsql immutable set search_path='' as $$
declare normalized text;
begin
  normalized=lower(translate(coalesce(value,''),
    'áàâãäéèêëíìîïóòôõöúùûüçÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÙÛÜÇ',
    'aaaaaeeeeiiiiooooouuuucAAAAAEEEEIIIIOOOOOUUUUC'));
  normalized=regexp_replace(normalized,'^\\s*projeto\\s+','','i');
  normalized=regexp_replace(normalized,'^\\s*\\d+(?:[.\\s-]+)?','','');
  normalized=regexp_replace(normalized,'\\m(hs|ho|hc)\\M','hospital','g');
  normalized=regexp_replace(normalized,'\\m(novo|nova)\\M','','g');
  normalized=regexp_replace(normalized,'\\s+[a-z]{2}\\s+tec\\s+\\d+.*$','','i');
  normalized=regexp_replace(normalized,'\\s+tec\\s+\\d+.*$','','i');
  normalized=regexp_replace(normalized,'[^a-z0-9]+',' ','g');
  return trim(regexp_replace(normalized,'\\s+',' ','g'));
end $$;
with input as (
  select value as row, value->>'project' project, pg_temp.canonical_ev_work_name(value->>'project') canonical
  from jsonb_array_elements(convert_from(decode('${auditBase64}','base64'),'UTF8')::jsonb) value
), existing as (
  select e.record_key,e.work_id,e.extra->>'project' project,pg_temp.canonical_ev_work_name(e.extra->>'project') canonical,
         e.extra->>'sourceRevision' revision,e.total_amount
  from public.slt_budget_import_estimates e where e.deleted_at is null
), matched as (
  select i.*,e.record_key,e.work_id,e.project old_project,e.revision old_revision,e.total_amount old_total,
         row_number() over(partition by i.project order by (i.project=e.project) desc,e.record_key) rank
  from input i left join existing e on e.canonical=i.canonical
), new_projects as (
  select m.* from matched m where m.record_key is null
), removed_projects as (
  select e.* from existing e left join input i on i.canonical=e.canonical where i.project is null
), new_work_candidates as (
  select n.project,w.record_key,w.name,w.extra->>'_dadosEvsOfficial' official,
         row_number() over(partition by n.project order by (pg_temp.canonical_ev_work_name(w.name)=n.canonical) desc,w.ordinal,w.record_key) rank
  from new_projects n join public.slt_projects_works w on w.deleted_at is null and pg_temp.canonical_ev_work_name(w.name)=n.canonical
)
select jsonb_build_object(
  'inputProjects',(select count(*) from input),
  'activeHistoricalEVs',(select count(*) from existing),
  'exactMatches',(select count(*) from input i where exists(select 1 from existing e where e.project=i.project)),
  'canonicalMatches',(select count(*) from matched where record_key is not null and rank=1),
  'nonExactCanonicalMatches',(select count(*) from matched where record_key is not null and rank=1 and project<>old_project),
  'ambiguousWithoutExact',(select count(*) from input i where not exists(select 1 from existing e where e.project=i.project) and (select count(*) from existing e where e.canonical=i.canonical)>1),
  'canonicalAdjustments',coalesce((select jsonb_agg(jsonb_build_object('newProject',project,'oldProject',old_project,'recordKey',record_key)) from matched where record_key is not null and rank=1 and project<>old_project),'[]'),
  'newProjects',coalesce((select jsonb_agg(jsonb_build_object('project',project,'workCandidates',
    (select coalesce(jsonb_agg(jsonb_build_object('recordKey',c.record_key,'name',c.name,'official',c.official) order by c.rank),'[]') from new_work_candidates c where c.project=n.project))) from new_projects n),'[]'),
  'removedProjects',coalesce((select jsonb_agg(jsonb_build_object('recordKey',record_key,'project',project)) from removed_projects),'[]'),
  'revisionChanges',(select count(*) from matched where rank=1 and record_key is not null and coalesce(old_revision,'')<>coalesce(row->>'revision','')),
  'valueChanges',(select count(*) from matched where rank=1 and record_key is not null and abs(coalesce(old_total,0)-coalesce((row->>'total')::numeric,0))>0.02),
  'newTotal',(select round(sum((row->>'total')::numeric),2) from input),
  'oldTotal',(select round(sum(total_amount),2) from existing)
) audit;
`;

const descriptionCounts = new Map();
for (const item of projects.flatMap((project) => project.items)) {
  descriptionCounts.set(item.description, (descriptionCounts.get(item.description) || 0) + 1);
}
const mappingInput = [...descriptionCounts].map(([description, lines]) => ({ description, lines }));
const fullBase64 = Buffer.from(JSON.stringify(mappingInput), 'utf8').toString('base64');
const mappingAuditSql = `
create or replace function pg_temp.ev_text(value text)
returns text language sql immutable set search_path='' as $$
  select trim(regexp_replace(lower(translate(coalesce(value,''),
    'áàâãäéèêëíìîïóòôõöúùûüçÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇ',
    'aaaaaeeeeiiiiooooouuuucAAAAAEEEEIIIIOOOOOUUUUC')),'[^a-z0-9]+',' ','g'))
$$;
create or replace function pg_temp.known_ev_discipline(value text)
returns text language sql immutable set search_path='' as $$
  select case pg_temp.ev_text(value)
    when 'fundacoes e contencoes' then 'fundacoes-e-contencoes'
    when 'estruturas' then 'estruturas'
    when 'adequacoes civis' then 'adequacoes-civis'
    when 'fachadas' then 'fachadas'
    when 'instalacoes eletricas e spda' then 'instalacoes-eletricas-e-spda'
    when 'instalacoes hidrossanitarias' then 'instalacoes-hidrossanitarias'
    when 'instalacoes de gases medicinais' then 'instalacoes-de-gases-medicinais'
    when 'instalacoes de combate a incendio' then 'instalacoes-de-combate-a-incendio'
    when 'instalacoes de glp' then 'instalacoes-de-glp'
    when 'instalacoes de spda' then 'instalacoes-de-spda'
    when 'instalacoes de climatizacao e exaustao' then 'instalacoes-de-climatizacao-e-exaustao'
    when 'infraestrutura de dados voz seg patrimonial cftv chamada' then 'dados-voz-cftv-chamada'
    when 'custos indiretos' then 'custos-indiretos'
    when 'site planning' then 'site-planning'
    when 'paisagismo' then 'paisagismo-e-ou-compensacao-ambiental'
    when 'diversos' then 'diversos'
  end
$$;
create or replace function pg_temp.infer_ev_discipline(value text)
returns text language plpgsql immutable set search_path='' as $$
declare n text=pg_temp.ev_text(value);
begin
  if n ~ 'fundac|contenc' then return 'fundacoes-e-contencoes'; end if;
  if n ~ 'estrutur|estaca raiz' then return 'estruturas'; end if;
  if n ~ 'fachad|acm' then return 'fachadas'; end if;
  if n ~ 'hidross|sanitari|esgoto|drenagem' then return 'instalacoes-hidrossanitarias'; end if;
  if n ~ 'gas(es)? medicin|regua medic' then return case when n ~ 'regua' then 'reguas-medicinais' else 'instalacoes-de-gases-medicinais' end; end if;
  if n ~ 'incendio|hidrante|ppci|firebee' then return 'instalacoes-de-combate-a-incendio'; end if;
  if n ~ '\\mglp\\M' then return 'instalacoes-de-glp'; end if;
  if n ~ '\\mspda\\M' then return 'instalacoes-de-spda'; end if;
  if n ~ 'climat|exaust|chiller|split|vrv' then return case when n ~ 'equip|chiller|split|vrv|maquina' then 'equipamentos-de-climatizacao' else 'instalacoes-de-climatizacao-e-exaustao' end; end if;
  if n ~ 'dados|voz|cftv|chamada|logica|seguranca patrimonial|\\melo\\M' then return 'dados-e-voz-seguranca-patrimonial-chamada-hospitalar'; end if;
  if n ~ 'custo indireto|gerenciamento|mobilizacao|desmobilizacao' then return 'custos-indiretos'; end if;
  if n ~ 'site planning' then return 'site-planning'; end if;
  if n ~ 'paisag' then return 'paisagismo-e-ou-compensacao-ambiental'; end if;
  if n ~ 'projeto.*legal|legalizacao' then return 'projetos-legalizacao'; end if;
  if n ~ 'projeto|compatibilizacao' then return 'projetos-tecnicos'; end if;
  if n ~ 'inox|coifa' then return 'artefatos-inox'; end if;
  if n ~ 'marcenaria|mobiliario|moveis' then return 'marcenaria'; end if;
  if n ~ 'gerador|subestacao|transform|cubiculo|qgbt|trafo' then return 'gerador-subestacao-transformador-cubiculos'; end if;
  if n ~ 'elevador|plataforma elevatoria' then return 'elevadores-plataforma-elevatoria'; end if;
  if n ~ 'compressor|vacuo|driox' then return 'compressor-bomba-de-vacuo-driox'; end if;
  if n ~ 'it medico|nobreak|autotrafo|estabilizador' then return 'it-medico-nobreak'; end if;
  if n ~ '\\mete\\M|\\meta\\M|tratamento de agua' then return 'ete-eta'; end if;
  if n ~ 'correio pneumatic' then return 'correio-pneumatico'; end if;
  if n ~ 'controle de acesso|catraca' then return 'controle-acessos'; end if;
  if n ~ 'planejamento de obra' then return 'planejamento-obras'; end if;
  if n ~ 'conta de consumo|contas de consumo|conta de energia|contas de energia|conta de agua|contas de agua' then return 'contas-consumo'; end if;
  if n ~ 'comunicacao visual|sinalizacao' then return 'comunicacao-visual-externa-e-interna'; end if;
  if n ~ 'quadro.*eletric|quadros' then return 'quadros-eletricos'; end if;
  if n ~ 'automacao' then return 'sistemas-de-automacao'; end if;
  if n ~ 'blindagem|plumbifer|radiologic' then return 'blindagem'; end if;
  if n ~ 'camara fria|camara frigor' then return 'camara-fria'; end if;
  if n ~ 'aquecimento|boiler' then return 'sistema-de-aquecimento-de-agua'; end if;
  if n ~ 'taxa.*risco' then return 'taxa-risco'; end if;
  if n ~ '\\msic|\\msics|aditivo|\\madt' then return 'sics'; end if;
  if n ~ 'civil|demoli|revestimento|piso|parede|coberta|obra' then return 'adequacoes-civis'; end if;
  if n ~ 'diverso' then return 'diversos'; end if;
  return null;
end $$;
with raw_items as (
  select value item,pg_temp.ev_text(value->>'description') normalized,(value->>'lines')::integer lines
  from jsonb_array_elements(convert_from(decode('${fullBase64}','base64'),'UTF8')::jsonb) value
), old_candidates as (
  select pg_temp.ev_text(item->>'description') normalized,item->>'disciplineId' discipline_id,count(*) occurrences
  from public.slt_budget_historical_ev_details d cross join lateral jsonb_array_elements(d.items) item
  group by 1,2
), old_map as (
  select normalized,discipline_id from (
    select *,row_number() over(partition by normalized order by occurrences desc,discipline_id) rank from old_candidates
  ) ranked where rank=1
), mapped as (
  select r.*,
    coalesce(pg_temp.known_ev_discipline(r.item->>'description'),o.discipline_id,pg_temp.infer_ev_discipline(r.item->>'description'),'outras-linhas-ev') discipline_id,
    case when pg_temp.known_ev_discipline(r.item->>'description') is not null then 'approved_group'
         when o.discipline_id is not null then 'existing_exact'
         when pg_temp.infer_ev_discipline(r.item->>'description') is not null then 'inferred'
         else 'fallback' end mapping_source
  from raw_items r left join old_map o using(normalized)
)
select jsonb_build_object(
  'lines',(select sum(lines) from mapped),
  'approvedGroupLines',(select coalesce(sum(lines),0) from mapped where mapping_source='approved_group'),
  'existingExactLines',(select coalesce(sum(lines),0) from mapped where mapping_source='existing_exact'),
  'inferredLines',(select coalesce(sum(lines),0) from mapped where mapping_source='inferred'),
  'fallbackLines',(select coalesce(sum(lines),0) from mapped where mapping_source='fallback'),
  'fallbackDescriptions',coalesce((select jsonb_agg(jsonb_build_object('description',description,'lines',lines) order by lines desc,description) from (
    select item->>'description' description,sum(lines) lines from mapped where mapping_source='fallback' group by 1
  ) f),'[]'),
  'disciplineCounts',(select jsonb_object_agg(discipline_id,lines) from (select discipline_id,sum(lines) lines from mapped group by 1 order by 1) d)
) audit;
`;

const payloadBase64 = Buffer.from(JSON.stringify(projects), 'utf8').toString('base64');
const migrationSql = `begin;

select pg_advisory_xact_lock(hashtextextended('slt360/dados-evs-import',0));

create or replace function pg_temp.ev_text(value text)
returns text language sql immutable set search_path='' as $$
  select trim(regexp_replace(lower(translate(coalesce(value,''),
    'áàâãäéèêëíìîïóòôõöúùûüçÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇ',
    'aaaaaeeeeiiiiooooouuuucAAAAAEEEEIIIIOOOOOUUUUC')),'[^a-z0-9]+',' ','g'))
$$;

create or replace function pg_temp.known_ev_discipline(value text)
returns text language sql immutable set search_path='' as $$
  select case pg_temp.ev_text(value)
    when 'fundacoes e contencoes' then 'fundacoes-e-contencoes'
    when 'estruturas' then 'estruturas'
    when 'adequacoes civis' then 'adequacoes-civis'
    when 'fachadas' then 'fachadas'
    when 'instalacoes eletricas e spda' then 'instalacoes-eletricas-e-spda'
    when 'instalacoes hidrossanitarias' then 'instalacoes-hidrossanitarias'
    when 'instalacoes de gases medicinais' then 'instalacoes-de-gases-medicinais'
    when 'instalacoes de combate a incendio' then 'instalacoes-de-combate-a-incendio'
    when 'instalacoes de glp' then 'instalacoes-de-glp'
    when 'instalacoes de spda' then 'instalacoes-de-spda'
    when 'instalacoes de climatizacao e exaustao' then 'instalacoes-de-climatizacao-e-exaustao'
    when 'infraestrutura de dados voz seg patrimonial cftv chamada' then 'dados-voz-cftv-chamada'
    when 'custos indiretos' then 'custos-indiretos'
    when 'site planning' then 'site-planning'
    when 'paisagismo' then 'paisagismo-e-ou-compensacao-ambiental'
    when 'diversos' then 'diversos'
  end
$$;

create or replace function pg_temp.infer_ev_discipline(value text)
returns text language plpgsql immutable set search_path='' as $$
declare n text=pg_temp.ev_text(value);
begin
  if n ~ 'fundac|contenc' then return 'fundacoes-e-contencoes'; end if;
  if n ~ 'estrutur|estaca raiz' then return 'estruturas'; end if;
  if n ~ 'fachad|acm' then return 'fachadas'; end if;
  if n ~ 'hidross|sanitari|esgoto|drenagem' then return 'instalacoes-hidrossanitarias'; end if;
  if n ~ 'gas(es)? medicin|regua medic' then return case when n ~ 'regua' then 'reguas-medicinais' else 'instalacoes-de-gases-medicinais' end; end if;
  if n ~ 'incendio|hidrante|ppci|firebee' then return 'instalacoes-de-combate-a-incendio'; end if;
  if n ~ '\\mglp\\M' then return 'instalacoes-de-glp'; end if;
  if n ~ '\\mspda\\M' then return 'instalacoes-de-spda'; end if;
  if n ~ 'climat|exaust|chiller|split|vrv' then return case when n ~ 'equip|chiller|split|vrv|maquina' then 'equipamentos-de-climatizacao' else 'instalacoes-de-climatizacao-e-exaustao' end; end if;
  if n ~ 'dados|voz|cftv|chamada|logica|seguranca patrimonial|\\melo\\M' then return 'dados-e-voz-seguranca-patrimonial-chamada-hospitalar'; end if;
  if n ~ 'custo indireto|gerenciamento|mobilizacao|desmobilizacao' then return 'custos-indiretos'; end if;
  if n ~ 'site planning' then return 'site-planning'; end if;
  if n ~ 'paisag' then return 'paisagismo-e-ou-compensacao-ambiental'; end if;
  if n ~ 'projeto.*legal|legalizacao' then return 'projetos-legalizacao'; end if;
  if n ~ 'projeto|compatibilizacao' then return 'projetos-tecnicos'; end if;
  if n ~ 'inox|coifa' then return 'artefatos-inox'; end if;
  if n ~ 'marcenaria|mobiliario|moveis' then return 'marcenaria'; end if;
  if n ~ 'gerador|subestacao|transform|cubiculo|qgbt|trafo' then return 'gerador-subestacao-transformador-cubiculos'; end if;
  if n ~ 'elevador|plataforma elevatoria' then return 'elevadores-plataforma-elevatoria'; end if;
  if n ~ 'compressor|vacuo|driox' then return 'compressor-bomba-de-vacuo-driox'; end if;
  if n ~ 'it medico|nobreak|autotrafo|estabilizador' then return 'it-medico-nobreak'; end if;
  if n ~ '\\mete\\M|\\meta\\M|tratamento de agua' then return 'ete-eta'; end if;
  if n ~ 'correio pneumatic' then return 'correio-pneumatico'; end if;
  if n ~ 'controle de acesso|catraca' then return 'controle-acessos'; end if;
  if n ~ 'planejamento de obra' then return 'planejamento-obras'; end if;
  if n ~ 'conta de consumo|contas de consumo|conta de energia|contas de energia|conta de agua|contas de agua' then return 'contas-consumo'; end if;
  if n ~ 'comunicacao visual|sinalizacao' then return 'comunicacao-visual-externa-e-interna'; end if;
  if n ~ 'quadro.*eletric|quadros' then return 'quadros-eletricos'; end if;
  if n ~ 'automacao' then return 'sistemas-de-automacao'; end if;
  if n ~ 'blindagem|plumbifer|radiologic' then return 'blindagem'; end if;
  if n ~ 'camara fria|camara frigor' then return 'camara-fria'; end if;
  if n ~ 'aquecimento|boiler' then return 'sistema-de-aquecimento-de-agua'; end if;
  if n ~ 'taxa.*risco' then return 'taxa-risco'; end if;
  if n ~ '\\msic|\\msics|aditivo|\\madt' then return 'sics'; end if;
  if n ~ 'civil|demoli|revestimento|piso|parede|coberta|obra' then return 'adequacoes-civis'; end if;
  if n ~ 'diverso' then return 'diversos'; end if;
  return null;
end $$;

create temporary table dados_evs_input on commit drop as
select (ordinality-1)::integer ordinal,value data
from jsonb_array_elements(convert_from(decode('${payloadBase64}','base64'),'UTF8')::jsonb) with ordinality
where exists(select 1 from public.slt_budget_import_estimates where deleted_at is null);

create temporary table dados_evs_before_counts on commit drop as
select
  (select count(*) from public.slt_budget_demands where deleted_at is null) budget_demands,
  (select count(*) from public.slt_projects_demands where deleted_at is null) project_demands,
  (select count(*) from public.slt_budget_sics where deleted_at is null) budget_sics;

do $$
declare existing_count integer; exact_count integer; input_count integer; removed_count integer;
begin
  select count(*) into input_count from dados_evs_input;
  select count(*) into existing_count from public.slt_budget_import_estimates where deleted_at is null;
  select count(*) into exact_count from dados_evs_input i join public.slt_budget_import_estimates e on e.deleted_at is null and e.extra->>'project'=i.data->>'project';
  select count(*) into removed_count from public.slt_budget_import_estimates e left join dados_evs_input i on i.data->>'project'=e.extra->>'project' where e.deleted_at is null and i.ordinal is null;
  if existing_count=0 then return; end if;
  if input_count<>856 or existing_count<>855 or exact_count<>855 or removed_count<>0 then
    raise exception 'Importação cancelada: entrada %, base %, correspondências exatas %, removidas %',input_count,existing_count,exact_count,removed_count;
  end if;
  if (select count(*) from dados_evs_input group by data->>'project' having count(*)>1 limit 1) is not null then
    raise exception 'Importação cancelada: obra duplicada na entrada';
  end if;
  if exists(select 1 from public.slt_budget_import_estimates where record_key='evh-0856') or exists(select 1 from public.slt_projects_works where record_key='EVW-evh-0856') then
    raise exception 'Importação cancelada: identificadores reservados da 856ª obra já existem';
  end if;
end $$;

create temporary table dados_evs_old_map on commit drop as
select normalized,discipline_id from (
  select pg_temp.ev_text(item->>'description') normalized,item->>'disciplineId' discipline_id,count(*) occurrences,
         row_number() over(partition by pg_temp.ev_text(item->>'description') order by count(*) desc,item->>'disciplineId') rank
  from public.slt_budget_historical_ev_details d cross join lateral jsonb_array_elements(d.items) item
  group by 1,2
) ranked where rank=1;

create temporary table dados_evs_projects on commit drop as
select i.ordinal,i.data,coalesce(e.record_key,'evh-0856') record_key,coalesce(e.work_id,'EVW-evh-0856') work_id,
       e.extra old_extra,w.extra old_work_extra,w.state_code old_state,w.region old_region,
       coalesce(e.extra->>'code',(regexp_match(i.data->>'project','^\\s*([0-9]+)'))[1],'') code,
       coalesce(nullif(e.extra->>'typology',''),case when pg_temp.ev_text(i.data->>'project') ~ 'hospital|\\mho\\M' then 'Hospital' when pg_temp.ev_text(i.data->>'project') ~ 'clinica' then 'Clínica e Medicina Preventiva' when pg_temp.ev_text(i.data->>'project') ~ '\\mpa\\M' then 'Pronto Atendimento' else '' end) typology,
       coalesce(nullif(w.state_code,''),upper((regexp_match(i.data->>'project','[-/_]\\s*(AC|AL|AP|AM|BA|CE|DF|ES|GO|MA|MT|MS|MG|PA|PB|PR|PE|PI|RJ|RN|RS|RO|RR|SC|SP|SE|TO)\\s*$','i'))[1]),'') state_code
from dados_evs_input i
left join public.slt_budget_import_estimates e on e.deleted_at is null and e.extra->>'project'=i.data->>'project'
left join public.slt_projects_works w on w.deleted_at is null and w.record_key=e.work_id;

create temporary table dados_evs_items on commit drop as
select p.ordinal project_ordinal,p.record_key,p.work_id,(item_ordinality-1)::integer item_ordinal,
       item->>'item' item_number,item->>'description' description,(item->>'value')::numeric amount,
       coalesce(pg_temp.known_ev_discipline(item->>'description'),o.discipline_id,pg_temp.infer_ev_discipline(item->>'description'),'outras-linhas-ev') discipline_id,
       pg_temp.ev_text(item->>'description') ~ '(^| )(sic|sics|aditivo|aditivos|adt)( |$)' is_sic
from dados_evs_projects p
cross join lateral jsonb_array_elements(p.data->'items') with ordinality item(item,item_ordinality)
left join dados_evs_old_map o on o.normalized=pg_temp.ev_text(item->>'description');

create temporary table dados_evs_stage on commit drop as
select p.*,
       coalesce((p.data->>'area')::numeric,0) area,
       coalesce((p.data->>'revision'),'') source_revision,
       coalesce(((regexp_match(coalesce(p.data->>'revision',''),'\\d+'))[1])::integer,0) version_number,
       case when coalesce(p.data->>'date','') ~ '^\\d{4}-\\d{2}-\\d{2}' then substring(p.data->>'date',1,10)::date end recorded_on,
       coalesce((select sum(i.amount) from dados_evs_items i where i.record_key=p.record_key),0) total_amount,
       coalesce((select sum(i.amount) from dados_evs_items i where i.record_key=p.record_key and i.discipline_id<>'taxa-risco'),0) base_total,
       (select jsonb_agg(jsonb_build_object('item',i.item_number,'value',i.amount,'description',i.description,'disciplineId',i.discipline_id) order by i.item_ordinal) from dados_evs_items i where i.record_key=p.record_key) items,
       coalesce((select jsonb_agg(jsonb_build_object('item',i.item_number,'value',i.amount,'description',i.description,'disciplineId',i.discipline_id) order by i.item_ordinal) from dados_evs_items i where i.record_key=p.record_key and i.is_sic),'[]'::jsonb) sic_items,
       (select jsonb_object_agg(discipline_id,amount) from (select i.discipline_id,sum(i.amount) amount from dados_evs_items i where i.record_key=p.record_key group by i.discipline_id) disciplines) disciplines,
       case p.state_code
         when 'AC' then 'Norte' when 'AP' then 'Norte' when 'AM' then 'Norte' when 'PA' then 'Norte' when 'RO' then 'Norte' when 'RR' then 'Norte' when 'TO' then 'Norte'
         when 'AL' then 'Nordeste' when 'BA' then 'Nordeste' when 'CE' then 'Nordeste' when 'MA' then 'Nordeste' when 'PB' then 'Nordeste' when 'PE' then 'Nordeste' when 'PI' then 'Nordeste' when 'RN' then 'Nordeste' when 'SE' then 'Nordeste'
         when 'DF' then 'Centro-Oeste' when 'GO' then 'Centro-Oeste' when 'MT' then 'Centro-Oeste' when 'MS' then 'Centro-Oeste'
         when 'ES' then 'Sudeste' when 'MG' then 'Sudeste' when 'RJ' then 'Sudeste' when 'SP' then 'Sudeste'
         when 'PR' then 'Sul' when 'RS' then 'Sul' when 'SC' then 'Sul' else coalesce(p.old_region,'') end region
from dados_evs_projects p;

do $$
begin
  if not exists(select 1 from dados_evs_input) then return; end if;
  if (select count(*) from dados_evs_items)<>9795 then raise exception 'Importação cancelada: quantidade de linhas diferente de 9.795'; end if;
  if exists(select 1 from dados_evs_items where pg_temp.ev_text(description)='obra') then raise exception 'Importação cancelada: ainda existem linhas consolidadas Obra'; end if;
  if exists(select 1 from dados_evs_stage s where abs(s.total_amount-(s.data->>'total')::numeric)>0.02) then raise exception 'Importação cancelada: divergência financeira por obra'; end if;
  if abs((select sum(total_amount) from dados_evs_stage)-1971820022.80)>0.02 then raise exception 'Importação cancelada: total geral divergente'; end if;
end $$;

insert into public.slt_projects_works(
  record_key,revision,ordinal,parent_key,child_fields,field_keys,empty_fields,string_fields,extra,
  created_at,updated_at,updated_by,deleted_at,id,name,code,status,state_code,region,area_m2
)
select s.work_id,1,s.ordinal,null,array['ev'],array['id','nome','codigoOriginal','status','uf','regiao','area'],array[]::text[],array[]::text[],
       jsonb_build_object('chaveUnica',s.code,'tipoUnidade','','tipologiaObra',s.typology,'classificacaoObra','',
         'areaConstruida',s.area,'areaEquivalente',s.area,'_dadosEvsOfficial',true,'historicalRecordId',s.record_key,'source','DADOS EVS'),
       now(),now(),null,null,s.work_id,s.data->>'project',s.code,'Histórico',s.state_code,s.region,s.area
from dados_evs_stage s where s.record_key='evh-0856';

update public.slt_projects_works w set
  revision=w.revision+1,ordinal=s.ordinal,extra=w.extra||jsonb_build_object('areaConstruida',s.area,'areaEquivalente',s.area,'_dadosEvsOfficial',true,'historicalRecordId',s.record_key,'source','DADOS EVS'),
  updated_at=now(),updated_by=null,area_m2=s.area,state_code=coalesce(nullif(w.state_code,''),s.state_code),region=coalesce(nullif(w.region,''),s.region)
from dados_evs_stage s where w.record_key=s.work_id and s.record_key<>'evh-0856' and w.deleted_at is null;

insert into public.slt_budget_import_estimates(
  record_key,revision,ordinal,parent_key,child_fields,field_keys,empty_fields,string_fields,extra,
  created_at,updated_at,updated_by,deleted_at,id,total_amount,status,work_id,version_number
)
select s.record_key,1,s.ordinal,null,array[]::text[],array['id','revision','status','total','workId'],array[]::text[],array[]::text[],
       jsonb_build_object('area',s.area,'code',s.code,'date',s.data->>'date','year',extract(year from s.recorded_on)::integer,
         'items',s.items,'source','DADOS EVS.xlsx','project',s.data->>'project','sicItems',s.sic_items,'typology',s.typology,
         'baseTotal',s.base_total,'itemCount',jsonb_array_length(s.items),'historical',true,'technician',s.data->>'technician',
         'disciplines',s.disciplines,'sourceRevision',s.source_revision),
       now(),now(),null,null,s.record_key,s.total_amount,'Histórico',s.work_id,s.version_number
from dados_evs_stage s where s.record_key='evh-0856';

update public.slt_budget_import_estimates e set
  revision=e.revision+1,ordinal=s.ordinal,
  extra=e.extra||jsonb_build_object('area',s.area,'code',s.code,'date',s.data->>'date','year',extract(year from s.recorded_on)::integer,
    'items',s.items,'source','DADOS EVS.xlsx','project',s.data->>'project','sicItems',s.sic_items,'typology',s.typology,
    'baseTotal',s.base_total,'itemCount',jsonb_array_length(s.items),'historical',true,'technician',s.data->>'technician',
    'disciplines',s.disciplines,'sourceRevision',s.source_revision),
  updated_at=now(),updated_by=null,total_amount=s.total_amount,status='Histórico',work_id=s.work_id,version_number=s.version_number
from dados_evs_stage s where e.record_key=s.record_key and s.record_key<>'evh-0856' and e.deleted_at is null;

insert into public.slt_budget_historical_ev_details(record_key,items,updated_at)
select record_key,items,now() from dados_evs_stage
on conflict(record_key) do update set items=excluded.items,updated_at=excluded.updated_at;

insert into public.slt_budget_estimates(
  record_key,revision,ordinal,parent_key,child_fields,field_keys,empty_fields,string_fields,extra,
  created_at,updated_at,updated_by,deleted_at,id,status,version_number
)
select s.work_id||'/one',1,0,s.work_id,array['lines','versions'],array['id','status','versaoAtual'],array[]::text[],array[]::text[],
       jsonb_build_object('_dadosEvsOfficial',true,'historicalRecordId',s.record_key,'anexos',jsonb_build_array(),'demandaIds',jsonb_build_array(),'sicIds',jsonb_build_array()),
       now(),now(),null,null,'EV-'||s.record_key,'Completo',s.version_number
from dados_evs_stage s where s.record_key='evh-0856';

update public.slt_budget_estimates e set revision=e.revision+1,updated_at=now(),updated_by=null,deleted_at=null,status='Completo',version_number=s.version_number,
  extra=e.extra||jsonb_build_object('_dadosEvsOfficial',true,'historicalRecordId',s.record_key)
from dados_evs_stage s where e.record_key=s.work_id||'/one' and s.record_key<>'evh-0856';

update public.slt_budget_estimate_lines l set deleted_at=now(),updated_at=now(),revision=l.revision+1
where l.deleted_at is null and exists(select 1 from dados_evs_stage s where l.parent_key=s.work_id||'/one');

insert into public.slt_budget_estimate_lines(
  record_key,revision,ordinal,parent_key,child_fields,field_keys,empty_fields,string_fields,extra,
  created_at,updated_at,updated_by,deleted_at,id,discipline_id,status,budgeted_amount,contracted_amount,quantity,unit_amount
)
select s.work_id||'/one/'||d.key,1,row_number() over(partition by s.record_key order by d.key)-1,s.work_id||'/one',array[]::text[],
       array['id','disciplinaId','status','valorOrcado','valorContratado','quantidade','valorUnitario'],array[]::text[],array[]::text[],jsonb_build_object(),
       now(),now(),null,null,'EVL-'||s.record_key||'-'||d.key,d.key,'Orçado',(d.value#>>'{}')::numeric,0,0,0
from dados_evs_stage s cross join lateral jsonb_each(s.disciplines) d
on conflict(record_key) do update set revision=public.slt_budget_estimate_lines.revision+1,ordinal=excluded.ordinal,updated_at=now(),updated_by=null,
  deleted_at=null,id=excluded.id,discipline_id=excluded.discipline_id,status=excluded.status,budgeted_amount=excluded.budgeted_amount,
  contracted_amount=excluded.contracted_amount,quantity=excluded.quantity,unit_amount=excluded.unit_amount;

insert into public.slt_budget_estimate_versions(
  record_key,revision,ordinal,parent_key,child_fields,field_keys,empty_fields,string_fields,extra,
  created_at,updated_at,updated_by,deleted_at,version_number,recorded_on,origin,total_amount,cost_m2
)
select s.work_id||'/one/0',1,0,s.work_id||'/one',array[]::text[],array['numero','data','origem','valorTotal','custoM2'],array[]::text[],array[]::text[],jsonb_build_object(),
       now(),now(),null,null,s.version_number,s.recorded_on,'Importado de DADOS EVS',s.total_amount,case when s.area>0 then s.total_amount/s.area else 0 end
from dados_evs_stage s
on conflict(record_key) do update set revision=public.slt_budget_estimate_versions.revision+1,updated_at=now(),updated_by=null,deleted_at=null,
  version_number=excluded.version_number,recorded_on=excluded.recorded_on,origin=excluded.origin,total_amount=excluded.total_amount,cost_m2=excluded.cost_m2;

do $$
declare historical_count integer; works_count integer; estimates_count integer; details_count integer; detail_lines integer;
begin
  if not exists(select 1 from dados_evs_input) then return; end if;
  select count(*) into historical_count from public.slt_budget_import_estimates where deleted_at is null;
  select count(*) into works_count from public.slt_projects_works where deleted_at is null and extra->>'_dadosEvsOfficial'='true';
  select count(*) into estimates_count from public.slt_budget_estimates e join public.slt_projects_works w on w.record_key=e.parent_key and w.deleted_at is null and w.extra->>'_dadosEvsOfficial'='true' where e.deleted_at is null;
  select count(*),coalesce(sum(jsonb_array_length(d.items)),0) into details_count,detail_lines from public.slt_budget_historical_ev_details d join public.slt_budget_import_estimates e using(record_key) where e.deleted_at is null;
  if historical_count<>856 or works_count<>856 or estimates_count<>856 or details_count<>856 or detail_lines<>9795 then
    raise exception 'Atualização inconsistente: históricos %, obras %, EVs %, detalhes %, linhas %',historical_count,works_count,estimates_count,details_count,detail_lines;
  end if;
  if exists(select 1 from public.slt_budget_import_estimates e left join public.slt_projects_works w on w.record_key=e.work_id and w.deleted_at is null where e.deleted_at is null and w.record_key is null) then raise exception 'Atualização inconsistente: EV histórico sem obra'; end if;
  if exists(select 1 from public.slt_budget_historical_ev_details d join public.slt_budget_import_estimates e using(record_key) cross join lateral jsonb_array_elements(d.items) item where e.deleted_at is null and pg_temp.ev_text(item->>'description')='obra') then raise exception 'Atualização inconsistente: linha Obra permaneceu'; end if;
  if exists(select 1 from dados_evs_before_counts b where b.budget_demands<>(select count(*) from public.slt_budget_demands where deleted_at is null) or b.project_demands<>(select count(*) from public.slt_projects_demands where deleted_at is null) or b.budget_sics<>(select count(*) from public.slt_budget_sics where deleted_at is null)) then raise exception 'Atualização inconsistente: demandas ou SICs foram alteradas'; end if;
  if abs((select sum(total_amount) from public.slt_budget_import_estimates where deleted_at is null)-1971820022.80)>0.02 then raise exception 'Atualização inconsistente: total financeiro final divergente'; end if;
end $$;

commit;
`;

await fs.mkdir(outputDir, { recursive: true });
await fs.writeFile(path.join(outputDir, 'dados-evs-payload.json'), JSON.stringify(payload));
await fs.writeFile(path.join(outputDir, 'audit.sql'), auditSql);
await fs.writeFile(path.join(outputDir, 'mapping-audit.sql'), mappingAuditSql);
await fs.writeFile(path.join(outputDir, 'migration.sql'), migrationSql);
await fs.writeFile(path.join(outputDir, 'manifest.json'), JSON.stringify({
  source, sheetName, projects: projects.length, items: itemCount, total: payload.total,
  zeroAreaProjects: payload.zeroAreaProjects, consolidatedObraRows: consolidatedObraRows.length,
}, null, 2));
console.log(JSON.stringify({ outputDir, ...JSON.parse(await fs.readFile(path.join(outputDir, 'manifest.json'), 'utf8')) }, null, 2));
