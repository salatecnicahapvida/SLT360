alter policy attachment_scoped_insert
on public.slt360_attachments
with check (
  created_by = (select auth.uid())
  and (public.slt360_is_admin() or public.slt_has_module_access(module, true))
);

alter policy attachment_scoped_delete
on public.slt360_attachments
using (
  created_by = (select auth.uid())
  and (public.slt360_is_admin() or public.slt_has_module_access(module, true))
);
