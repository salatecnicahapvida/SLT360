import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { database, seed, admin } from './helpers/database.mjs';

const analyst = '66666666-6666-4666-8666-666666666666';
const manager = '77777777-7777-4777-8777-777777777777';

test('analista altera demandas existentes, mas não cria, exclui, arquiva ou restaura', async () => {
  const db = await database();
  try {
    const payload = { state: {
      works: [{ id: 'work-1', nome: 'Obra', ev: { id: 'ev-1', lines: [], versions: [] } }],
      projectDemands: [{ id: 'project-1', titulo: 'Projeto legado', obraId: 'work-1', status: 'planejado' }],
      demands: [
        { id: 'budget-1', titulo: 'Orçamento', obraId: 'work-1', coluna: 'fazer' },
        { id: 'sic-works-validation', titulo: 'SIC aguardando validação Obras', obraId: 'work-1', tipo: 'SIC', coluna: 'validacaoObras', valorGerado: 25 },
        { id: 'sic-validated', titulo: 'SIC validada', obraId: 'work-1', tipo: 'SIC', coluna: 'validadoObras' },
        { id: 'sic-approval', titulo: 'SIC aprovação', obraId: 'work-1', tipo: 'SIC', coluna: 'aprovacaoDiretoria' },
        { id: 'sic-waiver', titulo: 'SIC com dispensa', obraId: 'work-1', tipo: 'SIC', coluna: 'aprovacaoDiretoria' },
        { id: 'sic-unapproved', titulo: 'SIC sem aprovação', obraId: 'work-1', tipo: 'SIC', coluna: 'fazendo' },
      ],
      maintenanceDemands: [
        { id: 'maintenance-1', titulo: 'Predial', centroCusto: 'Manutenção predial', coluna: 'naoIniciado', historico: [] },
        { id: 'clinical-1', titulo: 'Clínica', centroCusto: 'Engenharia clínica', coluna: 'naoIniciado', historico: [] },
      ],
    }, datasets: {} };
    await seed(db, payload);
    await db.exec(await fs.readFile(new URL('../supabase/migrations/202608310005_users_team.sql', import.meta.url), 'utf8'));
    await db.exec(await fs.readFile(new URL('../supabase/migrations/20260909174742_restrict_analyst_demand_lifecycle.sql', import.meta.url), 'utf8'));
    await db.exec(await fs.readFile(new URL('../supabase/migrations/20260910143000_reassert_gestor_demand_permissions.sql', import.meta.url), 'utf8'));
    await db.exec(await fs.readFile(new URL('../supabase/migrations/20260915132500_demand_completion_and_server_audit.sql', import.meta.url), 'utf8'));
    await db.exec(await fs.readFile(new URL('../supabase/migrations/20260922084500_enforce_sic_director_flow.sql', import.meta.url), 'utf8'));
    await db.exec(await fs.readFile(new URL('../supabase/migrations/20260923170000_shift_sic_director_gate_to_validated_works.sql', import.meta.url), 'utf8'));
    await db.exec(await fs.readFile(new URL('../supabase/migrations/20260925130000_relink_tea_aracaju_and_require_sic_values.sql', import.meta.url), 'utf8'));
    await db.exec(await fs.readFile(new URL('../supabase/migrations/20260925151000_allow_audited_sic_director_waiver.sql', import.meta.url), 'utf8'));
    await db.exec(await fs.readFile(new URL('../supabase/migrations/20260928182951_relax_sic_works_validation_and_lock_director_approval.sql', import.meta.url), 'utf8'));
    await db.query('insert into auth.users(id) values($1),($2)', [analyst, manager]);
    await db.query("insert into slt360_profiles(id,nome,perfil,must_change_password) values($1,'Analista teste','Analista',false),($2,'Gestor teste','Gestor',false)", [analyst, manager]);
    for (const module of ['budget', 'maintenance', 'clinical']) {
      await db.query('insert into slt_core_module_access(user_id,module,can_read,can_write) values($1,$2,true,true)', [analyst, module]);
    }
    await db.query("insert into slt_core_module_access(user_id,module,can_read,can_write) values($1,'budget',true,true)", [manager]);

    const as = async (role, id = '') => {
      await db.exec('reset role');
      await db.query("select set_config('request.jwt.claim.sub',$1,false)", [id]);
      await db.exec(`set role ${role}`);
    };
    const change = (entity, key, document, expected_revision = 1, operation = 'upsert') => ({
      entity, key, document, expected_revision, operation, ordinal: 0, child_fields: [],
    });
    const commit = changes => db.query('select slt_commit_changes(gen_random_uuid(),$1)', [JSON.stringify(changes)]);

    await as('authenticated', analyst);
    const updates = [
      change('budget_demands', 'budget-1', { ...payload.state.demands[0], coluna: 'fazendo' }),
      { ...change('maintenance_orders', 'maintenance-1', { id: 'maintenance-1', titulo: 'Predial ajustada', centroCusto: 'Manutenção predial', coluna: 'naoIniciado' }), child_fields: ['historico'] },
      { ...change('clinical_orders', 'clinical-1', { id: 'clinical-1', titulo: 'Clínica ajustada', centroCusto: 'Engenharia clínica', coluna: 'naoIniciado' }), child_fields: ['historico'] },
    ];
    await commit(updates);
    assert.equal((await db.query("select phase from slt_budget_demands where record_key='budget-1'")).rows[0].phase, 'fazendo');

    const inserts = [
      change('budget_demands', 'budget-new', { id: 'budget-new', titulo: 'Novo orçamento', obraId: 'work-1' }, 0),
      change('maintenance_orders', 'maintenance-new', { id: 'maintenance-new', titulo: 'Nova manutenção', centroCusto: 'Manutenção predial' }, 0),
      change('clinical_orders', 'clinical-new', { id: 'clinical-new', titulo: 'Nova clínica', centroCusto: 'Engenharia clínica' }, 0),
    ];
    for (const insert of inserts) await assert.rejects(commit([insert]), { code: '42501' });

    // A validação de Obras confirma apenas a etapa. Não há valor de validação
    // obrigatório nem objeto sicWorksValidation a preencher.
    await commit([
      change('budget_demands', 'sic-works-validation', { ...payload.state.demands[1], coluna: 'validadoObras' }),
    ]);
    assert.equal((await db.query("select phase from slt_budget_demands where record_key='sic-works-validation'")).rows[0].phase, 'validadoObras');

    await assert.rejects(commit([
      change('budget_demands', 'sic-validated', { ...payload.state.demands[2], coluna: 'aprovacaoDiretoria' }),
    ]), { code: '42501' });

    await assert.rejects(commit([
      change('budget_demands', 'sic-approval', { ...payload.state.demands[3], coluna: 'aprovadoDiretoria', valorGerado: 0, sicDirectorDecision: { version: 1, finalAmount: 0 } }),
    ]), { code: '42501' });

    const directorWaiver = {
      version: 1,
      reason: 'SIC aprovada diretamente sem reunião da Diretoria.',
      waivedAt: '2026-09-25T15:00:00.000Z',
      waivedBy: 'Gestor teste',
      waivedById: manager,
    };
    await assert.rejects(commit([
      change('budget_demands', 'sic-waiver', { ...payload.state.demands[4], sicDirectorWaiver: { ...directorWaiver, waivedBy: 'Analista teste', waivedById: analyst } }),
    ]), { code: '42501' });

    await as('authenticated', manager);
    await commit([change('budget_demands', 'budget-manager', { id: 'budget-manager', titulo: 'Criado pelo Gestor', obraId: 'work-1' }, 0)]);
    assert.equal((await db.query("select count(*)::integer as count from slt_budget_demands where record_key='budget-manager' and deleted_at is null")).rows[0].count, 1);

    await assert.rejects(commit([
      change('budget_demands', 'sic-unapproved', { ...payload.state.demands[5], coluna: 'concluido', dataEntregaReal: '2026-09-22' }),
    ]), { code: '42501' });

    await commit([
      change('budget_demands', 'sic-validated', { ...payload.state.demands[2], coluna: 'aprovacaoDiretoria' }),
    ]);

    await commit([
      change('budget_demands', 'sic-approval', { ...payload.state.demands[3], coluna: 'aprovadoDiretoria', valorGerado: 0, sicDirectorDecision: { version: 1, finalAmount: 0 } }),
    ]);
    assert.equal((await db.query("select phase from slt_budget_demands where record_key='sic-approval'")).rows[0].phase, 'aprovadoDiretoria');

    await commit([
      change('budget_demands', 'sic-waiver', { ...payload.state.demands[4], sicDirectorWaiver: directorWaiver }),
    ]);

    // Depois da aprovação efetiva por Gestor/Admin, o Analista pode concluir a
    // demanda, desde que cumpra as obrigatoriedades de conclusão.
    await as('authenticated', analyst);
    await commit([
      change('budget_demands', 'sic-approval', { ...payload.state.demands[3], coluna: 'concluido', dataEntregaReal: '2026-09-22', valorGerado: 0, sicDirectorDecision: { version: 1, finalAmount: 0 } }, 2),
    ]);
    assert.equal((await db.query("select phase from slt_budget_demands where record_key='sic-approval'")).rows[0].phase, 'concluido');

    await assert.rejects(commit([
      change('budget_demands', 'sic-waiver', { ...payload.state.demands[4], sicDirectorWaiver: directorWaiver, coluna: 'concluido', dataEntregaReal: '2026-09-25' }, 2),
    ]), { code: '42501' });

    await assert.rejects(commit([
      change('budget_demands', 'budget-1', {}, 2, 'delete'),
      change('budget_archived_demands', 'budget-1', { id: 'budget-1', titulo: 'Orçamento' }, 0),
    ]), { code: '42501' });
    await assert.rejects(commit([change('maintenance_orders', 'maintenance-1', {}, 2, 'delete')]), { code: '42501' });
    await assert.rejects(commit([change('clinical_orders', 'clinical-1', {}, 2, 'delete')]), { code: '42501' });

    await as('authenticated', manager);
    await commit([
      change('budget_demands', 'sic-waiver', { ...payload.state.demands[4], sicDirectorWaiver: directorWaiver, coluna: 'concluido', dataEntregaReal: '2026-09-25' }, 2),
    ]);
    assert.equal((await db.query("select phase from slt_budget_demands where record_key='sic-waiver'")).rows[0].phase, 'concluido');

    await as('authenticated', admin);
    await commit([change('budget_demands', 'budget-admin', { id: 'budget-admin', titulo: 'Criado pela administração', obraId: 'work-1' }, 0)]);
    assert.equal((await db.query("select count(*)::integer as count from slt_budget_demands where record_key='budget-admin' and deleted_at is null")).rows[0].count, 1);
  } finally {
    await db.close();
  }
});
