# Mapa do banco modular

Cada linha abaixo representa uma tabela física no Supabase. Dados operacionais ficam somente no banco privado.

| Módulo | Tabelas |
|---|---:|
| Cadastros compartilhados | 5 |
| Projetos | 8 |
| Orçamento | 13 |
| Manutenção | 7 |
| Engenharia Clínica | 5 |
| Controle de Verbas | 16 |

## Cadastros compartilhados

| Tabela | Campos principais | Vínculos |
|---|---|---|
| `slt_core_units` | unit_code, type, tax_id, postal_code, city, name | — |
| `slt_core_suppliers` | id, name, tax_id, email, phone, status | — |
| `slt_core_sprints` | id, name, starts_on, ends_on, status | — |
| `slt_core_history` | id, entity_type, entity_id, field_name, actor_name, occurred_at | — |
| `slt_core_source_unit_registry_data` | Metadados da origem / atributos do registro | — |

## Projetos

| Tabela | Campos principais | Vínculos |
|---|---|---|
| `slt_projects_works` | id, name, code, unit_name, status, tax_id, state_code, city, region, internal_order, planned_start, planned_end, planned_amount, contracted_amount, realized_amount, area_m2 | — |
| `slt_projects_demands` | id, title, work_id, work_name, phase, type, sprint_id, priority, assignee, planned_start, actual_start, due_date, delivered_on, notes | projects_works, core_sprints |
| `slt_projects_plan_stages` | work_code, stage_code, work_name, stage, stage_order, planned_start, planned_end, status, state_code, region | — |
| `slt_projects_stage_status` | Metadados da origem / atributos do registro | — |
| `slt_projects_commission_readings` | id, work_code, work_name, month, status, technical_amount, negotiated_amount, amendments_amount, area_m2 | — |
| `slt_projects_import_revisions` | id, work_id, version_number, reason, snapshot | projects_works |
| `slt_projects_source_investment_plan_data` | Metadados da origem / atributos do registro | — |
| `slt_projects_source_commission_obras_data` | Metadados da origem / atributos do registro | — |

## Orçamento

| Tabela | Campos principais | Vínculos |
|---|---|---|
| `slt_budget_demands` | id, title, work_id, work_name, phase, type, sprint_id, priority, assignee, planned_start, actual_start, due_date, delivered_on, notes | projects_works, core_sprints |
| `slt_budget_estimates` | id, status, version_number | projects_works |
| `slt_budget_estimate_lines` | id, discipline_id, status, budgeted_amount, contracted_amount, quantity, unit_amount | budget_estimates |
| `slt_budget_estimate_versions` | version_number, recorded_on, origin, total_amount, cost_m2 | budget_estimates |
| `slt_budget_sics` | id, work_id, demand_id, sic_number, title, status, reason, opened_on, approved_on, approved_by | projects_works, budget_demands |
| `slt_budget_sic_items` | discipline_id, previous_amount, new_amount, delta_amount | budget_sics |
| `slt_budget_contracts` | id, work_id, supplier_id, discipline_id, contract_number, amount, contracted_on | projects_works, core_suppliers |
| `slt_budget_revisions` | id, work_id, obra_id, reason | projects_works, projects_works |
| `slt_budget_import_estimates` | id, work_id, status, total_amount, version_number | projects_works |
| `slt_budget_archived_demands` | id, title, work_id, work_name, phase, type, sprint_id, priority, assignee, planned_start, actual_start, due_date, delivered_on, notes | projects_works, core_sprints |
| `slt_budget_sic_readings` | work_code, work_name, sic_number, discipline, amount, posted_on, sprint_name, state_code, movement | — |
| `slt_budget_sprint_readings` | sprint_name, planned_count, extra_count, total_count, delivered_count | — |
| `slt_budget_source_sic_bi_data` | Metadados da origem / atributos do registro | — |

## Manutenção

| Tabela | Campos principais | Vínculos |
|---|---|---|
| `slt_maintenance_orders` | id, service_order, source_code, title, unit_name, unit_key, cost_center, phase, state_code, region, expense_type, demand_type, sprint_id, assignee, priority, started_on, finished_on, due_date, proposed_amount, technical_amount, negotiated_amount, internal_order, notes | core_units, core_sprints |
| `slt_maintenance_order_events` | phase, occurred_on, notes | maintenance_orders |
| `slt_maintenance_archived_orders` | id, service_order, source_code, title, unit_name, unit_key, cost_center, phase, state_code, region, expense_type, demand_type, sprint_id, assignee, priority, started_on, finished_on, due_date, proposed_amount, technical_amount, negotiated_amount, internal_order, notes, asset_id | core_units, core_sprints, clinical_assets |
| `slt_maintenance_source_readings` | source_code, service_order, unit_name, work_name, cost_center, phase, proposed_amount, technical_amount | — |
| `slt_maintenance_investments` | work_name, cost_line, amount | — |
| `slt_maintenance_cost_lines` | work_name, cost_line, amount | — |
| `slt_maintenance_source_maintenance_data` | Metadados da origem / atributos do registro | — |

## Engenharia Clínica

| Tabela | Campos principais | Vínculos |
|---|---|---|
| `slt_clinical_assets` | id, name, asset_tag, serial_number, manufacturer, model, unit_name, unit_key, status | core_units |
| `slt_clinical_orders` | id, service_order, source_code, title, unit_name, unit_key, cost_center, phase, state_code, region, expense_type, demand_type, sprint_id, assignee, priority, started_on, finished_on, due_date, proposed_amount, technical_amount, negotiated_amount, internal_order, notes, asset_id | core_units, core_sprints, clinical_assets |
| `slt_clinical_order_events` | phase, occurred_on, notes | clinical_orders |
| `slt_clinical_archived_orders` | id, service_order, source_code, title, unit_name, unit_key, cost_center, phase, state_code, region, expense_type, demand_type, sprint_id, assignee, priority, started_on, finished_on, due_date, proposed_amount, technical_amount, negotiated_amount, internal_order, notes, asset_id | core_units, core_sprints, clinical_assets |
| `slt_clinical_source_readings` | source_code, service_order, unit_name, work_name, cost_center, phase, proposed_amount, technical_amount | — |

## Controle de Verbas

| Tabela | Campos principais | Vínculos |
|---|---|---|
| `slt_finance_funds` | id, work_id, code, type, fiscal_year, account, cost_center, status, requested_amount, approved_amount, committed_amount, used_amount | projects_works |
| `slt_finance_movements` | id, fund_id, work_id, type, amount, value_amount, occurred_on | finance_funds, projects_works |
| `slt_finance_manual_orders` | internal_order, description, planned_amount, assigned_amount, available_amount, fiscal_year, work_name, work_id | projects_works |
| `slt_finance_internal_orders` | internal_order, description, planned_amount, assigned_amount, available_amount, fiscal_year, work_name, work_id | projects_works |
| `slt_finance_order_classifications` | internal_order, description, work_name, budget_category, executive_group | — |
| `slt_finance_transfers` | source_code, destination_code, document_number, amount, occurred_on, reason | — |
| `slt_finance_consumption_entries` | internal_order, work_name, amount, posted_on, supplier_name, document_number, category | — |
| `slt_finance_consumption_by_oi` | label, amount | — |
| `slt_finance_consumption_by_month` | label, amount | — |
| `slt_finance_consumption_by_month_planned` | label, amount | — |
| `slt_finance_consumption_by_month_unplanned` | label, amount | — |
| `slt_finance_consumption_by_month_oper` | label, amount | — |
| `slt_finance_consumption_by_category` | label, amount | — |
| `slt_finance_consumption_by_cost_center` | label, amount | — |
| `slt_finance_source_capex_control_data` | Metadados da origem / atributos do registro | — |
| `slt_finance_source_hapcapex_reference` | Metadados da origem / atributos do registro | — |

Todas as entidades têm chave primária, revisão por registro, data de criação/alteração, responsável pela alteração e exclusão lógica. Tabelas de origem preservam registros importados e são somente leitura para o aplicativo. As tabelas de operação recebem novas gravações. A ausência de registros em uma tabela significa que a fonte não tinha esse cadastro; não são criados dados fictícios.

Acessos por módulo: `slt_core_module_access`. Auditoria imutável: `slt_core_change_log`. Autenticação: Supabase Auth e `slt360_profiles`. Anexos: metadados em `slt360_attachments` e arquivos em bucket privado.
