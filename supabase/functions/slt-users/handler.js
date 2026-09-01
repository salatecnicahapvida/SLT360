// Nenhuma senha, chave ou token deve ser registrado em logs.
export function createUserHandler(admin,allowedOrigin) {
 return async request=>{
  const origin=request.headers.get('origin');
  const headers={'Cache-Control':'no-store','Content-Type':'application/json','Vary':'Origin',
   ...(origin===allowedOrigin?{'Access-Control-Allow-Origin':allowedOrigin}:{}),
   'Access-Control-Allow-Headers':'authorization, apikey, x-client-info, content-type','Access-Control-Allow-Methods':'POST, OPTIONS'};
  const reply=(status,body)=>new Response(JSON.stringify(body),{status,headers});
  if(origin&&origin!==allowedOrigin)return reply(403,{error:'Origem não autorizada.'});
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers});
  if(request.method!=='POST')return reply(405,{error:'Método não permitido.'});
  try{
   const authorization=request.headers.get('authorization')||'';
   if(!authorization.startsWith('Bearer '))return reply(401,{error:'Entre novamente para continuar.'});
   const {data:auth,error:authError}=await admin.auth.getUser(authorization.slice(7));
   if(authError||!auth?.user)return reply(401,{error:'Sessão inválida. Entre novamente.'});
   const {data:profile,error:profileError}=await admin.from('slt360_profiles').select('id,perfil,ativo,must_change_password').eq('id',auth.user.id).maybeSingle();
   if(profileError||!profile?.ativo||profile.perfil!=='Admin'||profile.must_change_password!==false)return reply(403,{error:'Apenas administradores podem criar usuários.'});
   const bodyText=await request.text();if(bodyText.length>8192)return reply(413,{error:'Cadastro muito grande.'});
   let body;try{body=JSON.parse(bodyText);}catch{return reply(400,{error:'Cadastro inválido.'});}
   const email=String(body.email||'').trim().toLowerCase(),d=body.details;
   if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254||!d||typeof d.nome!=='string'||d.nome.trim().length<2||d.nome.length>160||!['Admin','Gestor','Analista'].includes(d.perfil)||typeof d.ativo!=='boolean'||!Array.isArray(d.access)||d.access.length>5)return reply(400,{error:'Revise nome, e-mail, perfil e permissões.'});
   const modules=new Set();
   for(const g of d.access){if(!g||!['projects','budget','maintenance','clinical','finance'].includes(g.module)||modules.has(g.module)||typeof g.can_read!=='boolean'||typeof g.can_write!=='boolean'||g.can_write&&!g.can_read)return reply(400,{error:'Permissões inválidas.'});modules.add(g.module);}
   // Criptograficamente aleatória; caracteres fixos garantem as classes exigidas no primeiro acesso.
   const temporary_password='Aa9!'+Array.from(crypto.getRandomValues(new Uint8Array(20)),n=>n.toString(16).padStart(2,'0')).join('');
   const {data:created,error:createError}=await admin.auth.admin.createUser({email,password:temporary_password,email_confirm:true,user_metadata:{name:d.nome.trim()}});
   if(createError||!created?.user)return reply(createError?.code==='email_exists'||createError?.code==='email_already_exists'?409:400,{error:'Não foi possível criar a conta. Confira se o e-mail já está cadastrado.'});
   const id=created.user.id;
   const {error:saveError}=await admin.rpc('slt_service_create_profile',{actor_id:auth.user.id,target_id:id,details:d});
   if(saveError){
    // Em resposta incerta, confirme antes de desfazer SOMENTE a conta recém-criada.
    const check=await admin.from('slt360_profiles').select('id').eq('id',id).maybeSingle();
    if(check.error)return reply(503,{error:'Não foi possível confirmar a conclusão. Atualize a lista antes de repetir.'});
    if(!check.data){
     const removed=await admin.auth.admin.deleteUser(id);
     if(removed.error)return reply(503,{error:'A conta ficou sem acesso ao sistema. O responsável deve revisar o cadastro no Supabase antes de repetir.'});
     return reply(400,{error:saveError.code==='23505'?'Analista já vinculado ou nome repetido. Revise a associação.':'Cadastro não concluído. Revise os dados e a associação do analista.'});
    }
   }
   return reply(201,{id,email,temporary_password});
  }catch{return reply(503,{error:'Falha de conexão. Confira a lista de usuários antes de repetir o cadastro.'});}
 };
}
