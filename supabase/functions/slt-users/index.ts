import { createClient } from 'npm:@supabase/supabase-js@2.112.4';
import { createUserHandler } from './handler.js';
const secretKeys=JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS')||'{}');
const serverKey=secretKeys.default||Object.values(secretKeys)[0]||Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
if(!serverKey)throw new Error('Credencial do servidor indisponível');
const admin=createClient(Deno.env.get('SUPABASE_URL')!,String(serverKey),{auth:{persistSession:false,autoRefreshToken:false}});
Deno.serve(createUserHandler(admin,'https://salatecnicahapvida.github.io'));
