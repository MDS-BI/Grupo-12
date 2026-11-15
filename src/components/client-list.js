import { escapeHtml } from '../sanitize.js';
import { customFieldsFor, resolveLabel } from '../module-config.js';
import { customCells, customHeaders } from './fields.js';

function statusBadge(estado) {
  const modifier = String(estado ?? '').toLowerCase();
  return `<span class="badge badge--${escapeHtml(modifier)}">${escapeHtml(estado)}</span>`;
}

export function renderClientList({ clients, config, showArchived = false }) {
  const clientLabel = resolveLabel(config, 'clientes', 'Clientes');
  const customFieldCount = customFieldsFor(config, 'cliente').length;
  const rows = clients
    .map(
      (client) => `
        <tr data-client-row="${escapeHtml(client.id)}">
          <td data-label="Empresa">${escapeHtml(client.nombreEmpresa)}${client.archived ? ' <span class="badge badge--archived">Archivado</span>' : ''}</td>
          <td data-label="Contacto">${escapeHtml(client.personaContacto)}</td>
          <td data-label="Correo">${escapeHtml(client.correo)}</td>
          <td data-label="Teléfono">${escapeHtml(client.telefono)}</td>
          ${customCells(config, 'cliente', client)}
          <td data-label="Estado">${statusBadge(client.estado)}</td>
          <td class="row-actions">
            <button type="button" class="btn btn--small" data-action="detail-client" data-id="${escapeHtml(client.id)}">Ver ficha</button>
            <button type="button" class="btn btn--small" data-action="edit-client" data-id="${escapeHtml(client.id)}">Editar</button>
            ${
              client.archived
                ? ''
                : `<button type="button" class="btn btn--small btn--danger" data-action="archive-client" data-id="${escapeHtml(client.id)}">Archivar</button>`
            }
          </td>
        </tr>`
    )
    .join('');

  const empty = `<tr><td colspan="${6 + customFieldCount}"><div class="empty-state">No hay ${clientLabel.toLowerCase()} ${showArchived ? 'archivados' : 'registrados'}. Usa el botón "Nuevo" para comenzar.</div></td></tr>`;

  return `
    <section class="view" aria-labelledby="clients-title">
      <header class="view-header">
        <h2 id="clients-title">${escapeHtml(clientLabel)}</h2>
        <div class="view-actions">
          <button type="button" class="btn" data-action="toggle-archived">${showArchived ? 'Ver operativos' : 'Mostrar archivados'}</button>
          <button type="button" class="btn btn--primary" data-action="new-client">Nuevo</button>
        </div>
      </header>
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr><th>Empresa</th><th>Contacto</th><th>Correo</th><th>Teléfono</th>${customHeaders(config, 'cliente')}<th>Estado</th><th>Acciones</th></tr>
          </thead>
          <tbody>${rows || empty}</tbody>
        </table>
      </div>
    </section>
  `;
}
