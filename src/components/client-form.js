import { escapeHtml } from '../sanitize.js';
import { resolveLabel } from '../module-config.js';
import { inputField, renderCustomFields } from './fields.js';
import { CLIENT_STATES, DEFAULT_CLIENT_STATE } from '../domain.js';

export function renderClientForm({ client = null, formValues = null, config, errors = [] }) {
  const editing = Boolean(client);
  const values = formValues ?? client ?? { estado: DEFAULT_CLIENT_STATE };
  const clientLabel = resolveLabel(config, 'cliente', 'Cliente');
  const title = editing ? `Editar ${clientLabel}` : `Nuevo ${clientLabel}`;

  return `
    <section class="view" aria-labelledby="client-form-title">
      <header class="view-header">
        <h2 id="client-form-title">${escapeHtml(title)}</h2>
      </header>
      <form class="form-card" data-form="client" novalidate>
        <input type="hidden" name="id" value="${escapeHtml(client?.id ?? '')}" />
        ${inputField({ name: 'nombreEmpresa', label: 'Nombre de empresa', value: values.nombreEmpresa ?? '', required: true, errors })}
        ${inputField({ name: 'personaContacto', label: 'Persona de contacto', value: values.personaContacto ?? '', required: true, errors })}
        ${inputField({ name: 'correo', label: 'Correo electrónico', type: 'email', value: values.correo ?? '', required: true, errors })}
        ${inputField({ name: 'telefono', label: 'Teléfono', value: values.telefono ?? '', required: true, errors })}
        ${inputField({
          name: 'estado',
          label: resolveLabel(config, 'estado', 'Estado'),
          type: 'select',
          value: values.estado ?? DEFAULT_CLIENT_STATE,
          required: true,
          errors,
          options: CLIENT_STATES
        })}
        ${renderCustomFields(config, 'cliente', values, errors)}
        <div class="form-actions">
          <button type="submit" class="btn btn--primary">Guardar</button>
          <button type="button" class="btn" data-action="cancel-form">Cancelar</button>
        </div>
      </form>
    </section>
  `;
}
