import { escapeHtml } from '../sanitize.js';
import { customFieldsFor, resolveLabel } from '../module-config.js';
import { customCells, customHeaders } from './fields.js';

export function renderEmployeeList({ employees, config, showArchived = false }) {
  const employeeLabel = resolveLabel(config, 'empleados', 'Empleados');
  const customFieldCount = customFieldsFor(config, 'empleado').length;
  const rows = employees
    .map(
      (employee) => `
        <tr data-employee-row="${escapeHtml(employee.id)}">
          <td data-label="Nombre">${escapeHtml(employee.nombre)}${employee.archived ? ' <span class="badge badge--archived">Archivado</span>' : ''}</td>
          <td data-label="Cargo">${escapeHtml(employee.cargo)}</td>
          ${customCells(config, 'empleado', employee)}
          <td class="row-actions">
            <button type="button" class="btn btn--small" data-action="edit-employee" data-id="${escapeHtml(employee.id)}">Editar</button>
            ${
              employee.archived
                ? ''
                : `<button type="button" class="btn btn--small btn--danger" data-action="archive-employee" data-id="${escapeHtml(employee.id)}">Archivar</button>`
            }
          </td>
        </tr>`
    )
    .join('');

  const empty = `<tr><td colspan="${3 + customFieldCount}"><div class="empty-state">No hay ${employeeLabel.toLowerCase()} ${showArchived ? 'archivados' : 'registrados'}. Crea el primero para asignar responsables.</div></td></tr>`;

  return `
    <section class="view" aria-labelledby="employees-title">
      <header class="view-header">
        <h2 id="employees-title">${escapeHtml(employeeLabel)}</h2>
        <div class="view-actions">
          <button type="button" class="btn" data-action="toggle-archived">${showArchived ? 'Ver operativos' : 'Mostrar archivados'}</button>
          <button type="button" class="btn btn--primary" data-action="new-employee">Nuevo</button>
        </div>
      </header>
      <div class="table-wrapper">
        <table class="data-table">
          <thead><tr><th>Nombre</th><th>Cargo</th>${customHeaders(config, 'empleado')}<th>Acciones</th></tr></thead>
          <tbody>${rows || empty}</tbody>
        </table>
      </div>
    </section>
  `;
}
