import { escapeHtml } from '../sanitize.js';
import { resolveLabel } from '../module-config.js';
import { inputField, renderCustomFields } from './fields.js';
import { INTERACTION_TYPES } from '../domain.js';

function optionsFrom(records, labelKey, placeholder) {
  return [{ value: '', label: placeholder }].concat(
    records.map((record) => ({ value: record.id, label: record[labelKey] }))
  );
}

export function renderInteractionForm({
  interaction = null,
  formValues = null,
  clients = [],
  employees = [],
  config,
  errors = []
}) {
  const editing = Boolean(interaction);
  const values = formValues ?? interaction ?? {};
  const interactionLabel = resolveLabel(config, 'interaccion', 'Interacción');
  const title = editing ? `Editar ${interactionLabel}` : `Nueva ${interactionLabel}`;

  return `
    <section class="view" aria-labelledby="interaction-form-title">
      <header class="view-header">
        <h2 id="interaction-form-title">${escapeHtml(title)}</h2>
      </header>
      <form class="form-card" data-form="interaction" novalidate>
        <input type="hidden" name="id" value="${escapeHtml(interaction?.id ?? '')}" />
        ${inputField({
          name: 'clienteId',
          label: resolveLabel(config, 'cliente', 'Cliente'),
          type: 'select',
          value: values.clienteId ?? '',
          required: true,
          errors,
          options: optionsFrom(clients, 'nombreEmpresa', 'Seleccione un cliente')
        })}
        ${inputField({
          name: 'empleadoId',
          label: resolveLabel(config, 'empleado', 'Empleado'),
          type: 'select',
          value: values.empleadoId ?? '',
          required: true,
          errors,
          options: optionsFrom(employees, 'nombre', 'Seleccione un responsable')
        })}
        ${inputField({ name: 'fecha', label: 'Fecha', type: 'date', value: values.fecha ?? '', required: true, errors })}
        ${inputField({
          name: 'tipo',
          label: 'Tipo',
          type: 'select',
          value: values.tipo ?? '',
          required: true,
          errors,
          options: [{ value: '', label: 'Seleccione un tipo' }].concat(INTERACTION_TYPES)
        })}
        ${inputField({ name: 'descripcion', label: 'Descripción (opcional)', type: 'textarea', value: values.descripcion ?? '', errors })}
        ${renderCustomFields(config, 'interaccion', values, errors)}
        <div class="form-actions">
          <button type="submit" class="btn btn--primary">Guardar</button>
          <button type="button" class="btn" data-action="cancel-form">Cancelar</button>
        </div>
      </form>
    </section>
  `;
}
