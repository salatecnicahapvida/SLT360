begin;
-- Older published clients do not know the new entities. Keep them readable
-- during rollout; the current client explicitly advertises its catalog.
do $compat$
declare definition text; old_clause text='if public.slt_entity_access(e.name,false) then'; new_clause text;
begin
 select pg_get_functiondef('public.slt_module_load(text)'::regprocedure) into definition;
 if position(old_clause in definition)=0 then raise exception 'Loader signature changed; review compatibility migration'; end if;
 new_clause := 'if public.slt_entity_access(e.name,false) and (e.name not in (''budget_ev_typologies'',''budget_ev_targets'',''budget_strategic_targets'',''budget_hidden_estimates'',''budget_approval_works'',''budget_approval_weeks'',''budget_approval_snapshots'') or coalesce(nullif(current_setting(''request.headers'',true),''''),''{}'')::jsonb->>''x-client-info''=''unified-1'') then';
 execute replace(definition,old_clause,new_clause);
end $compat$;
commit;
