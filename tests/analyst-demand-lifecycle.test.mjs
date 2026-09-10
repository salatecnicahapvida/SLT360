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
      projectDemands: [{ id: 'project-1', titulo: 'Projeto', obraId: 'work-1', status: 'planejado' }],
      demands: [{ id: 'budget-1', titulo: 'Orçamento', obraId: 'work-1', coluna: 'fazer' }],
      maintenanceDemands: [
        { id: 'maintenance-1', titulo: 'Predial', centroCusto: 'Manutenção predial', coluna: 'naoIniciado', historico: [] },
        { id: 'clinical-1', titulo: 'Clínica', centroCusto: 'Engenharia clínica', coluna: 'naoIniciado', historico: [] },
      ],
    }, datasets: {} };
    await seed(db, payload);
    await db.exec(await fs.readFile(new URL('../supabase/migrations/202608310005_users_team.sql', import.meta.url), 'utf8'));
    await db.exec(await fs.readFile(new URL('../supabase/migrations/20260909174742_restrict_analyst_demand_lifecycle.sql', import.meta.url), 'utf8'));
    await db.exec(await fs.readFile(new URL('../supabase/migrations/20260910143000_reassert_gestor_demand_permissions.sql', import.meta.url), 'utf8'));
    await db.query('insert into auth.users(id) values($1),($2)', [analyst, manager]);
    await db.query("insert into slt360_profiles(id,nome,perfil,must_change_password) values($1,'Analista teste','Analista',false),($2,'Gestor teste','Gestor',false)", [analyst, manager]);
    for (const module of ['projects', 'budget', 'maintenance', 'clinical']) {
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
      change('projects_demands', 'project-1', { ...payload.state.projectDemands[0], titulo: 'Projeto ajustado' }),
      change('budget_demands', 'budget-1', { ...payload.state.demands[0], coluna: 'fazendo' }),
      { ...change('maintenance_orders', 'maintenance-1', { id: 'maintenance-1', titulo: 'Predial ajustada', centroCusto: 'Manutenção predial', coluna: 'naoIniciado' }), child_fields: ['historico'] },
      { ...change('clinical_orders', 'clinical-1', { id: 'clinical-1', titulo: 'Clínica ajustada', centroCusto: 'Engenharia clínica', coluna: 'naoIniciado' }), child_fields: ['historico'] },
    ];
    await commit(updates);
    assert.equal((await db.query("select title from slt_projects_demands where record_key='project-1'")).rows[0].title, 'Projeto ajustado');
    assert.equal((await db.query("select phase from slt_budget_demands where record_key='budget-1'")).rows[0].phase, 'fazendo');

    const inserts = [
      change('projects_demands', 'project-new', { id: 'project-new', titulo: 'Novo projeto', obraId: 'work-1' }, 0),
      change('budget_demands', 'budget-new', { id: 'budget-new', titulo: 'Novo orçamento', obraId: 'work-1' }, 0),
      change('maintenance_orders', 'maintenance-new', { id: 'maintenance-new', titulo: 'Nova manutenção', centroCusto: 'Manutenção predial' }, 0),
      change('clinical_orders', 'clinical-new', { id: 'clinical-new', titulo: 'Nova clínica', centroCusto: 'Engenharia clínica' }, 0),
    ];
    for (const insert of inserts) await assert.rejects(commit([insert]), { code: '42501' });

    await as('authenticated', manager);
    await commit([change('budget_demands', 'budget-manager', { id: 'budget-manager', titulo: 'Criado pelo Gestor', obraId: 'work-1' }, 0)]);
    assert.equal((await db.query("select count(*)::integer as count from slt_budget_demands where record_key='budget-manager' and deleted_at is null")).rows[0].count, 1);

    await as('authenticated', analyst);

    await assert.rejects(commit([change('projects_demands', 'project-1', {}, 2, 'delete')]), { code: '42501' });
    await assert.rejects(commit([
      change('budget_demands', 'budget-1', {}, 2, 'delete'),
      change('budget_archived_demands', 'budget-1', { id: 'budget-1', titulo: 'Orçamento' }, 0),
    ]), { code: '42501' });
    await assert.rejects(commit([change('maintenance_orders', 'maintenance-1', {}, 2, 'delete')]), { code: '42501' });
    await assert.rejects(commit([change('clinical_orders', 'clinical-1', {}, 2, 'delete')]), { code: '42501' });

    await as('authenticated', admin);
    await commit([change('projects_demands', 'project-admin', { id: 'project-admin', titulo: 'Criado pela gestão', obraId: 'work-1' }, 0)]);
    assert.equal((await db.query("select count(*)::integer as count from slt_projects_demands where record_key='project-admin' and deleted_at is null")).rows[0].count, 1);
  } finally {
    await db.close();
  }
});
