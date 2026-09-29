import test from 'node:test';
import assert from 'node:assert/strict';
import {decorateProfile,moduleAllowed} from '../src/access.js';

test('Gestor acessa Configurações sem liberar o módulo para Analista',()=>{
 const gestor=decorateProfile({ativo:true,perfil:'Gestor',must_change_password:false,access:[]});
 assert.equal(moduleAllowed(gestor,'core'),true);
 assert.equal(moduleAllowed(gestor,'core',true),true);
 assert.equal(gestor.accessModules.includes('settings'),true);

 const analista=decorateProfile({ativo:true,perfil:'Analista',must_change_password:false,access:[]});
 assert.equal(moduleAllowed(analista,'core'),false);
 assert.equal(analista.accessModules.includes('settings'),false);
});
