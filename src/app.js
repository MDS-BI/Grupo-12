import { labelFor, normalizeConfig, setActiveConfig, getConfig, PHONE_PREFIXES } from './module-config.js';
import { addDocument, addEntity, deleteDocument, deleteDocumentsForEntity, deleteEntity, loadDocuments, loadEntities, searchEntities, updateDocument, updateEntity, validateDocument, validateEntity } from './storage.js';

const VIEW_KEYS = ['dashboard', 'entities', 'documents', 'search'];
const defaultFormState = {
  entity: { form: 'entity-form', idField: 'entity-id', selection: 'edit-entity', submit: 'submit-button', delete: 'delete-entity' },
  document: { form: 'document-form', idField: 'document-id', selection: 'edit-document', submit: 'document-submit-button', delete: 'delete-document' }
};

function qs(id) {
  return document.getElementById(id);
}

const RUT_LENGTH_ERROR = 'El Rut debe tener entre 8 y 9 dígitos.';

function rutLength(value) {
  return String(value ?? '').replace(/[^\dKk]/g, '').length;
}

function formatRut(value) {
  const cleaned = String(value ?? '').replace(/[^\dKk]/g, '').slice(0, 9);
  const letter = cleaned.match(/[Kk]/)?.[0] ?? '';
  const numbers = cleaned.replace(/[Kk]/g, '');

  if (letter) return numbers ? `${numbers}-${letter}` : letter;
  if (numbers.length < 2) return numbers;
  return `${numbers.slice(0, -1)}-${numbers.slice(-1)}`;
}

function bindRutInput() {
  const input = qs('taxId');
  if (!input || input.dataset.bound) return;

  input.addEventListener('input', () => {
    const value = input.value;
    const caret = input.selectionStart ?? value.length;
    const relevantBefore = value.slice(0, caret).replace(/[^\dKk]/g, '').length;
    const formatted = formatRut(value);
    setErrorText('error-taxId');

    if (formatted === value) return;

    input.value = formatted;

    let nextCaret = formatted.length;
    if (relevantBefore === 0) {
      nextCaret = 0;
    } else {
      let seen = 0;
      for (let index = 0; index < formatted.length; index += 1) {
        if (/[\dKk]/.test(formatted[index])) seen += 1;
        if (seen >= relevantBefore) {
          nextCaret = index + 1;
          break;
        }
      }
    }
    input.setSelectionRange(nextCaret, nextCaret);
  });

  input.addEventListener('blur', () => {
    const length = rutLength(input.value);
    setErrorText('error-taxId', length && length < 8 ? RUT_LENGTH_ERROR : '');
  });

  input.dataset.bound = 'true';
}

const PHONE_LENGTH_ERROR = 'El teléfono debe tener entre 8 y 10 dígitos.';

function formatPhone(value) {
  return String(value ?? '').replace(/\D/g, '').slice(0, 10);
}

function splitStoredPhone(value) {
  const raw = String(value ?? '').trim();
  const digits = raw.replace(/\D/g, '');
  if (!raw.includes('+') && digits.length <= 10) {
    return { prefix: '+56', number: digits };
  }

  const match = [...PHONE_PREFIXES]
    .sort((a, b) => b.code.length - a.code.length)
    .find(({ code }) => digits.startsWith(code.slice(1)));
  const number = match ? digits.slice(match.code.length - 1) : digits;
  return { prefix: match?.code ?? '+56', number: number.slice(0, 10) };
}

function setPhonePrefix(code) {
  const value = PHONE_PREFIXES.some((item) => item.code === code) ? code : '+56';
  const select = qs('phonePrefix');
  if (select) select.value = value;
  const label = qs('phonePrefixLabel');
  if (label) label.textContent = value;
}

function populatePhonePrefixes() {
  const select = qs('phonePrefix');
  if (!select || select.options.length) return;

  for (const { code, country } of PHONE_PREFIXES) {
    const option = document.createElement('option');
    option.value = code;
    option.textContent = `${code} ${country}`;
    select.appendChild(option);
  }
  setPhonePrefix('+56');

  if (!select.dataset.bound) {
    select.addEventListener('change', () => setPhonePrefix(select.value));
    select.dataset.bound = 'true';
  }
}

function bindPhoneInput() {
  const input = qs('phone');
  if (!input || input.dataset.bound) return;

  input.addEventListener('input', () => {
    const formatted = formatPhone(input.value);
    setErrorText('error-phone');
    if (formatted === input.value) return;

    const caret = input.selectionStart ?? input.value.length;
    const relevantBefore = input.value.slice(0, caret).replace(/\D/g, '').length;
    input.value = formatted;
    const nextCaret = Math.min(relevantBefore, formatted.length);
    input.setSelectionRange(nextCaret, nextCaret);
  });

  input.addEventListener('blur', () => {
    const length = input.value.length;
    setErrorText('error-phone', length >= 8 && length <= 10 ? '' : PHONE_LENGTH_ERROR);
  });

  input.dataset.bound = 'true';
}

function getActiveConfig() {
  return getConfig();
}

function setErrorText(fieldId, message = '') {
  const node = qs(fieldId);
  if (node) node.textContent = message;
}

function clearFormErrors(scope) {
  const ids = [];
  if (scope === 'entity') {
    ids.push(
      'error-name', 'error-code', 'error-taxId', 'error-email', 'error-phone', 'error-address', 'error-category',
      'error-targetDate', 'error-creditLimit', 'error-paymentTerms', 'error-cf-name'
    );
  }
  if (scope === 'document') {
    ids.push(
      'error-document-entity', 'error-series', 'error-folio', 'error-startDate', 'error-endDate', 'error-quantity',
      'error-subtotal', 'error-discount', 'error-taxAmount', 'error-totalAmount', 'error-currency', 'error-docPaymentTerms', 'error-status'
    );
  }

  for (const id of ids) {
    setErrorText(id, '');
  }

  const config = getActiveConfig();
  for (const field of config.customFields || []) {
    const errorId = `error-cf-${field.key}`;
    setErrorText(errorId, '');
  }
}

function showView(name) {
  if (name === 'entities') updateEntitySelect();
  if (name === 'documents') {
    populateEntityDropdown();
    updateDocumentSelect();
  }
  if (name === 'dashboard') updateDashboardStats();
  if (name === 'search') renderSearchResults();

  for (const key of VIEW_KEYS) {
    const view = qs(`view-${key}`);
    if (view) view.hidden = key !== name;
  }

  document.querySelectorAll('.nav-module').forEach((button) => {
    button.setAttribute('aria-current', button.id === `nav-${name}` ? 'page' : 'false');
  });
}

function updateDashboardStats() {
  const entities = loadEntities();
  const documents = loadDocuments();
  const entitiesNode = qs('stat-entities');
  const docsNode = qs('stat-documents');
  if (entitiesNode) entitiesNode.textContent = String(entities.length);
  if (docsNode) docsNode.textContent = String(documents.length);
}

function renderBranding() {
  const config = getActiveConfig();
  const brandName = qs('brand-name');
  const dashboardHeading = qs('dashboard-heading');
  const displayName = config.moduleName || 'CRM Pro';
  if (brandName) brandName.textContent = displayName;
  if (dashboardHeading) dashboardHeading.textContent = displayName;
  document.title = displayName;

  const accent = config.theme?.accentColor || '#2563eb';
  document.documentElement.style.setProperty('--accent', accent);
}

function isFeminineNoun(label) {
  const text = String(label || '').trim();
  if (!text) return false;
  const firstWord = text.split(/\s+/)[0].toLowerCase();
  return firstWord === 'entidad'
    || firstWord === 'oportunidad'
    || firstWord === 'interacción'
    || firstWord === 'búsqueda'
    || /(?:[aeiou]a|ción|sión|dad|tad|tud|ie|umbre|ura|aje)$/i.test(firstWord);
}

function nounArticle(label, { newItem = false } = {}) {
  const text = String(label || '').trim();
  if (!text) return newItem ? 'Nuevo' : 'el';
  const isFeminine = isFeminineNoun(text);
  return isFeminine ? (newItem ? 'Nueva' : 'la') : (newItem ? 'Nuevo' : 'el');
}

function nounSelectionSuffix(label) {
  return isFeminineNoun(label) ? 'seleccionada' : 'seleccionado';
}

function renderModuleLabels() {
  const config = getActiveConfig();
  const nav = [
    ['nav-dashboard', 'dashboard'],
    ['nav-entities', 'entities'],
    ['nav-documents', 'documents'],
    ['nav-search', 'search']
  ];

  for (const [buttonId, key] of nav) {
    const labelNode = qs(`${buttonId}-label`);
    if (labelNode) labelNode.textContent = labelFor(key);
  }

  const entityLabel = labelFor('entities');
  const documentLabel = labelFor('documents');
  const entitySingular = labelFor('entity');
  const documentSingular = labelFor('document');
  const entityArticle = nounArticle(entitySingular, { newItem: false });
  const documentArticle = nounArticle(documentSingular, { newItem: false });
  const entityNewArticle = nounArticle(entitySingular, { newItem: true });
  const documentNewArticle = nounArticle(documentSingular, { newItem: true });

  if (qs('entities-view-heading')) qs('entities-view-heading').textContent = entityLabel;
  if (qs('documents-view-heading')) qs('documents-view-heading').textContent = documentLabel;
  if (qs('search-view-heading')) qs('search-view-heading').textContent = `Buscar ${entityLabel}`;
  if (qs('stat-entities-label')) qs('stat-entities-label').textContent = entityLabel;
  if (qs('stat-documents-label')) qs('stat-documents-label').textContent = documentLabel;
  if (qs('action-new-entity-title')) qs('action-new-entity-title').textContent = `${entityNewArticle} ${entitySingular}`;
  if (qs('action-new-document-title')) qs('action-new-document-title').textContent = `${documentNewArticle} ${documentSingular}`;
  if (qs('action-open-entities-title')) qs('action-open-entities-title').textContent = entityLabel;
  if (qs('action-find-title')) qs('action-find-title').textContent = 'Buscar registros';
  if (qs('entity-form-heading')) qs('entity-form-heading').textContent = `Agregar / Editar ${entitySingular}`;
  if (qs('edit-entity-heading')) qs('edit-entity-heading').textContent = `Editar o eliminar ${entityArticle} ${entitySingular.toLowerCase()}`;
  if (qs('delete-entity')) qs('delete-entity').textContent = `Eliminar ${entityArticle} ${entitySingular.toLowerCase()} ${nounSelectionSuffix(entitySingular)}`;
  if (qs('document-form-heading')) qs('document-form-heading').textContent = `Agregar / Editar ${documentSingular}`;
  if (qs('edit-document-heading')) qs('edit-document-heading').textContent = `Editar o eliminar ${documentArticle} ${documentSingular.toLowerCase()}`;
  if (qs('delete-document')) qs('delete-document').textContent = `Eliminar ${documentArticle} ${documentSingular.toLowerCase()} ${nounSelectionSuffix(documentSingular)}`;
  if (qs('search-empty')) qs('search-empty').textContent = `No hay coincidencias para su búsqueda.`;
}

function updateEntitySelect() {
  const select = qs('edit-entity');
  if (!select) return;
  const entities = loadEntities();
  select.innerHTML = '<option value="">Seleccionar...</option>';
  for (const entity of entities) {
    const option = document.createElement('option');
    option.value = entity.id;
    option.textContent = `${entity.name || 'Sin nombre'} — ${entity.code || entity.entity_id || 'Sin código'}`;
    select.appendChild(option);
  }
}

function updateDocumentSelect() {
  const select = qs('edit-document');
  if (!select) return;
  const documents = loadDocuments();
  select.innerHTML = '<option value="">Seleccionar...</option>';
  for (const record of documents) {
    const entity = loadEntities().find((item) => item.entity_id === record.entity_id || item.id === record.entity_id);
    const label = [record.series || 'SIN-SERIE', record.folio || '0'].join(' - ');
    const option = document.createElement('option');
    option.value = record.id;
    option.textContent = `${label}${entity ? ` · ${entity.name}` : ''}`;
    select.appendChild(option);
  }
}

function updateEntityFieldOptions() {
  const config = getActiveConfig();
  const container = qs('entity-custom-fields');
  if (!container) return;
  const fields = (config.customFields || []).filter((field) => (field.target || 'entity') === 'entity');
  container.innerHTML = '';
  container.hidden = fields.length === 0;

  for (const field of fields) {
    const wrapper = document.createElement('div');
    wrapper.className = 'custom-field';
    wrapper.dataset.key = field.key;

    const label = document.createElement('label');
    label.textContent = `${field.label || field.key}${field.required ? ' *' : ''}`;
    label.setAttribute('for', `cf-${field.key}`);

    const input = field.type === 'select'
      ? document.createElement('select')
      : document.createElement('input');

    input.id = `cf-${field.key}`;
    input.name = field.key;
    input.dataset.customFieldKey = field.key;
    input.dataset.customFieldTarget = 'entity';
    if (field.type === 'number') input.type = 'number';
    if (field.type === 'date') input.type = 'date';
    if (field.type === 'text') input.type = 'text';
    if (field.type === 'select') {
      const emptyOption = document.createElement('option');
      emptyOption.value = '';
      emptyOption.textContent = '--';
      input.appendChild(emptyOption);
      for (const option of field.options || []) {
        const child = document.createElement('option');
        child.value = option;
        child.textContent = option;
        input.appendChild(child);
      }
    }

    const error = document.createElement('div');
    error.id = `error-cf-${field.key}`;
    error.className = 'validation-error';

    wrapper.appendChild(label);
    wrapper.appendChild(input);
    wrapper.appendChild(error);
    container.appendChild(wrapper);
  }
}

function updateDocumentFieldOptions() {
  const config = getActiveConfig();
  const container = qs('document-custom-fields');
  if (!container) return;
  const fields = (config.customFields || []).filter((field) => (field.target || 'entity') === 'document');
  container.innerHTML = '';
  container.hidden = fields.length === 0;

  for (const field of fields) {
    const wrapper = document.createElement('div');
    wrapper.className = 'custom-field';

    const label = document.createElement('label');
    label.textContent = `${field.label || field.key}${field.required ? ' *' : ''}`;
    label.setAttribute('for', `cf-${field.key}`);

    const input = field.type === 'select' ? document.createElement('select') : document.createElement('input');
    input.id = `cf-${field.key}`;
    input.name = field.key;
    input.dataset.customFieldKey = field.key;
    input.dataset.customFieldTarget = 'document';
    if (field.type === 'number') input.type = 'number';
    if (field.type === 'date') input.type = 'date';
    if (field.type === 'text') input.type = 'text';
    if (field.type === 'select') {
      const emptyOption = document.createElement('option');
      emptyOption.value = '';
      emptyOption.textContent = '--';
      input.appendChild(emptyOption);
      for (const option of field.options || []) {
        const item = document.createElement('option');
        item.value = option;
        item.textContent = option;
        input.appendChild(item);
      }
    }

    const error = document.createElement('div');
    error.id = `error-cf-${field.key}`;
    error.className = 'validation-error';

    wrapper.appendChild(label);
    wrapper.appendChild(input);
    wrapper.appendChild(error);
    container.appendChild(wrapper);
  }
}

function populateEntityDropdown() {
  const select = qs('document-entity');
  if (!select) return;
  const entities = loadEntities();
  select.innerHTML = '<option value="">Seleccionar...</option>';
  for (const entity of entities) {
    const option = document.createElement('option');
    option.value = entity.entity_id;
    option.textContent = `${entity.name || 'Sin nombre'} — ${entity.code || 'Sin código'}`;
    select.appendChild(option);
  }
}

function resetEntityForm() {
  const form = qs('entity-form');
  if (!form) return;
  form.reset();
  qs('entity-id').value = '';
  qs('submit-button').textContent = 'Guardar';
  setPhonePrefix('+56');
  clearFormErrors('entity');
  const customNodes = document.querySelectorAll('#entity-custom-fields .custom-field');
  customNodes.forEach((node) => node.querySelector('input, select') && (node.querySelector('input, select').value = ''));
}

function resetDocumentForm() {
  const form = qs('document-form');
  if (!form) return;
  form.reset();
  qs('document-id').value = '';
  const documentSubmitButton = qs('document-submit-button') || qs('submit-document-button');
  if (documentSubmitButton) documentSubmitButton.textContent = 'Guardar';
  clearFormErrors('document');
  const customNodes = document.querySelectorAll('#document-custom-fields .custom-field');
  customNodes.forEach((node) => {
    const input = node.querySelector('input, select');
    if (input) input.value = '';
  });
}

function fillEntityForm(entity) {
  if (!entity) return;
  qs('entity-id').value = entity.id;
  qs('name').value = entity.name || '';
  qs('code').value = entity.code || '';
  qs('taxId').value = formatRut(entity.taxId || '');
  qs('email').value = entity.email || '';
  const phone = splitStoredPhone(entity.phone);
  setPhonePrefix(entity.phonePrefix || phone.prefix);
  qs('phone').value = phone.number;
  qs('address').value = entity.address || '';
  qs('category').value = entity.category || '';
  qs('targetDate').value = entity.targetDate || '';
  qs('creditLimit').value = entity.creditLimit ?? '';
  qs('paymentTerms').value = entity.paymentTerms || '';

  const config = getActiveConfig();
  for (const field of config.customFields || []) {
    if ((field.target || 'entity') !== 'entity') continue;
    const input = qs(`cf-${field.key}`);
    if (input) input.value = entity[field.key] ?? '';
  }

  qs('submit-button').textContent = 'Actualizar';
}

function fillDocumentForm(record) {
  if (!record) return;
  qs('document-id').value = record.id;
  const select = qs('document-entity');
  if (select) select.value = record.entity_id;
  qs('series').value = record.series || '';
  qs('folio').value = record.folio ?? '';
  qs('startDate').value = record.startDate || '';
  qs('endDate').value = record.endDate || '';
  qs('quantity').value = record.quantity ?? '';
  qs('subtotal').value = record.subtotal ?? '';
  qs('discount').value = record.discount ?? '';
  qs('taxAmount').value = record.taxAmount ?? '';
  qs('totalAmount').value = record.totalAmount ?? '';
  qs('currency').value = record.currency || '';
  qs('docPaymentTerms').value = record.paymentTerms || '';
  qs('notes').value = record.notes || '';
  const statusField = qs('status');
  if (statusField) {
    attachStatusOptions(record.status || '');
    const refreshed = qs('status');
    if (refreshed) refreshed.value = record.status || '';
  }

  const config = getActiveConfig();
  for (const field of config.customFields || []) {
    if ((field.target || 'entity') !== 'document') continue;
    const input = qs(`cf-${field.key}`);
    if (input) input.value = record[field.key] ?? '';
  }

  const documentSubmitButton = qs('document-submit-button') || qs('submit-document-button');
  if (documentSubmitButton) documentSubmitButton.textContent = 'Actualizar Documento';
}

function renderSearchResults() {
  const input = qs('search-input');
  const resultsList = qs('search-results-list');
  const emptyState = qs('search-empty');
  if (!input || !resultsList || !emptyState) return;

  const term = input.value.trim();
  const results = searchEntities(term);
  resultsList.innerHTML = '';
  const matches = results.filter(Boolean);

  if (!matches.length) {
    emptyState.hidden = false;
    resultsList.innerHTML = '';
    return;
  }

  emptyState.hidden = true;
  const config = getActiveConfig();
  for (const result of matches) {
    const item = document.createElement('li');
    item.className = 'entity-item';
    const detail = [];
    detail.push(`${result.name || 'Sin nombre'}${result.code ? ` — ${result.code}` : ''}`);

    for (const field of config.customFields || []) {
      if ((field.target || 'entity') !== 'entity') continue;
      const value = result[field.key];
      if (value !== undefined && value !== null && value !== '') {
        detail.push(`${field.label || field.key}: ${value}`);
      }
    }

    const status = loadDocuments()
      .filter((doc) => doc.entity_id === result.entity_id || doc.entity_id === result.id)
      .map((doc) => doc.status)
      .filter(Boolean)
      .at(-1);

    const text = document.createElement('span');
    text.textContent = detail.join(' | ');
    item.appendChild(text);

    if (status) {
      const modifier = String(status)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-');
      const badge = document.createElement('span');
      badge.className = `status-badge status-badge--${modifier}`;
      badge.textContent = status;
      item.appendChild(badge);
    }

    resultsList.appendChild(item);
  }
}

function attachStatusOptions(currentStatus = '') {
  const statusField = qs('status');
  if (!statusField) return;

  const config = getActiveConfig();
  const lifecycle = config.statusLifecycle;
  const allStatuses = Array.isArray(lifecycle?.statuses) ? lifecycle.statuses : [];

  if (!lifecycle || !allStatuses.length) {
    if (statusField.tagName !== 'INPUT') {
      const replacement = document.createElement('input');
      replacement.type = 'text';
      replacement.id = 'status';
      replacement.name = 'status';
      replacement.value = statusField.value || '';
      replacement.className = statusField.className;
      statusField.replaceWith(replacement);
    }
    const nextField = qs('status');
    if (nextField) nextField.value = currentStatus || nextField.value || '';
    return;
  }

  if (statusField.tagName !== 'SELECT') {
    const replacement = document.createElement('select');
    replacement.id = 'status';
    replacement.name = 'status';
    replacement.className = statusField.className;
    statusField.replaceWith(replacement);
  }

  const select = qs('status');
  if (!select) return;

  const transitions = lifecycle.transitions && typeof lifecycle.transitions === 'object' ? lifecycle.transitions : {};
  const baseOptions = currentStatus ? (transitions[currentStatus] || []) : allStatuses;
  const allowed = currentStatus ? [currentStatus, ...baseOptions.filter((option) => option !== currentStatus)] : ['', ...allStatuses];
  const options = currentStatus ? allowed : ['', ...allStatuses];
  select.innerHTML = '';

  if (!currentStatus) {
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = 'Sin estado';
    select.appendChild(placeholder);
  }

  for (const status of options) {
    if (status === '') {
      if (currentStatus) continue;
      continue;
    }
    const option = document.createElement('option');
    option.value = status;
    option.textContent = status;
    select.appendChild(option);
  }

  const nextValue = currentStatus ? currentStatus : '';
  select.value = nextValue;
}

function clearValidationStates() {
  clearFormErrors('entity');
  clearFormErrors('document');
}

function mapEntityValues(form) {
  const payload = {
    id: form.querySelector('#entity-id')?.value || undefined,
    name: form.querySelector('#name')?.value || '',
    code: form.querySelector('#code')?.value || '',
    taxId: formatRut(form.querySelector('#taxId')?.value || ''),
    email: form.querySelector('#email')?.value || '',
    phone: formatPhone(form.querySelector('#phone')?.value || ''),
    phonePrefix: form.querySelector('#phonePrefix')?.value || '+56',
    address: form.querySelector('#address')?.value || '',
    category: form.querySelector('#category')?.value || '',
    targetDate: form.querySelector('#targetDate')?.value || '',
    creditLimit: form.querySelector('#creditLimit')?.value || '',
    paymentTerms: form.querySelector('#paymentTerms')?.value || ''
  };

  for (const field of getActiveConfig().customFields || []) {
    if ((field.target || 'entity') !== 'entity') continue;
    const node = form.querySelector(`#cf-${field.key}`);
    if (node) payload[field.key] = node.value;
  }
  return payload;
}

function mapDocumentValues(form) {
  const payload = {
    id: form.querySelector('#document-id')?.value || undefined,
    entity_id: form.querySelector('#document-entity')?.value || '',
    series: form.querySelector('#series')?.value || '',
    folio: form.querySelector('#folio')?.value || '',
    startDate: form.querySelector('#startDate')?.value || '',
    endDate: form.querySelector('#endDate')?.value || '',
    quantity: form.querySelector('#quantity')?.value || '',
    subtotal: form.querySelector('#subtotal')?.value || '',
    discount: form.querySelector('#discount')?.value || '',
    taxAmount: form.querySelector('#taxAmount')?.value || '',
    totalAmount: form.querySelector('#totalAmount')?.value || '',
    currency: form.querySelector('#currency')?.value || '',
    paymentTerms: form.querySelector('#docPaymentTerms')?.value || '',
    notes: form.querySelector('#notes')?.value || '',
    status: form.querySelector('#status')?.value || ''
  };

  for (const field of getActiveConfig().customFields || []) {
    if ((field.target || 'entity') !== 'document') continue;
    const node = form.querySelector(`#cf-${field.key}`);
    if (node) payload[field.key] = node.value;
  }
  return payload;
}

function exposeValidationErrors(scope, errors = {}) {
  clearValidationStates();
  const local = Object.entries(errors || {});
  for (const [key, message] of local) {
    const id = key === 'entity_id' ? 'error-document-entity' : `error-${key}`;
    setErrorText(id, message);
  }

  for (const field of getActiveConfig().customFields || []) {
    const value = errors[field.key];
    if (value) setErrorText(`error-cf-${field.key}`, value);
  }
}

function handleEntitySubmit(event) {
  event.preventDefault();
  const form = qs('entity-form');
  if (!form) return;

  const values = mapEntityValues(form);
  const id = values.id;
  delete values.id;

  const payload = { ...values };
  const currentEntity = id ? loadEntities().find((entity) => entity.id === id) : null;
  const toValidate = currentEntity ? { ...currentEntity, ...payload } : payload;
  const validation = validateEntity(toValidate);

  if (!validation.valid) {
    exposeValidationErrors('entity', validation.errors);
    return;
  }

  const savedEntity = id ? updateEntity(id, payload) : addEntity(payload);

  updateEntitySelect();
  const selector = qs('edit-entity');
  if (selector) {
    selector.value = savedEntity.id;
  }
  fillEntityForm(savedEntity);
  updateDashboardStats();
}

function handleDocumentSubmit(event) {
  event.preventDefault();
  const form = qs('document-form');
  if (!form) return;

  const values = mapDocumentValues(form);
  const id = values.id;
  delete values.id;

  const currentDocument = id ? loadDocuments().find((document) => document.id === id) : null;
  const toValidate = currentDocument ? { ...currentDocument, ...values } : values;
  const validation = validateDocument(toValidate);

  if (!validation.valid) {
    exposeValidationErrors('document', validation.errors);
    return;
  }

  const savedDocument = id ? updateDocument(id, values) : addDocument(values);

  updateDocumentSelect();
  populateEntityDropdown();
  const selector = qs('edit-document');
  if (selector) {
    selector.value = savedDocument.id;
  }
  fillDocumentForm(savedDocument);
  updateDashboardStats();
}

async function boot() {
  const current = getConfig();
  const normalized = current && typeof current === 'object' && !Array.isArray(current)
    ? current
    : normalizeConfig(null).config;
  setActiveConfig(normalized);
  renderBranding();
  renderModuleLabels();
  attachStatusOptions();
  updateEntitySelect();
  updateDocumentSelect();
  populateEntityDropdown();
  updateEntityFieldOptions();
  updateDocumentFieldOptions();
  updateDashboardStats();
  renderSearchResults();
  showView('dashboard');

  const menuToggle = qs('menu-toggle');
  const appShell = qs('app-shell');
  if (menuToggle && appShell && !menuToggle.dataset.bound) {
    menuToggle.addEventListener('click', () => {
      const collapsed = appShell.classList.toggle('sidebar-collapsed');
      menuToggle.setAttribute('aria-expanded', String(!collapsed));
    });
    menuToggle.dataset.bound = 'true';
  }

  const entityForm = qs('entity-form');
  if (entityForm && !entityForm.dataset.bound) {
    entityForm.addEventListener('submit', (event) => handleEntitySubmit(event));
    entityForm.dataset.bound = 'true';
  }

  bindRutInput();
  populatePhonePrefixes();
  bindPhoneInput();

  const documentForm = qs('document-form');
  if (documentForm && !documentForm.dataset.bound) {
    documentForm.addEventListener('submit', (event) => handleDocumentSubmit(event));
    documentForm.dataset.bound = 'true';
  }

  const navButtons = document.querySelectorAll('.nav-module');
  navButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const name = button.dataset.module;
      if (name === 'dashboard') showView('dashboard');
      if (name === 'entities') showView('entities');
      if (name === 'documents') showView('documents');
      if (name === 'search') showView('search');
    });
  });

  const dashboardActions = [
    ['action-new-entity', 'entities', 'name'],
    ['action-new-document', 'documents', 'document-entity'],
    ['action-find', 'search', 'search-input'],
    ['action-open-entities', 'entities', 'name'],
    ['action-open-documents', 'documents', 'document-entity']
  ];

  for (const [buttonId, target, focusId] of dashboardActions) {
    const button = qs(buttonId);
    if (!button) continue;
    button.addEventListener('click', () => {
      showView(target);
      if (target === 'entities') resetEntityForm();
      if (target === 'documents') resetDocumentForm();
      const focusTarget = qs(focusId);
      if (focusTarget && document.contains(focusTarget)) {
        focusTarget.focus();
      }
    });
  }

  const documentSubmitButton = qs('document-submit-button') || qs('submit-document-button');
  if (documentSubmitButton && !documentSubmitButton.dataset.labelBound) {
    documentSubmitButton.textContent = 'Guardar';
    documentSubmitButton.dataset.labelBound = 'true';
  }

  const entitySelect = qs('edit-entity');
  if (entitySelect && !entitySelect.dataset.bound) {
    entitySelect.addEventListener('change', (event) => {
      const value = event.target.value;
      clearFormErrors('entity');
      if (!value) {
        resetEntityForm();
        return;
      }
      const selected = loadEntities().find((entity) => entity.id === value);
      fillEntityForm(selected);
    });
    entitySelect.dataset.bound = 'true';
  }

  const documentSelect = qs('edit-document');
  if (documentSelect && !documentSelect.dataset.bound) {
    documentSelect.addEventListener('change', (event) => {
      const value = event.target.value;
      clearFormErrors('document');
      if (!value) {
        resetDocumentForm();
        return;
      }
      const selected = loadDocuments().find((record) => record.id === value);
      fillDocumentForm(selected);
    });
    documentSelect.dataset.bound = 'true';
  }

  const searchInput = qs('search-input');
  if (searchInput && !searchInput.dataset.bound) {
    searchInput.addEventListener('input', renderSearchResults);
    searchInput.dataset.bound = 'true';
  }

  const entityDelete = qs('delete-entity');
  if (entityDelete && !entityDelete.dataset.bound) {
    entityDelete.addEventListener('click', () => {
      const selectedId = qs('entity-id')?.value;
      if (!selectedId) return;
      const confirmDelete = typeof globalThis.confirm === 'function' ? globalThis.confirm('¿Eliminar la entidad seleccionada?') : true;
      if (confirmDelete) {
        deleteEntity(selectedId);
        updateEntitySelect();
        resetEntityForm();
        updateDashboardStats();
      }
    });
    entityDelete.dataset.bound = 'true';
  }

  const documentDelete = qs('delete-document');
  if (documentDelete && !documentDelete.dataset.bound) {
    documentDelete.addEventListener('click', () => {
      const selectedId = qs('document-id')?.value;
      if (!selectedId) return;
      const confirmDelete = typeof globalThis.confirm === 'function' ? globalThis.confirm('¿Eliminar el documento seleccionado?') : true;
      if (confirmDelete) {
        deleteDocument(selectedId);
        updateDocumentSelect();
        resetDocumentForm();
        updateDashboardStats();
      }
    });
    documentDelete.dataset.bound = 'true';
  }

  const elements = [
    qs('view-dashboard'), qs('view-entities'), qs('view-documents'), qs('view-search'),
    qs('nav-dashboard'), qs('nav-entities'), qs('nav-documents'), qs('nav-search')
  ];
  elements.forEach((element) => {
    if (element) element.hidden = element.id !== 'view-dashboard';
  });
}

let appInitialized = false;

export async function initApp(configOverride) {
  const result = configOverride && configOverride.config ? configOverride : normalizeConfig(configOverride ?? null);
  setActiveConfig(result);
  if (appInitialized) return;
  await boot();
  appInitialized = true;
}

export { boot };
