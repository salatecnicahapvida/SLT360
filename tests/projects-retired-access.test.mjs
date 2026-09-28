import test from 'node:test';
import assert from 'node:assert/strict';
import { MODULE_OPTIONS, decorateProfile, entityWritable, moduleAllowed } from '../src/access.js';

const activeProfile = {
  ativo: true,
  must_change_password: false,
  perfil: 'Analista',
  access: [
    { module: 'projects', can_read: true, can_write: true },
    { module: 'budget', can_read: true, can_write: true },
  ],
};

test('Projetos permanece técnico, mas não é mais módulo operacional de acesso', () => {
  const projects = MODULE_OPTIONS.find(module => module.id === 'projects');
  assert.equal(projects?.visible, false);
  assert.equal(projects?.retired, true);
  assert.equal(moduleAllowed(activeProfile, 'projects'), false);
  assert.equal(moduleAllowed({ ...activeProfile, perfil: 'Admin' }, 'projects'), false);
  assert.equal(decorateProfile(activeProfile).accessModules.includes('projects'), false);
});

test('projects_works herda escrita de Obras sem reativar o módulo Projetos', () => {
  assert.equal(entityWritable(activeProfile, { name: 'projects_works', module: 'projects' }), true);
  assert.equal(entityWritable(activeProfile, { name: 'projects_demands', module: 'projects' }), false);
});
