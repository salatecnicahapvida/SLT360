const PROJECT_VIEW_PREFIX = "projects";

function applyRequestedUiScope(root = document) {
  // Orçamento: qualquer acesso principal abre direto no Operacional.
  root.querySelectorAll('.home-launchpad-card--orcamento[data-view="worksHome"]').forEach((button) => {
    button.dataset.view = "worksOperational";
  });

  root.querySelectorAll('.top-nav [data-module="works"][data-view="worksHome"]').forEach((button) => {
    button.dataset.view = "worksOperational";
  });

  root.querySelectorAll('.sidebar [data-view="worksHome"]').forEach((button) => {
    button.dataset.view = "worksOperational";
    const label = button.querySelector('span');
    if (label) label.textContent = "Operacional Orçamento";
  });

  // Portfólio de Obras: padroniza o nome em menu lateral e abas internas.
  root.querySelectorAll('[data-view="portfolio"]').forEach((button) => {
    const label = button.querySelector('span');
    if (label) {
      label.textContent = "Portfólio de Obras";
    } else if (button.classList.contains('module-tab') || button.classList.contains('side-link')) {
      button.textContent = "Portfólio de Obras";
    }
    button.setAttribute('aria-label', 'Portfólio de Obras');
  });

  // Projetos fica indisponível na interface sem excluir dados.
  root.querySelectorAll(`[data-view^="${PROJECT_VIEW_PREFIX}"]`).forEach((element) => {
    element.hidden = true;
    element.setAttribute('aria-hidden', 'true');
  });
  root.querySelectorAll('[data-module="projects"]').forEach((element) => {
    element.hidden = true;
    element.setAttribute('aria-hidden', 'true');
  });

  // Suporte360: atualiza também atributos acessíveis/títulos.
  root.querySelectorAll('.haptec-launcher').forEach((button) => {
    button.title = "Suporte360";
    button.setAttribute('aria-label', 'Abrir Suporte360');
  });
  root.querySelectorAll('.haptec-assistant').forEach((assistant) => {
    assistant.setAttribute('aria-label', 'Suporte360 - assistente do SLT 360');
  });

  // KPI solicitado.
  root.querySelectorAll('.kpi-card[data-kpi="capexConsolidated"] > small').forEach((label) => {
    label.textContent = 'Total orçado';
  });
}

applyRequestedUiScope();

const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) {
      if (!(node instanceof Element)) continue;
      applyRequestedUiScope(node);
    }
  }
});

observer.observe(document.documentElement, { childList: true, subtree: true });
