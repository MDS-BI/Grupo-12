import { escapeHtml } from '../sanitize.js';
import { customFieldsFor, resolveLabel } from '../module-config.js';
import { sortByDateDesc } from '../domain.js';
import { customCells, customHeaders } from './fields.js';

export function renderInteractionList({
  interactions,
  employees = [],
  config,
  showActions = true,
  emptyMessage = 'No hay interacciones registradas.'
}) {
  const interactionLabel = resolveLabel(config, 'interacciones', 'Interacciones');
  const customFieldCount = customFieldsFor(config, 'interaccion').length;
  const employeeMap = new Map(employees.map((employee) => [employee.id, employee.nombre]));
  const sorted = sortByDateDesc(interactions, 'fecha');

  const rows = sorted
    .map(
      (interaction) => `
        <tr data-interaction-row="${escapeHtml(interaction.id)}">
          <td data-label="Fecha">${escapeHtml(interaction.fecha)}</td>
          <td data-label="Tipo"><span class="badge">${escapeHtml(interaction.tipo)}</span></td>
          <td data-label="Responsable">${escapeHtml(employeeMap.get(interaction.empleadoId) ?? '—')}</td>
          <td data-label="Descripción">${escapeHtml(interaction.descripcion || '—')}</td>
          ${customCells(config, 'interaccion', interaction)}
          ${
            showActions
              ? `<td class="row-actions">
                  <button type="button" class="btn btn--small" data-action="edit-interaction" data-id="${escapeHtml(interaction.id)}">Editar</button>
                  <button type="button" class="btn btn--small btn--danger" data-action="delete-interaction" data-id="${escapeHtml(interaction.id)}">Eliminar</button>
                </td>`
              : ''
          }
        </tr>`
    )
    .join('');

  return `
    <div class="table-wrapper">
      <table class="data-table">
        <caption class="sr-only">${escapeHtml(interactionLabel)}</caption>
        <thead><tr><th>Fecha</th><th>Tipo</th><th>Responsable</th><th>Descripción</th>${customHeaders(config, 'interaccion')}${showActions ? '<th>Acciones</th>' : ''}</tr></thead>
        <tbody>${rows || `<tr><td colspan="${(showActions ? 5 : 4) + customFieldCount}"><div class="empty-state">${escapeHtml(emptyMessage)}</div></td></tr>`}</tbody>
      </table>
    </div>
  `;
}

export function renderInteractionsView(args) {
  const interactionLabel = resolveLabel(args.config, 'interacciones', 'Interacciones');
  return `
    <section class="view" aria-labelledby="interactions-title">
      <header class="view-header">
        <h2 id="interactions-title">${escapeHtml(interactionLabel)}</h2>
        <div class="view-actions">
          <button type="button" class="btn btn--primary" data-action="new-interaction">Nueva</button>
        </div>
      </header>
      ${renderInteractionList(args)}
    </section>
  `;
}
