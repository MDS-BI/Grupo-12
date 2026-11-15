import { escapeHtml } from '../sanitize.js';
import { resolveLabel } from '../module-config.js';

function formatMoney(value) {
  try {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0
    }).format(Number(value) || 0);
  } catch {
    return `$${Math.round(Number(value) || 0)}`;
  }
}

export function renderDashboard({ metrics, config }) {
  const clientLabel = resolveLabel(config, 'clientes', 'Clientes');
  const opportunityLabel = resolveLabel(config, 'oportunidades', 'Oportunidades');
  const interactionLabel = resolveLabel(config, 'interacciones', 'Interacciones');

  const cards = [
    {
      key: 'activeClients',
      label: resolveLabel(config, 'clientesActivos', 'Clientes activos'),
      value: metrics.activeClients
    },
    {
      key: 'openOpportunities',
      label: resolveLabel(config, 'oportunidadesAbiertas', 'Oportunidades abiertas'),
      value: metrics.openOpportunities
    },
    {
      key: 'pipelineTotal',
      label: resolveLabel(config, 'montoPipeline', 'Monto en pipeline'),
      value: formatMoney(metrics.pipelineTotal)
    },
    {
      key: 'upcomingCloses',
      label: resolveLabel(config, 'proximosCierres', 'Próximos cierres (30 días)'),
      value: metrics.upcomingCloses
    }
  ]
    .map(
      (card) => `
        <article class="stat-card" data-stat="${card.key}">
          <p class="stat-label">${escapeHtml(card.label)}</p>
          <p class="stat-value">${escapeHtml(card.value)}</p>
        </article>`
    )
    .join('');

  const actions = [
    { action: 'new-client', label: `Nuevo ${clientLabel.toLowerCase()}` },
    { action: 'new-opportunity', label: `Nueva ${opportunityLabel.toLowerCase().replace(/s$/, '')}` },
    { action: 'new-interaction', label: `Nueva ${interactionLabel.toLowerCase().replace(/s$/, '')}` },
    { action: 'nav-clients', label: `Ver ${clientLabel.toLowerCase()}` }
  ]
    .map(
      (item) => `<button type="button" class="quick-action" data-action="${item.action}">${escapeHtml(item.label)}</button>`
    )
    .join('');

  return `
    <section class="view view--dashboard" aria-labelledby="dashboard-title">
      <header class="view-header">
        <h2 id="dashboard-title">${escapeHtml(resolveLabel(config, 'panel', 'Panel'))}</h2>
      </header>
      <div class="quick-actions" aria-label="Accesos rápidos">${actions}</div>
      <div class="stat-grid" aria-label="Indicadores comerciales">${cards}</div>
    </section>
  `;
}
