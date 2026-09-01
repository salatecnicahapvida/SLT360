export const MODULE_OPTIONS = [
 {id:'projects',ui:'projects',label:'Projetos'},
 {id:'budget',ui:'works',label:'Orçamento'},
 {id:'maintenance',ui:'maintenance',label:'Manutenção'},
 {id:'clinical',ui:'clinical',label:'Engenharia Clínica'},
 {id:'finance',ui:'budget',label:'Controle de Verba'},
];
export function moduleAllowed(profile,module,writing=false) {
 if (!profile?.ativo || profile.must_change_password !== false) return false;
 return profile.perfil==='Admin' || (module!=='core' && profile.access?.some(g=>g.module===module && g.can_read && (!writing || g.can_write))===true);
}
export function entityWritable(profile,entity) {
 return moduleAllowed(profile,entity.module,true) || (entity.name==='projects_works' && moduleAllowed(profile,'budget',true));
}
export function decorateProfile(profile) {
 return {...profile,status:profile.ativo?'Ativo':'Inativo',accessModules:[...MODULE_OPTIONS.filter(m=>moduleAllowed(profile,m.id)).map(m=>m.ui),...(moduleAllowed(profile,'core')?['settings']:[])]};
}
