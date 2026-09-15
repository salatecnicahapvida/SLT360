-- Permite desfazer o registro de metadados quando o upload binário falha.
-- A exclusão fica restrita ao autor do anexo e exige permissão de escrita no módulo.

grant delete on public.slt360_attachments to authenticated;

drop policy if exists attachment_scoped_delete on public.slt360_attachments;
create policy attachment_scoped_delete on public.slt360_attachments
for delete to authenticated
using (
  created_by = auth.uid()
  and (public.slt360_is_admin() or public.slt_has_module_access(module, true))
);
