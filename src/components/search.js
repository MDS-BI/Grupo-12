import { escapeHtml } from '../sanitize.js';
import { resolveLabel } from '../module-config.js';
import { OPPORTUNITY_STAGES, filterOpportunities, matchesClientSearch } from '../domain.js';

function clientResults({ clients, config, query }) {
  const clientLabel = resolveLabel(config, 'clientes', 'Clientes');
  const matches = clients.filter((client) => !client.archived && matchesClientSearch(client, query));
  const rows = matches
    .map(
      (client) => `
        <tr data-search-client="${escapeHtml(client.id)}">
          <td>${escapeHtml(client.nombreEmpresa)}</td>
          <td>${escapeHtml(client.personaContacto)}</td>
          <td>${escapeHtml(client.correo)}</td>
          <td><span class="badge badge--${escapeHtml(String(client.estado).toLowerCase())}">${escapeHtml(client.estado)}</span></td>
          <td class="row-actions">
            <button type="button" class="btn btn--small" data-action="detail-client" data-id="${escapeHtml(client.id)}">Ver ficha</button>
          </td>
        </tr>`
    )
    .join('');

  return `
    <section class="detail-section" aria-label="Resultados de clientes">
      <h3>${escapeHtml(clientLabel)}</h3>
      <div class="table-wrapper">
        <table class="data-table">
          <thead><tr><th>Empresa</th><th>Contacto</th><th>Correo</th><th>Estado</th><th>Acciones</th></tr></thead>
          <tbody>${rows || '<tr><td colspan="5"><div class="empty-state">No se encontraron clientes que coincidan con la búsqueda.</div></td></tr>'}</tbody>
        </table>
      </div>
    </section>
  `;
}

function opportunityResults({ opportunities, clients, employees, filters, config }) {
  const opportunityLabel = resolveLabel(config, 'oportunidades', 'Oportunidades');
  const clientMap = new Map(clients.map((client) => [client.id, client.nombreEmpresa]));
  const employeeMap = new Map(employees.map((employee) => [employee.id, employee.nombre]));
  const matches = filterOpportunities(opportunities, filters);
  const rows = matches
    .map(
      (opportunity) => `
        <tr data-search-opportunity="${escapeHtml(opportunity.id)}">
          <td>${escapeHtml(clientMap.get(opportunity.clienteId) ?? '—')}</td>
          <td>${escapeHtml(employeeMap.get(opportunity.empleadoId) ?? '—')}</td>
          <td><span class="badge">${escapeHtml(opportunity.etapa)}</span></td>
          <td>${escapeHtml(opportunity.fechaEstimadaCierre)}</td>
        </tr>`
    )
    .join('');

  return `
    <section class="detail-section" aria-label="Resultados de oportunidades">
      <h3>${escapeHtml(opportunityLabel)}</h3>
      <div class="table-wrapper">
        <table class="data-table">
          <thead><tr><th>Cliente</th><th>Responsable</th><th>Etapa</th><th>Cierre</th></tr></thead>
          <tbody>${rows || '<tr><td colspan="4"><div class="empty-state">No se encontraron oportunidades que coincidan con los filtros.</div></td></tr>'}</tbody>
        </table>
      </div>
    </section>
  `;
}

export function renderSearchResults({ clients = [], opportunities = [], employees = [], filters, config }) {
  return `
    ${clientResults({ clients, config, query: filters?.query ?? '' })}
    ${opportunityResults({ opportunities, clients, employees, filters, config })}
  `;
}

export function renderSearch({ clients = [], opportunities = [], employees = [], filters = {}, config }) {
  const stageOptions = ['', ...OPPORTUNITY_STAGES]
    .map(
      (stage) =>
        `<option value="${escapeHtml(stage)}" ${filters.etapa === stage ? 'selected' : ''}>${escapeHtml(stage || 'Todas las etapas')}</option>`
    )
    .join('');

  const employeeOptions = [{ id: '', nombre: 'Todos los responsables' }]
    .concat(employees)
    .map(
      (employee) =>
        `<option value="${escapeHtml(employee.id)}" ${filters.empleadoId === employee.id ? 'selected' : ''}>${escapeHtml(employee.nombre)}</option>`
    )
    .join('');

  return `
    <section class="view" aria-labelledby="search-title">
      <header class="view-header">
        <h2 id="search-title">${escapeHtml(resolveLabel(config, 'busqueda', 'Búsqueda'))}</h2>
      </header>
      <form class="filters" data-form="search" novalidate>
        <div class="field">
          <label for="search-query">Buscar clientes</label>
          <input id="search-query" name="query" type="search" data-search-field value="${escapeHtml(filters.query ?? '')}" placeholder="Empresa, contacto, correo o estado" />
        </div>
        <div class="field">
          <label for="search-stage">Etapa</label>
          <select id="search-stage" name="etapa" data-search-field>${stageOptions}</select>
        </div>
        <div class="field">
          <label for="search-employee">Responsable</label>
          <select id="search-employee" name="empleadoId" data-search-field>${employeeOptions}</select>
        </div>
        <div class="field">
          <label for="search-from">Cierre desde</label>
          <input id="search-from" name="fechaDesde" type="date" data-search-field value="${escapeHtml(filters.fechaDesde ?? '')}" />
        </div>
        <div class="field">
          <label for="search-to">Cierre hasta</label>
          <input id="search-to" name="fechaHasta" type="date" data-search-field value="${escapeHtml(filters.fechaHasta ?? '')}" />
        </div>
      </form>
      <div id="search-results">${renderSearchResults({ clients, opportunities, employees, filters, config })}</div>
    </section>
  `;
}
