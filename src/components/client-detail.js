import { escapeHtml } from '../sanitize.js';
import { resolveLabel } from '../module-config.js';
import { renderOpportunityList } from './opportunity-list.js';
import { renderInteractionList } from './interaction-list.js';

export function renderClientDetail({ detail, employees = [], config }) {
  const clientLabel = resolveLabel(config, 'cliente', 'Cliente');
  if (!detail?.client) {
    return `
      <section class="view">
        <header class="view-header">
          <h2>${escapeHtml(clientLabel)}</h2>
          <div class="view-actions"><button type="button" class="btn" data-action="back-to-clients">Volver</button></div>
        </header>
        <div class="empty-state">El cliente solicitado no existe o fue eliminado.</div>
      </section>
    `;
  }

  const { client, opportunities, interactions } = detail;
  const statusClass = String(client.estado ?? '').toLowerCase();

  return `
    <section class="view view--detail" aria-labelledby="client-detail-title">
      <header class="view-header">
        <h2 id="client-detail-title">${escapeHtml(client.nombreEmpresa)}</h2>
        <div class="view-actions">
          <button type="button" class="btn" data-action="back-to-clients">Volver</button>
          <button type="button" class="btn" data-action="edit-client" data-id="${escapeHtml(client.id)}">Editar</button>
          ${
            client.archived
              ? '<span class="badge badge--archived">Archivado</span>'
              : `<button type="button" class="btn btn--danger" data-action="archive-client" data-id="${escapeHtml(client.id)}">Archivar</button>`
          }
        </div>
      </header>

      <dl class="detail-grid">
        <div><dt>Persona de contacto</dt><dd>${escapeHtml(client.personaContacto)}</dd></div>
        <div><dt>Correo</dt><dd>${escapeHtml(client.correo)}</dd></div>
        <div><dt>Teléfono</dt><dd>${escapeHtml(client.telefono)}</dd></div>
        <div><dt>Estado</dt><dd><span class="badge badge--${escapeHtml(statusClass)}">${escapeHtml(client.estado)}</span></dd></div>
      </dl>

      <section class="detail-section" aria-labelledby="detail-opportunities">
        <h3 id="detail-opportunities">${escapeHtml(resolveLabel(config, 'oportunidades', 'Oportunidades'))}</h3>
        ${renderOpportunityList({
          opportunities,
          clients: [client],
          employees,
          config,
          emptyMessage: 'Este cliente aún no tiene oportunidades registradas.'
        })}
      </section>

      <section class="detail-section" aria-labelledby="detail-interactions">
        <h3 id="detail-interactions">${escapeHtml(resolveLabel(config, 'interacciones', 'Interacciones'))}</h3>
        ${renderInteractionList({
          interactions,
          employees,
          config,
          emptyMessage: 'Este cliente aún no tiene interacciones registradas.'
        })}
      </section>
    </section>
  `;
}
