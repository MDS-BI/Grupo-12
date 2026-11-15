import { escapeHtml } from '../sanitize.js';
import { resolveLabel } from '../module-config.js';
import { inputField, renderCustomFields } from './fields.js';
import { DEFAULT_STAGE, allowedTransitions } from '../domain.js';

function optionsFrom(records, labelKey, placeholder) {
  return [{ value: '', label: placeholder }].concat(
    records.map((record) => ({ value: record.id, label: record[labelKey] }))
  );
}

export function renderOpportunityForm({
  opportunity = null,
  formValues = null,
  clients = [],
  employees = [],
  config,
  errors = []
}) {
  const editing = Boolean(opportunity);
  const values = formValues ?? opportunity ?? {};
  const opportunityLabel = resolveLabel(config, 'oportunidad', 'Oportunidad');
  const title = editing ? `Editar ${opportunityLabel}` : `Nueva ${opportunityLabel}`;
  const transitions = config?.opportunityLifecycle?.transitions;
  const stageOptions = values.etapa
    ? [values.etapa].concat(allowedTransitions(values.etapa, transitions))
    : [];

  const stageField = editing
    ? inputField({
        name: 'etapa',
        label: 'Etapa',
        type: 'select',
        value: values.etapa,
        required: true,
        errors,
        options: stageOptions
      })
    : `<p class="form-note">Etapa inicial: <strong>${escapeHtml(DEFAULT_STAGE)}</strong></p>`;

  return `
    <section class="view" aria-labelledby="opportunity-form-title">
      <header class="view-header">
        <h2 id="opportunity-form-title">${escapeHtml(title)}</h2>
      </header>
      <form class="form-card" data-form="opportunity" novalidate>
        <input type="hidden" name="id" value="${escapeHtml(opportunity?.id ?? '')}" />
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
        ${inputField({ name: 'descripcion', label: 'Descripción (opcional)', type: 'textarea', value: values.descripcion ?? '', errors })}
        ${inputField({ name: 'montoEstimado', label: 'Monto estimado', type: 'number', value: values.montoEstimado ?? '', required: true, min: 0, step: '0.01', errors })}
        ${inputField({ name: 'fechaEstimadaCierre', label: 'Fecha estimada de cierre', type: 'date', value: values.fechaEstimadaCierre ?? '', required: true, errors })}
        ${stageField}
        ${renderCustomFields(config, 'oportunidad', values, errors)}
        <div class="form-actions">
          <button type="submit" class="btn btn--primary">Guardar</button>
          <button type="button" class="btn" data-action="cancel-form">Cancelar</button>
        </div>
      </form>
    </section>
  `;
}
