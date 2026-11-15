import { escapeHtml } from '../sanitize.js';
import { customFieldsFor, resolveLabel } from '../module-config.js';
import { customCells, customHeaders } from './fields.js';

function stageBadge(etapa) {
  const modifier = String(etapa ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  return `<span class="badge badge--stage-${escapeHtml(modifier)}">${escapeHtml(etapa)}</span>`;
}

function formatMoney(value) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0
  }).format(Number(value) || 0);
}

export function renderOpportunityList({
  opportunities,
  clients = [],
  employees = [],
  config,
  emptyMessage = 'No hay oportunidades registradas.'
}) {
  const opportunityLabel = resolveLabel(config, 'oportunidades', 'Oportunidades');
  const customFieldCount = customFieldsFor(config, 'oportunidad').length;
  const clientMap = new Map(clients.map((client) => [client.id, client.nombreEmpresa]));
  const employeeMap = new Map(employees.map((employee) => [employee.id, employee.nombre]));

  const rows = opportunities
    .map(
      (opportunity) => `
        <tr data-opportunity-row="${escapeHtml(opportunity.id)}">
          <td data-label="Cliente">${escapeHtml(clientMap.get(opportunity.clienteId) ?? '—')}</td>
          <td data-label="Responsable">${escapeHtml(employeeMap.get(opportunity.empleadoId) ?? '—')}</td>
          <td data-label="Etapa">${stageBadge(opportunity.etapa)}</td>
          <td data-label="Monto">${escapeHtml(formatMoney(opportunity.montoEstimado))}</td>
          <td data-label="Cierre">${escapeHtml(opportunity.fechaEstimadaCierre)}</td>
          ${customCells(config, 'oportunidad', opportunity)}
          <td class="row-actions">
            <button type="button" class="btn btn--small" data-action="edit-opportunity" data-id="${escapeHtml(opportunity.id)}">Editar</button>
            <button type="button" class="btn btn--small btn--danger" data-action="delete-opportunity" data-id="${escapeHtml(opportunity.id)}">Eliminar</button>
          </td>
        </tr>`
    )
    .join('');

  return `
    <div class="table-wrapper">
      <table class="data-table">
        <caption class="sr-only">${escapeHtml(opportunityLabel)}</caption>
        <thead><tr><th>Cliente</th><th>Responsable</th><th>Etapa</th><th>Monto</th><th>Cierre</th>${customHeaders(config, 'oportunidad')}<th>Acciones</th></tr></thead>
        <tbody>${rows || `<tr><td colspan="${6 + customFieldCount}"><div class="empty-state">${escapeHtml(emptyMessage)}</div></td></tr>`}</tbody>
      </table>
    </div>
  `;
}

export function renderOpportunitiesView(args) {
  const opportunityLabel = resolveLabel(args.config, 'oportunidades', 'Oportunidades');
  return `
    <section class="view" aria-labelledby="opportunities-title">
      <header class="view-header">
        <h2 id="opportunities-title">${escapeHtml(opportunityLabel)}</h2>
        <div class="view-actions">
          <button type="button" class="btn btn--primary" data-action="new-opportunity">Nueva</button>
        </div>
      </header>
      ${renderOpportunityList(args)}
    </section>
  `;
}
