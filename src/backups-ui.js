const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function renderBackupsPanel(cloud) {
  if (cloud.profile.perfil !== 'Admin') return '';
  return `<section class="panel" data-backup-panel>
    <div class="panel-header"><div><h2>Backup dos registros</h2>
      <p class="panel-subtitle">Cópia ao acessar após 24 horas sem backup. Histórico disponível por 14 dias.</p></div></div>
    <p>Restaura os registros de negócio. Arquivos anexos, contas e permissões exigem recuperação separada.</p>
    <div class="users-actions">
      <button class="secondary-action" data-backup-action="refresh">Consultar backups</button>
      <button class="primary-action" data-backup-action="create">Criar backup agora</button>
      <button class="secondary-action" data-backup-action="export">Exportar registros (JSON)</button>
    </div><p role="status" data-backup-message></p>
    <div class="table-wrap"><table class="data-table"><thead><tr><th>Data</th><th>Tipo</th><th>Nome</th><th>Registros</th><th>Ação</th></tr></thead>
    <tbody data-backup-rows><tr><td colspan="5">Consulte a lista para ver os backups disponíveis.</td></tr></tbody></table></div>
  </section>`;
}

export function mountBackups(cloud) {
  const message = (panel, text) => { panel.querySelector('[data-backup-message]').textContent = text; };
  async function refresh(panel) {
    const rows = await cloud.backupList();
    panel.querySelector('[data-backup-rows]').innerHTML = cloud.cleanHTML(rows.map(row => `<tr>
      <td>${escape(new Date(row.created_at).toLocaleString('pt-BR'))}</td><td>${escape({daily:'Automático',manual:'Manual',pre_restore:'Antes da restauração'}[row.kind] || row.kind)}</td>
      <td>${escape(row.label)}</td><td>${escape(row.record_count)}</td>
      <td><button class="secondary-action" data-backup-action="restore" data-backup-id="${escape(row.id)}">Restaurar</button></td>
    </tr>`).join('') || '<tr><td colspan="5">Nenhum backup disponível.</td></tr>');
  }
  document.addEventListener('click', async event => {
    const button = event.target.closest('[data-backup-action]');
    if (!button || cloud.profile.perfil !== 'Admin') return;
    event.preventDefault();
    const panel = button.closest('[data-backup-panel]');
    if (panel.dataset.busy) return;
    panel.dataset.busy = 'true'; button.disabled = true;
    try {
      const action = button.dataset.backupAction;
      if (action === 'restore') {
        if (prompt('Restaurar os registros deste backup? Contas e arquivos não serão restaurados. Digite RESTAURAR para confirmar.') !== 'RESTAURAR') return;
        message(panel, 'Criando cópia de segurança e restaurando…');
        await cloud.restoreBackup(button.dataset.backupId);
      } else if (action === 'export') {
        message(panel, 'Preparando exportação…');
        const data = await cloud.exportBackup();
        const url = URL.createObjectURL(new Blob([JSON.stringify(data)], {type:'application/json'}));
        const link = document.createElement('a');
        link.href = url; link.download = `SLT360-registros-${new Date().toISOString().replace(/[:.]/g,'-')}.json`;
        document.body.append(link); link.click(); link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        message(panel, 'Exportação concluída. Guarde em local privado.');
      } else {
        if (action === 'create') {
          const label = prompt('Nome opcional do backup:', 'Backup manual');
          if (label === null) return;
          await cloud.createBackup(label);
        }
        await refresh(panel); message(panel, 'Backups conferidos.');
      }
    } catch (error) { message(panel, error.message || 'Não foi possível concluir a operação.'); }
    finally { delete panel.dataset.busy; button.disabled = false; }
  });
}
