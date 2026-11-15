import { BASE_FIELDS, getConfig } from './module-config.js';

const STORE_KEYS = {
  entities: 'erp_base_module:entities',
  documents: 'erp_base_module:documents'
};

function readStorage(key, fallback = []) {
  const raw = globalThis.localStorage?.getItem?.(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) || fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  globalThis.localStorage?.setItem?.(key, JSON.stringify(value));
}

function currentConfig() {
  return getConfig();
}

function getAllowedCustomFields(target) {
  const cfg = currentConfig();
  return (cfg.customFields || []).filter((field) => field.target === target || (field.target || 'entity') === target);
}

function createId(prefix) {
  const randomPart = globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}_${randomPart}`;
}

function normalizeDateText(value) {
  if (value === undefined || value === null || value === '') return '';
  return String(value).trim();
}

function isValidDateString(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
    return false;
  }

  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) {
    return false;
  }

  const parts = value.split('-').map(Number);
  const [year, month, day] = parts;
  return date.getUTCFullYear() === year && date.getUTCMonth() + 1 === month && date.getUTCDate() === day;
}

function parseNumber(value) {
  if (value === undefined || value === null || value === '') return undefined;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : NaN;
}

function getBaseFields(target) {
  return BASE_FIELDS[target] || [];
}

function normalizeLegacyEntityDocumentKeys(input = {}) {
  const source = { ...input };
  if (source.entityId !== undefined && source.entity_id === undefined) {
    source.entity_id = source.entityId;
  }
  delete source.entityId;
  return source;
}

function sanitizeCustomNumberFields(target, values) {
  const config = currentConfig();
  for (const field of config.customFields || []) {
    if ((field.target || 'entity') !== target) continue;
    if (field.type !== 'number') continue;
    const key = field.key;
    if (!(key in values)) continue;
    const raw = values[key];
    if (raw === '' || raw === null || raw === undefined) continue;
    const parsed = parseNumber(raw);
    if (Number.isFinite(parsed)) {
      values[key] = parsed;
    }
  }
}

function sanitizeEntityInput(input = {}) {
  const allowedFields = new Set(getBaseFields('entity'));
  for (const field of getAllowedCustomFields('entity')) {
    allowedFields.add(field.key);
  }

  const clean = {};
  const source = normalizeLegacyEntityDocumentKeys(input);
  for (const key of Object.keys(source)) {
    if (allowedFields.has(key)) {
      clean[key] = source[key];
    }
  }

  if ('creditLimit' in clean && clean.creditLimit !== '' && clean.creditLimit !== null && clean.creditLimit !== undefined) {
    const parsed = parseNumber(clean.creditLimit);
    clean.creditLimit = Number.isFinite(parsed) ? parsed : clean.creditLimit;
  }

  if ('targetDate' in clean) {
    clean.targetDate = normalizeDateText(clean.targetDate);
  }

  sanitizeCustomNumberFields('entity', clean);

  return clean;
}

function sanitizeDocumentInput(input = {}) {
  const allowedFields = new Set(getBaseFields('document'));
  for (const field of getAllowedCustomFields('document')) {
    allowedFields.add(field.key);
  }

  const clean = {};
  const source = normalizeLegacyEntityDocumentKeys(input);
  for (const key of Object.keys(source)) {
    if (allowedFields.has(key)) {
      clean[key] = source[key];
    }
  }

  for (const numericKey of ['quantity', 'subtotal', 'discount', 'taxAmount', 'totalAmount']) {
    if (numericKey in clean && clean[numericKey] !== '' && clean[numericKey] !== null && clean[numericKey] !== undefined) {
      const parsed = parseNumber(clean[numericKey]);
      clean[numericKey] = Number.isFinite(parsed) ? parsed : clean[numericKey];
    }
  }

  if ('folio' in clean && clean.folio !== '' && clean.folio !== null && clean.folio !== undefined) {
    const parsed = parseNumber(clean.folio);
    clean.folio = Number.isFinite(parsed) ? parsed : clean.folio;
  }

  if ('startDate' in clean) clean.startDate = normalizeDateText(clean.startDate);
  if ('endDate' in clean) clean.endDate = normalizeDateText(clean.endDate);

  sanitizeCustomNumberFields('document', clean);

  return clean;
}

function validateCustomFields(target, values, errors) {
  const config = currentConfig();
  for (const field of config.customFields || []) {
    if ((field.target || 'entity') !== target) continue;

    const fieldKey = field.key;
    const fieldValue = values[fieldKey];
    const label = field.label || fieldKey;

    if (field.required && (fieldValue === undefined || fieldValue === null || fieldValue === '')) {
      errors[fieldKey] = `${label} es obligatorio.`;
      continue;
    }

    if (fieldValue === undefined || fieldValue === null || fieldValue === '') continue;

    if (field.type === 'number') {
      const numeric = Number(fieldValue);
      if (!Number.isFinite(numeric)) {
        errors[fieldKey] = `${label} debe ser un número válido.`;
      }
    }

    if (field.type === 'select' && Array.isArray(field.options)) {
      if (!field.options.includes(fieldValue)) {
        errors[fieldKey] = `${label} debe ser uno de ${field.options.join(', ')}.`;
      }
    }
  }
}

export function validateEntity(data = {}) {
  const values = sanitizeEntityInput(data);
  const errors = {};

  if (!values.name || String(values.name).trim() === '') {
    errors.name = 'El nombre es obligatorio.';
  }

  if (!values.code || String(values.code).trim() === '') {
    errors.code = 'El código es obligatorio.';
  }

  if (values.email && String(values.email).trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(values.email).trim())) {
    errors.email = 'Introduce un correo electrónico válido.';
  }

  if (values.targetDate && !isValidDateString(String(values.targetDate))) {
    errors.targetDate = 'La fecha objetivo debe tener formato YYYY-MM-DD.';
  }

  if (values.creditLimit !== undefined && values.creditLimit !== null && values.creditLimit !== '' && Number(values.creditLimit) < 0) {
    errors.creditLimit = 'El límite de crédito no puede ser no negativo.';
  }

  validateCustomFields('entity', values, errors);

  return { valid: Object.keys(errors).length === 0, errors };
}

export function loadEntities() {
  return readStorage(STORE_KEYS.entities, []);
}

export function addEntity(data = {}) {
  const clean = sanitizeEntityInput(data);
  const validation = validateEntity(clean);
  if (!validation.valid) {
    throw new Error(Object.values(validation.errors).join(' '));
  }

  const record = {
    ...clean,
    id: createId('entity'),
    entity_id: createId('entity_id')
  };

  const all = loadEntities();
  all.push(record);
  writeStorage(STORE_KEYS.entities, all);
  return record;
}

export function updateEntity(id, patch = {}) {
  const all = loadEntities();
  const index = all.findIndex((entity) => entity.id === id);
  if (index === -1) return null;

  const merged = { ...all[index], ...sanitizeEntityInput(patch) };
  const validation = validateEntity(merged);
  if (!validation.valid) {
    throw new Error(Object.values(validation.errors).join(' '));
  }

  all[index] = merged;
  writeStorage(STORE_KEYS.entities, all);
  return all[index];
}

export function deleteEntity(id) {
  const all = loadEntities();
  const entity = all.find((record) => record.id === id);
  const next = all.filter((record) => record.id !== id);
  writeStorage(STORE_KEYS.entities, next);
  if (entity) {
    deleteDocumentsForEntity(entity.entity_id);
  }
  return next;
}

export function clearAll() {
  writeStorage(STORE_KEYS.entities, []);
  writeStorage(STORE_KEYS.documents, []);
}

export function searchEntities(term = '') {
  const source = String(term ?? '').trim().toLowerCase();
  const entities = loadEntities();
  if (!source) return entities;

  return entities.filter((entity) => {
    const content = [
      entity.name,
      entity.code,
      entity.taxId,
      entity.email,
      entity.phone,
      entity.address,
      entity.category,
      entity.targetDate,
      entity.paymentTerms,
      entity.entity_id,
      ...Object.entries(entity)
        .filter(([key, value]) => !BASE_FIELDS.entity.includes(key) || key === 'entity_id')
        .map(([, value]) => value)
    ].join(' ').toLowerCase();

    return content.includes(source);
  });
}

export function validateDocument(data = {}) {
  const values = sanitizeDocumentInput(data);
  const errors = {};

  if (!values.entity_id || String(values.entity_id).trim() === '') {
    errors.entity_id = 'Debe seleccionar una entidad válida.';
  } else if (!loadEntities().some((entity) => entity.entity_id === values.entity_id || entity.id === values.entity_id)) {
    errors.entity_id = 'Debe seleccionar una entidad válida.';
  }

  if (values.folio === undefined || values.folio === null || values.folio === '') {
    errors.folio = 'El folio es obligatorio.';
  } else {
    const numeric = Number(values.folio);
    if (!Number.isInteger(numeric) || numeric <= 0) {
      errors.folio = 'El folio debe ser un número entero positivo.';
    }
  }

  if (!values.startDate || !isValidDateString(String(values.startDate))) {
    errors.startDate = 'La fecha inicial es obligatoria.';
  }

  if (!values.endDate || !isValidDateString(String(values.endDate))) {
    errors.endDate = 'La fecha final es obligatoria.';
  } else if (values.startDate && isValidDateString(String(values.startDate)) && values.endDate && isValidDateString(String(values.endDate))) {
    const start = new Date(`${values.startDate}T00:00:00Z`);
    const end = new Date(`${values.endDate}T00:00:00Z`);
    if (end.getTime() < start.getTime()) {
      errors.endDate = 'La fecha final debe ser igual o posterior a la inicial.';
    }
  }

  for (const key of ['quantity', 'subtotal', 'discount', 'taxAmount', 'totalAmount']) {
    if (values[key] === undefined || values[key] === null || values[key] === '') continue;
    const numeric = Number(values[key]);
    if (!Number.isFinite(numeric)) {
      errors[key] = `${key} debe ser un número válido.`;
      continue;
    }

    if (key === 'quantity' && (!Number.isInteger(numeric) || numeric <= 0)) {
      errors.quantity = 'La cantidad debe ser un entero positivo.';
    }

    if (['subtotal', 'discount', 'taxAmount', 'totalAmount'].includes(key) && numeric < 0) {
      errors[key] = `${key} no puede ser no negativo.`;
    }
  }

  if (values.subtotal !== undefined && values.subtotal !== null && values.subtotal !== '' && values.discount !== undefined && values.discount !== null && values.discount !== '') {
    const subtotal = Number(values.subtotal);
    const discount = Number(values.discount);
    if (Number.isFinite(subtotal) && Number.isFinite(discount) && discount > subtotal) {
      errors.discount = 'El descuento no puede superar el subtotal.';
    }
  }

  if (values.totalAmount !== undefined && values.totalAmount !== null && values.totalAmount !== '' && Number(values.totalAmount) < 0) {
    errors.totalAmount = 'El monto total no puede ser negativo.';
  }

  const lifecycle = currentConfig().statusLifecycle;
  if (lifecycle && lifecycle.statuses && Array.isArray(lifecycle.statuses)) {
    if (values.status !== undefined && values.status !== null && values.status !== '' && !lifecycle.statuses.includes(values.status)) {
      errors.status = `El estado debe ser uno de: ${lifecycle.statuses.join(', ')}.`;
    }
  }

  validateCustomFields('document', values, errors);

  return { valid: Object.keys(errors).length === 0, errors };
}

export function loadDocuments() {
  return readStorage(STORE_KEYS.documents, []);
}

export function addDocument(data = {}) {
  const clean = sanitizeDocumentInput(data);
  const validation = validateDocument(clean);
  if (!validation.valid) {
    throw new Error(Object.values(validation.errors).join(' '));
  }

  const record = {
    ...clean,
    id: createId('document')
  };

  const all = loadDocuments();
  all.push(record);
  writeStorage(STORE_KEYS.documents, all);
  return record;
}

export function updateDocument(id, patch = {}) {
  const all = loadDocuments();
  const index = all.findIndex((document) => document.id === id);
  if (index === -1) return null;

  const merged = { ...all[index], ...sanitizeDocumentInput(patch) };
  const lifecycle = currentConfig().statusLifecycle;

  if (lifecycle && lifecycle.transitions && merged.status !== undefined && merged.status !== null && merged.status !== '' && all[index].status !== merged.status) {
    const allowed = lifecycle.transitions[all[index].status] || [];
    if (!allowed.includes(merged.status)) {
      throw new Error('Transición de estado inválida.');
    }
  }

  const validation = validateDocument(merged);
  if (!validation.valid) {
    throw new Error(Object.values(validation.errors).join(' '));
  }

  all[index] = merged;
  writeStorage(STORE_KEYS.documents, all);
  return all[index];
}

export function deleteDocument(id) {
  const all = loadDocuments();
  const next = all.filter((document) => document.id !== id);
  writeStorage(STORE_KEYS.documents, next);
  return next;
}

export function deleteDocumentsForEntity(entityId) {
  const documents = loadDocuments();
  const next = documents.filter((document) => document.entity_id !== entityId);
  writeStorage(STORE_KEYS.documents, next);
  return next;
}

const CRM_KEYS = Object.freeze({
  customers: 'crm_module:customers',
  employees: 'crm_module:employees',
  opportunities: 'crm_module:opportunities',
  interactions: 'crm_module:interactions'
});

const CRM_CUSTOMER_STATUSES = ['Posible', 'Activo', 'Inactivo'];
const CRM_OPPORTUNITY_STAGES = ['Evaluación', 'Propuesta', 'Negociación', 'Ganado', 'Perdido'];
const CRM_INTERACTION_TYPES = ['Llamada', 'Correo', 'Reunión'];
const CRM_STAGE_TRANSITIONS = Object.freeze({
  Evaluación: ['Propuesta', 'Perdido'],
  Propuesta: ['Negociación', 'Perdido'],
  Negociación: ['Ganado', 'Perdido'],
  Ganado: [],
  Perdido: []
});

function sanitizeCRMText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function toBoolean(value, fallback = false) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const text = value.trim().toLowerCase();
    if (['true', '1', 'yes', 'si'].includes(text)) return true;
    if (['false', '0', 'no', 'nope'].includes(text)) return false;
  }
  return fallback;
}

function normalizeCRMAliases(source = {}) {
  const record = { ...source };

  if (record.companyName === undefined && record.company_name !== undefined) {
    record.companyName = record.company_name;
  }
  if (record.contactName === undefined && record.contact_name !== undefined) {
    record.contactName = record.contact_name;
  }
  if (record.customerId === undefined && record.clientId !== undefined) {
    record.customerId = record.clientId;
  }
  if (record.clientId === undefined && record.customerId !== undefined) {
    record.clientId = record.customerId;
  }
  if (record.employeeId === undefined && record.responsibleId !== undefined) {
    record.employeeId = record.responsibleId;
  }
  if (record.employeeId === undefined && record.assignedTo !== undefined) {
    record.employeeId = record.assignedTo;
  }
  if (record.interactionType === undefined && record.type !== undefined) {
    record.interactionType = record.type;
  }
  if (record.type === undefined && record.interactionType !== undefined) {
    record.type = record.interactionType;
  }

  if (record.companyName === undefined && record.name !== undefined) {
    record.companyName = record.name;
  }
  if (record.name === undefined && record.companyName !== undefined) {
    record.name = record.companyName;
  }
  if (record.contactName === undefined && record.contact !== undefined) {
    record.contactName = record.contact;
  }
  if (record.contact === undefined && record.contactName !== undefined) {
    record.contact = record.contactName;
  }
  if (record.role === undefined && record.cargo !== undefined) {
    record.role = record.cargo;
  }
  if (record.cargo === undefined && record.role !== undefined) {
    record.cargo = record.role;
  }
  if (record.amount === undefined && record.montoEstimado !== undefined) {
    record.amount = record.montoEstimado;
  }
  if (record.closeDate === undefined && (record.fechaCierre !== undefined || record.estimatedCloseDate !== undefined)) {
    record.closeDate = record.fechaCierre ?? record.estimatedCloseDate;
  }
  if (record.stage === undefined && record.etapa !== undefined) {
    record.stage = record.etapa;
  }
  if (record.description === undefined && record.notas !== undefined) {
    record.description = record.notas;
  }

  return record;
}

function readCRMStorage(key, fallback = []) {
  const raw = globalThis.localStorage?.getItem?.(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) || fallback;
  } catch {
    return fallback;
  }
}

function writeCRMStorage(key, value) {
  globalThis.localStorage?.setItem?.(key, JSON.stringify(value));
}

function isValidDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
    return false;
  }
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime())
    && Number(date.getUTCFullYear()) === Number(value.slice(0, 4))
    && Number(date.getUTCMonth() + 1) === Number(value.slice(5, 7))
    && Number(date.getUTCDate()) === Number(value.slice(8, 10));
}

function customerMatches(record, term) {
  if (!term) return true;
  const haystack = [
    record.companyName,
    record.name,
    record.contactName,
    record.contact,
    record.email,
    record.phone,
    record.status,
    record.id,
    record.customerId,
    record.clientId
  ].join(' ').toLowerCase();
  return haystack.includes(term.toLowerCase());
}

function employeeMatches(record, term) {
  if (!term) return true;
  const haystack = [record.name, record.role, record.cargo, record.id, record.employeeId].join(' ').toLowerCase();
  return haystack.includes(term.toLowerCase());
}

function parseNumeric(value) {
  if (value === undefined || value === null || value === '') return NaN;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : NaN;
}

export function loadCustomers() {
  return readCRMStorage(CRM_KEYS.customers, []).filter((record) => record && typeof record === 'object');
}

export function loadEmployees() {
  return readCRMStorage(CRM_KEYS.employees, []).filter((record) => record && typeof record === 'object');
}

export function loadOpportunities() {
  return readCRMStorage(CRM_KEYS.opportunities, []).filter((record) => record && typeof record === 'object');
}

export function loadInteractions() {
  return readCRMStorage(CRM_KEYS.interactions, []).filter((record) => record && typeof record === 'object');
}

export function validateCustomer(data = {}) {
  const record = normalizeCRMAliases(data);
  const errors = {};

  const companyName = sanitizeCRMText(record.companyName ?? record.name);
  const contactName = sanitizeCRMText(record.contactName ?? record.contact);
  const email = sanitizeCRMText(record.email);
  const phone = sanitizeCRMText(record.phone);
  const status = (record.status || 'Posible').trim();

  if (!companyName) errors.companyName = 'El nombre de la empresa es obligatorio.';
  if (!contactName) errors.contactName = 'La persona de contacto es obligatoria.';
  if (!email) errors.email = 'El correo del cliente es obligatorio.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'El correo debe tener un formato válido.';
  if (!phone) errors.phone = 'El teléfono es obligatorio.';
  if (!CRM_CUSTOMER_STATUSES.includes(status)) errors.status = `El estado debe ser uno de: ${CRM_CUSTOMER_STATUSES.join(', ')}.`;

  const duplicateMatch = loadCustomers().find((customer) => {
    if (customer.id === record.id) return false;
    if (customer.archived) return false;
    return String(customer.email || '').trim().toLowerCase() === email.toLowerCase();
  });
  if (email && duplicateMatch) {
    errors.email = 'El correo ya está en uso por otro cliente.';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export function addCustomer(data = {}) {
  const record = normalizeCRMAliases(data);
  const validation = validateCustomer(record);
  if (!validation.valid) throw new Error(Object.values(validation.errors).join(' '));

  const next = {
    ...record,
    id: record.id || createId('customer'),
    companyName: sanitizeCRMText(record.companyName ?? record.name),
    contactName: sanitizeCRMText(record.contactName ?? record.contact),
    email: sanitizeCRMText(record.email),
    phone: sanitizeCRMText(record.phone),
    status: CRM_CUSTOMER_STATUSES.includes(record.status) ? record.status : 'Posible',
    archived: toBoolean(record.archived, false),
    createdAt: record.createdAt || new Date().toISOString()
  };

  const all = loadCustomers();
  all.push(next);
  writeCRMStorage(CRM_KEYS.customers, all);
  return next;
}

export function updateCustomer(id, patch = {}) {
  const all = loadCustomers();
  const index = all.findIndex((record) => record.id === id);
  if (index === -1) return null;

  const merged = normalizeCRMAliases({ ...all[index], ...patch });
  const validation = validateCustomer(merged);
  if (!validation.valid) throw new Error(Object.values(validation.errors).join(' '));

  all[index] = {
    ...all[index],
    ...merged,
    id: all[index].id,
    companyName: sanitizeCRMText(merged.companyName ?? merged.name),
    contactName: sanitizeCRMText(merged.contactName ?? merged.contact),
    email: sanitizeCRMText(merged.email),
    phone: sanitizeCRMText(merged.phone),
    status: CRM_CUSTOMER_STATUSES.includes(merged.status) ? merged.status : all[index].status || 'Posible',
    archived: toBoolean(merged.archived, Boolean(all[index].archived))
  };
  writeCRMStorage(CRM_KEYS.customers, all);
  return all[index];
}

export function deleteCustomer(id) {
  const all = loadCustomers();
  const next = all.map((record) => (record.id === id ? { ...record, archived: true } : record));
  writeCRMStorage(CRM_KEYS.customers, next);
  return next;
}

export function searchCustomers(term = '') {
  const search = sanitizeCRMText(String(term ?? ''));
  const all = loadCustomers().filter((record) => !record.archived);
  return search ? all.filter((record) => customerMatches(record, search)) : all;
}

export function validateEmployee(data = {}) {
  const record = normalizeCRMAliases(data);
  const errors = {};

  const name = sanitizeCRMText(record.name);
  const role = sanitizeCRMText(record.role ?? record.cargo);

  if (!name) errors.name = 'El nombre del empleado es obligatorio.';
  if (!role) errors.role = 'El cargo del empleado es obligatorio.';

  return { valid: Object.keys(errors).length === 0, errors };
}

export function loadActiveCustomers() {
  return loadCustomers().filter((record) => !record.archived);
}

export function addEmployee(data = {}) {
  const record = normalizeCRMAliases(data);
  const validation = validateEmployee(record);
  if (!validation.valid) throw new Error(Object.values(validation.errors).join(' '));

  const next = {
    ...record,
    id: record.id || createId('employee'),
    name: sanitizeCRMText(record.name),
    role: sanitizeCRMText(record.role ?? record.cargo),
    archived: toBoolean(record.archived, false),
    createdAt: record.createdAt || new Date().toISOString()
  };

  const all = loadEmployees();
  all.push(next);
  writeCRMStorage(CRM_KEYS.employees, all);
  return next;
}

export function updateEmployee(id, patch = {}) {
  const all = loadEmployees();
  const index = all.findIndex((record) => record.id === id);
  if (index === -1) return null;

  const merged = normalizeCRMAliases({ ...all[index], ...patch });
  const validation = validateEmployee(merged);
  if (!validation.valid) throw new Error(Object.values(validation.errors).join(' '));

  all[index] = {
    ...all[index],
    ...merged,
    id: all[index].id,
    name: sanitizeCRMText(merged.name),
    role: sanitizeCRMText(merged.role ?? merged.cargo),
    archived: toBoolean(merged.archived, Boolean(all[index].archived))
  };
  writeCRMStorage(CRM_KEYS.employees, all);
  return all[index];
}

export function deleteEmployee(id) {
  const all = loadEmployees();
  const next = all.map((record) => (record.id === id ? { ...record, archived: true } : record));
  writeCRMStorage(CRM_KEYS.employees, next);
  return next;
}

export function searchEmployees(term = '') {
  const search = sanitizeCRMText(String(term ?? ''));
  const all = loadEmployees().filter((record) => !record.archived);
  return search ? all.filter((record) => employeeMatches(record, search)) : all;
}

export function validateOpportunity(data = {}) {
  const record = normalizeCRMAliases(data);
  const errors = {};

  const customerId = record.clientId ?? record.customerId ?? record.customer_id ?? record.customerId;
  const employeeId = record.employeeId ?? record.responsibleId ?? record.assignedTo;
  const stage = sanitizeCRMText(record.stage ?? record.etapa) || 'Evaluación';
  const amount = parseNumeric(record.amount ?? record.montoEstimado ?? record.estimatedAmount);
  const closeDate = sanitizeCRMText(record.closeDate ?? record.fechaCierre ?? record.estimatedCloseDate);

  if (!customerId) errors.clientId = 'Debe seleccionar un cliente válido.';
  else if (!loadCustomers().some((customer) => !customer.archived && (customer.id === customerId || customer.customerId === customerId || customer.clientId === customerId))) {
    errors.clientId = 'El cliente asociado no existe o está archivado.';
  }

  if (!employeeId) errors.employeeId = 'Debe seleccionar un empleado responsable.';
  else if (!loadEmployees().some((employee) => !employee.archived && (employee.id === employeeId || employee.employeeId === employeeId))) {
    errors.employeeId = 'El empleado asociado no existe o está archivado.';
  }

  if (Number.isNaN(amount) || amount < 0) errors.amount = 'El monto estimado debe ser mayor o igual a 0.';
  if (!closeDate || !isValidDate(closeDate)) errors.closeDate = 'La fecha estimada de cierre es obligatoria.';
  if (!CRM_OPPORTUNITY_STAGES.includes(stage)) errors.stage = `La etapa debe ser una de: ${CRM_OPPORTUNITY_STAGES.join(', ')}.`;

  return { valid: Object.keys(errors).length === 0, errors };
}

export function addOpportunity(data = {}) {
  const record = normalizeCRMAliases(data);
  const validation = validateOpportunity(record);
  if (!validation.valid) throw new Error(Object.values(validation.errors).join(' '));

  const next = {
    ...record,
    id: record.id || createId('opportunity'),
    clientId: record.clientId ?? record.customerId ?? record.customer_id,
    employeeId: record.employeeId ?? record.responsibleId ?? record.assignedTo,
    amount: parseNumeric(record.amount ?? record.montoEstimado ?? record.estimatedAmount),
    closeDate: sanitizeCRMText(record.closeDate ?? record.fechaCierre ?? record.estimatedCloseDate),
    stage: sanitizeCRMText(record.stage ?? record.etapa) || 'Evaluación',
    archived: toBoolean(record.archived, false),
    createdAt: record.createdAt || new Date().toISOString()
  };

  const all = loadOpportunities();
  all.push(next);
  writeCRMStorage(CRM_KEYS.opportunities, all);
  return next;
}

export function updateOpportunity(id, patch = {}) {
  const all = loadOpportunities();
  const index = all.findIndex((record) => record.id === id);
  if (index === -1) return null;

  const merged = normalizeCRMAliases({ ...all[index], ...patch });
  const validation = validateOpportunity(merged);
  if (!validation.valid) throw new Error(Object.values(validation.errors).join(' '));

  const nextStage = sanitizeCRMText(merged.stage ?? merged.etapa) || all[index].stage || 'Evaluación';
  if (all[index].stage && all[index].stage !== nextStage && !((CRM_STAGE_TRANSITIONS[all[index].stage] || []).includes(nextStage))) {
    throw new Error('La transición de etapa no está permitida.');
  }

  all[index] = {
    ...all[index],
    ...merged,
    id: all[index].id,
    clientId: merged.clientId ?? merged.customerId ?? merged.customer_id ?? all[index].clientId,
    employeeId: merged.employeeId ?? merged.responsibleId ?? merged.assignedTo ?? all[index].employeeId,
    amount: parseNumeric(merged.amount ?? merged.montoEstimado ?? merged.estimatedAmount ?? all[index].amount),
    closeDate: sanitizeCRMText(merged.closeDate ?? merged.fechaCierre ?? merged.estimatedCloseDate ?? all[index].closeDate),
    stage: nextStage,
    archived: toBoolean(merged.archived, Boolean(all[index].archived))
  };
  writeCRMStorage(CRM_KEYS.opportunities, all);
  return all[index];
}

export function deleteOpportunity(id) {
  const all = loadOpportunities();
  const next = all.filter((record) => record.id !== id);
  writeCRMStorage(CRM_KEYS.opportunities, next);
  return next;
}

export function searchOpportunities({ stage, employeeId, customerId, fromDate, toDate, term = '' } = {}) {
  const all = loadOpportunities().filter((record) => !record.archived);
  const text = sanitizeCRMText(term);

  return all.filter((record) => {
    const recordStage = record.stage || 'Evaluación';
    const clientMatch = !customerId || (record.clientId ?? record.customerId) === customerId;
    const employeeMatch = !employeeId || (record.employeeId ?? record.responsibleId) === employeeId;
    const stageMatch = !stage || recordStage === stage;
    const fromMatch = !fromDate || !record.closeDate || record.closeDate >= fromDate;
    const toMatch = !toDate || !record.closeDate || record.closeDate <= toDate;
    const textMatch = !text || [record.description, record.stage, record.id, record.clientId, record.employeeId].join(' ').toLowerCase().includes(text.toLowerCase());
    return clientMatch && employeeMatch && stageMatch && fromMatch && toMatch && textMatch;
  });
}

export function validateInteraction(data = {}) {
  const record = normalizeCRMAliases(data);
  const errors = {};

  const customerId = record.clientId ?? record.customerId ?? record.customer_id;
  const employeeId = record.employeeId ?? record.responsibleId ?? record.assignedTo;
  const dateValue = sanitizeCRMText(record.date ?? record.fecha ?? record.interactionDate);
  const interactionType = sanitizeCRMText(record.type ?? record.interactionType);

  if (!customerId) errors.clientId = 'Debe seleccionar un cliente válido.';
  else if (!loadCustomers().some((customer) => !customer.archived && (customer.id === customerId || customer.customerId === customerId || customer.clientId === customerId))) {
    errors.clientId = 'El cliente asociado no existe o está archivado.';
  }

  if (!employeeId) errors.employeeId = 'Debe seleccionar un empleado responsable.';
  else if (!loadEmployees().some((employee) => !employee.archived && (employee.id === employeeId || employee.employeeId === employeeId || employee.responsibleId === employeeId))) {
    errors.employeeId = 'El empleado asociado no existe o está archivado.';
  }

  if (!dateValue || !isValidDate(dateValue)) errors.date = 'La fecha de la interacción es obligatoria.';
  if (!interactionType || !CRM_INTERACTION_TYPES.includes(interactionType)) errors.type = `El tipo debe ser uno de: ${CRM_INTERACTION_TYPES.join(', ')}.`;

  return { valid: Object.keys(errors).length === 0, errors };
}

export function addInteraction(data = {}) {
  const record = normalizeCRMAliases(data);
  const validation = validateInteraction(record);
  if (!validation.valid) throw new Error(Object.values(validation.errors).join(' '));

  const next = {
    ...record,
    id: record.id || createId('interaction'),
    clientId: record.clientId ?? record.customerId ?? record.customer_id,
    employeeId: record.employeeId ?? record.responsibleId ?? record.assignedTo,
    date: sanitizeCRMText(record.date ?? record.fecha ?? record.interactionDate),
    type: sanitizeCRMText(record.type ?? record.interactionType),
    description: sanitizeCRMText(record.description ?? record.notes ?? ''),
    archived: toBoolean(record.archived, false),
    createdAt: record.createdAt || new Date().toISOString()
  };

  const all = loadInteractions();
  all.push(next);
  writeCRMStorage(CRM_KEYS.interactions, all);
  return next;
}

export function updateInteraction(id, patch = {}) {
  const all = loadInteractions();
  const index = all.findIndex((record) => record.id === id);
  if (index === -1) return null;

  const merged = normalizeCRMAliases({ ...all[index], ...patch });
  const validation = validateInteraction(merged);
  if (!validation.valid) throw new Error(Object.values(validation.errors).join(' '));

  all[index] = {
    ...all[index],
    ...merged,
    id: all[index].id,
    clientId: merged.clientId ?? merged.customerId ?? merged.customer_id ?? all[index].clientId,
    employeeId: merged.employeeId ?? merged.responsibleId ?? merged.assignedTo ?? all[index].employeeId,
    date: sanitizeCRMText(merged.date ?? merged.fecha ?? merged.interactionDate ?? all[index].date),
    type: sanitizeCRMText(merged.type ?? merged.interactionType ?? all[index].type),
    description: sanitizeCRMText(merged.description ?? merged.notes ?? all[index].description ?? ''),
    archived: toBoolean(merged.archived, Boolean(all[index].archived))
  };
  writeCRMStorage(CRM_KEYS.interactions, all);
  return all[index];
}

export function deleteInteraction(id) {
  const all = loadInteractions();
  const next = all.filter((record) => record.id !== id);
  writeCRMStorage(CRM_KEYS.interactions, next);
  return next;
}

export function getCRMOverview() {
  const customers = loadCustomers().filter((record) => !record.archived);
  const opportunities = loadOpportunities().filter((record) => !record.archived);
  const employeeCount = loadEmployees().filter((record) => !record.archived).length;

  const activeCustomers = customers.filter((customer) => customer.status === 'Activo').length;
  const openOpportunities = opportunities.filter((opportunity) => !['Ganado', 'Perdido'].includes(opportunity.stage || 'Evaluación'));
  const totalPipeline = openOpportunities.reduce((sum, opportunity) => sum + (Number(opportunity.amount) || 0), 0);

  const today = new Date();
  const targetMs = 30 * 24 * 60 * 60 * 1000;
  const upcomingClosures = openOpportunities.filter((opportunity) => {
    if (!opportunity.closeDate || !isValidDate(opportunity.closeDate)) return false;
    const closeTime = new Date(`${opportunity.closeDate}T00:00:00Z`).getTime();
    const delta = closeTime - today.getTime();
    return delta >= 0 && delta <= targetMs;
  }).length;

  return {
    totalCustomers: customers.length,
    activeCustomers,
    employeeCount,
    openOpportunities: openOpportunities.length,
    totalPipeline,
    upcomingClosures,
    customers,
    opportunities,
    employees: loadEmployees().filter((record) => !record.archived)
  };
}

export function getDashboardMetrics() {
  return getCRMOverview();
}

export function getCrmDashboardMetrics() {
  return getCRMOverview();
}

export function getCustomerActivity(customerId) {
  const customer = loadCustomers().find((record) => record.id === customerId);
  if (!customer) return { customer: null, opportunities: [], interactions: [] };
  return {
    customer,
    opportunities: loadOpportunities().filter((record) => (record.clientId ?? record.customerId) === customerId && !record.archived),
    interactions: loadInteractions().filter((record) => (record.clientId ?? record.customerId) === customerId && !record.archived)
  };
}

export function getCustomerById(customerId) {
  return loadCustomers().find((record) => record.id === customerId);
}

export function getEmployeeById(employeeId) {
  return loadEmployees().find((record) => record.id === employeeId);
}

export const CRM_DEFAULTS = Object.freeze({
  customerStatuses: [...CRM_CUSTOMER_STATUSES],
  opportunityStages: [...CRM_OPPORTUNITY_STAGES],
  interactionTypes: [...CRM_INTERACTION_TYPES],
  stageTransitions: { ...CRM_STAGE_TRANSITIONS }
});

export function clearCRMData() {
  writeCRMStorage(CRM_KEYS.customers, []);
  writeCRMStorage(CRM_KEYS.employees, []);
  writeCRMStorage(CRM_KEYS.opportunities, []);
  writeCRMStorage(CRM_KEYS.interactions, []);
}

export const customerStatuses = CRM_DEFAULTS.customerStatuses;
export const opportunityStages = CRM_DEFAULTS.opportunityStages;
export const interactionTypes = CRM_DEFAULTS.interactionTypes;
