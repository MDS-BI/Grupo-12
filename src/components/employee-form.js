import { escapeHtml } from '../sanitize.js';
import { resolveLabel } from '../module-config.js';
import { inputField, renderCustomFields } from './fields.js';

export function renderEmployeeForm({ employee = null, formValues = null, config, errors = [] }) {
  const editing = Boolean(employee);
  const values = formValues ?? employee ?? {};
  const employeeLabel = resolveLabel(config, 'empleado', 'Empleado');
  const title = editing ? `Editar ${employeeLabel}` : `Nuevo ${employeeLabel}`;

  return `
    <section class="view" aria-labelledby="employee-form-title">
      <header class="view-header">
        <h2 id="employee-form-title">${escapeHtml(title)}</h2>
      </header>
      <form class="form-card" data-form="employee" novalidate>
        <input type="hidden" name="id" value="${escapeHtml(employee?.id ?? '')}" />
        ${inputField({ name: 'nombre', label: 'Nombre', value: values.nombre ?? '', required: true, errors })}
        ${inputField({ name: 'cargo', label: 'Cargo', value: values.cargo ?? '', required: true, errors })}
        ${renderCustomFields(config, 'empleado', values, errors)}
        <div class="form-actions">
          <button type="submit" class="btn btn--primary">Guardar</button>
          <button type="button" class="btn" data-action="cancel-form">Cancelar</button>
        </div>
      </form>
    </section>
  `;
}
