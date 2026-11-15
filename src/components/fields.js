import { escapeHtml } from '../sanitize.js';
import { customFieldsFor } from '../module-config.js';

export function errorFor(errors, field) {
  const match = (errors ?? []).find((error) => error.field === field);
  return match ? match.message : '';
}

export function fieldError(errors, field) {
  const message = errorFor(errors, field);
  return message ? `<p class="field-error" role="alert">${escapeHtml(message)}</p>` : '';
}

export function inputField({
  name,
  label,
  type = 'text',
  value = '',
  required = false,
  errors = [],
  options = null,
  step = null,
  min = null,
  placeholder = ''
}) {
  const id = `field-${name}`;
  const requiredAttr = required ? 'required aria-required="true"' : '';
  let control = '';

  if (type === 'textarea') {
    control = `<textarea id="${id}" name="${escapeHtml(name)}" rows="3" ${requiredAttr} placeholder="${escapeHtml(placeholder)}">${escapeHtml(value)}</textarea>`;
  } else if (type === 'select') {
    const choices = (options ?? [])
      .map((option) => {
        const optionValue = typeof option === 'string' ? option : option.value;
        const optionLabel = typeof option === 'string' ? option : option.label;
        const selected = String(optionValue) === String(value) ? 'selected' : '';
        return `<option value="${escapeHtml(optionValue)}" ${selected}>${escapeHtml(optionLabel)}</option>`;
      })
      .join('');
    const hasEmptyOption = (options ?? []).some(
      (option) => String(typeof option === 'string' ? option : option.value) === ''
    );
    const emptyOption =
      value === '' && !hasEmptyOption ? '<option value="">Seleccione una opción</option>' : '';
    control = `<select id="${id}" name="${escapeHtml(name)}" ${requiredAttr}>${emptyOption}${choices}</select>`;
  } else {
    const stepAttr = step ? `step="${step}"` : '';
    const minAttr = min !== null ? `min="${min}"` : '';
    control = `<input id="${id}" name="${escapeHtml(name)}" type="${escapeHtml(type)}" value="${escapeHtml(value)}" ${requiredAttr} ${stepAttr} ${minAttr} placeholder="${escapeHtml(placeholder)}" />`;
  }

  return `
    <div class="field ${errorFor(errors, name) ? 'field--invalid' : ''}">
      <label for="${id}">${escapeHtml(label)}${required ? ' *' : ''}</label>
      ${control}
      ${fieldError(errors, name)}
    </div>
  `;
}

export function renderCustomFields(config, target, values = {}, errors = []) {
  const fields = customFieldsFor(config, target);
  if (!fields.length) return '';
  return fields
    .map((field) =>
      inputField({
        name: `custom__${field.key}`,
        label: field.label,
        type: field.type === 'select' ? 'select' : field.type,
        value: values[field.key] ?? '',
        required: field.required,
        errors,
        options: field.type === 'select' ? field.options ?? [] : null
      })
    )
    .join('');
}

export function customHeaders(config, target) {
  return customFieldsFor(config, target)
    .map((field) => `<th scope="col">${escapeHtml(field.label)}</th>`)
    .join('');
}

export function customCells(config, target, record = {}) {
  return customFieldsFor(config, target)
    .map(
      (field) =>
        `<td data-label="${escapeHtml(field.label)}">${escapeHtml(record[field.key] ?? '—')}</td>`
    )
    .join('');
}

export function collectCustomFields(config, target, formData) {
  const values = {};
  for (const field of customFieldsFor(config, target)) {
    const raw = formData.get(`custom__${field.key}`);
    if (field.type === 'number') {
      values[field.key] = raw === null || raw === '' ? '' : Number(raw);
    } else {
      values[field.key] = raw ?? '';
    }
  }
  return values;
}

export function customFieldErrors(config, target, values) {
  const errors = [];
  for (const field of customFieldsFor(config, target)) {
    if (!field.required) continue;
    const value = values[field.key];
    if (value === '' || value === null || value === undefined) {
      errors.push({ field: `custom__${field.key}`, message: `${field.label} es obligatorio.` });
    }
  }
  return errors;
}
