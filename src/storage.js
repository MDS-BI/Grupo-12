import {
  CLIENT_STATES,
  DEFAULT_CLIENT_STATE,
  DEFAULT_STAGE,
  DEFAULT_STAGE_TRANSITIONS,
  INTERACTION_TYPES,
  OPPORTUNITY_STAGES,
  canTransition,
  computeDashboardMetrics,
  isTerminalStage,
  isValidDate,
  isValidEmail,
  normalizeEmail
} from './domain.js';

export const STORAGE_KEYS = {
  clients: 'crm.clients',
  employees: 'crm.employees',
  opportunities: 'crm.opportunities',
  interactions: 'crm.interactions'
};

const storageErrors = [];

export class ValidationError extends Error {
  constructor(errors) {
    super('Datos inválidos');
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

export function consumeStorageErrors() {
  const errors = [...storageErrors];
  storageErrors.length = 0;
  return errors;
}

export function clearAll() {
  Object.values(STORAGE_KEYS).forEach((key) => {
    if (typeof localStorage !== 'undefined') localStorage.removeItem(key);
  });
}

function readArray(key) {
  if (typeof localStorage === 'undefined') return [];
  const raw = localStorage.getItem(key);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      storageErrors.push(`El almacenamiento de "${key}" no contiene una lista válida.`);
      return [];
    }
    return parsed;
  } catch {
    storageErrors.push(`El almacenamiento de "${key}" contiene datos corruptos.`);
    return [];
  }
}

function writeArray(key, records) {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(records));
}

function generateId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function timestamp() {
  return new Date().toISOString();
}

function text(value) {
  return String(value ?? '').trim();
}

function findRecord(records, id) {
  return records.find((record) => record.id === id);
}

export function isEmailAvailable(correo, excludeId = null, clients = loadClients()) {
  const normalized = normalizeEmail(correo);
  if (!normalized) return true;
  return !clients.some(
    (client) => client.id !== excludeId && normalizeEmail(client.correo) === normalized
  );
}

export function validateClient(data, { clients = loadClients(), excludeId = null } = {}) {
  const errors = [];

  if (!text(data.nombreEmpresa)) {
    errors.push({ field: 'nombreEmpresa', message: 'El nombre de la empresa es obligatorio.' });
  }
  if (!text(data.personaContacto)) {
    errors.push({ field: 'personaContacto', message: 'La persona de contacto es obligatoria.' });
  }
  if (!text(data.correo)) {
    errors.push({ field: 'correo', message: 'El correo electrónico es obligatorio.' });
  } else if (!isValidEmail(data.correo)) {
    errors.push({ field: 'correo', message: 'El correo electrónico no tiene un formato válido.' });
  } else if (!isEmailAvailable(data.correo, excludeId, clients)) {
    errors.push({ field: 'correo', message: 'El correo electrónico ya está en uso.' });
  }
  if (!text(data.telefono)) {
    errors.push({ field: 'telefono', message: 'El teléfono es obligatorio.' });
  }

  const estado = data.estado ?? DEFAULT_CLIENT_STATE;
  if (!CLIENT_STATES.includes(estado)) {
    errors.push({ field: 'estado', message: 'El estado del cliente no es válido.' });
  }

  return {
    valid: errors.length === 0,
    errors,
    value: {
      ...data,
      nombreEmpresa: text(data.nombreEmpresa),
      personaContacto: text(data.personaContacto),
      correo: text(data.correo),
      telefono: text(data.telefono),
      estado
    }
  };
}

export function validateEmployee(data) {
  const errors = [];
  if (!text(data.nombre)) {
    errors.push({ field: 'nombre', message: 'El nombre del empleado es obligatorio.' });
  }
  if (!text(data.cargo)) {
    errors.push({ field: 'cargo', message: 'El cargo del empleado es obligatorio.' });
  }
  return {
    valid: errors.length === 0,
    errors,
    value: { ...data, nombre: text(data.nombre), cargo: text(data.cargo) }
  };
}

function validateReference(id, records, field, label, errors) {
  if (!text(id)) {
    errors.push({ field, message: `Debe seleccionar un ${label}.` });
    return;
  }
  const record = findRecord(records, id);
  if (!record) {
    errors.push({ field, message: `El ${label} seleccionado no existe.` });
    return;
  }
  if (record.archived) {
    errors.push({ field, message: `El ${label} seleccionado está archivado.` });
  }
}

export function validateOpportunity(
  data,
  {
    clients = loadClients(),
    employees = loadEmployees(),
    transitions = DEFAULT_STAGE_TRANSITIONS,
    previousStage = null
  } = {}
) {
  const errors = [];

  validateReference(data.clienteId, clients, 'clienteId', 'cliente', errors);
  validateReference(data.empleadoId, employees, 'empleadoId', 'empleado', errors);

  const monto = data.montoEstimado;
  if (monto === '' || monto === null || monto === undefined) {
    errors.push({ field: 'montoEstimado', message: 'El monto estimado es obligatorio.' });
  } else if (Number.isNaN(Number(monto)) || Number(monto) < 0) {
    errors.push({ field: 'montoEstimado', message: 'El monto estimado debe ser mayor o igual a cero.' });
  }

  if (!text(data.fechaEstimadaCierre)) {
    errors.push({ field: 'fechaEstimadaCierre', message: 'La fecha estimada de cierre es obligatoria.' });
  } else if (!isValidDate(data.fechaEstimadaCierre)) {
    errors.push({ field: 'fechaEstimadaCierre', message: 'La fecha estimada de cierre no es válida.' });
  }

  const etapa = data.etapa ?? DEFAULT_STAGE;
  if (!OPPORTUNITY_STAGES.includes(etapa)) {
    errors.push({ field: 'etapa', message: 'La etapa de la oportunidad no es válida.' });
  } else if (previousStage && etapa !== previousStage && !canTransition(previousStage, etapa, transitions)) {
    errors.push({
      field: 'etapa',
      message: `No se puede pasar de "${previousStage}" a "${etapa}".`
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    value: {
      ...data,
      descripcion: text(data.descripcion),
      montoEstimado: Number(monto),
      etapa,
      fechaEstimadaCierre: text(data.fechaEstimadaCierre)
    }
  };
}

export function validateInteraction(
  data,
  { clients = loadClients(), employees = loadEmployees() } = {}
) {
  const errors = [];

  validateReference(data.clienteId, clients, 'clienteId', 'cliente', errors);
  validateReference(data.empleadoId, employees, 'empleadoId', 'empleado', errors);

  if (!text(data.fecha)) {
    errors.push({ field: 'fecha', message: 'La fecha de la interacción es obligatoria.' });
  } else if (!isValidDate(data.fecha)) {
    errors.push({ field: 'fecha', message: 'La fecha de la interacción no es válida.' });
  }

  if (!text(data.tipo)) {
    errors.push({ field: 'tipo', message: 'El tipo de interacción es obligatorio.' });
  } else if (!INTERACTION_TYPES.includes(data.tipo)) {
    errors.push({ field: 'tipo', message: 'El tipo de interacción no es válido.' });
  }

  return {
    valid: errors.length === 0,
    errors,
    value: {
      ...data,
      fecha: text(data.fecha),
      tipo: text(data.tipo),
      descripcion: text(data.descripcion)
    }
  };
}

export function loadClients() {
  return readArray(STORAGE_KEYS.clients);
}

export function loadEmployees() {
  return readArray(STORAGE_KEYS.employees);
}

export function loadOpportunities() {
  return readArray(STORAGE_KEYS.opportunities);
}

export function loadInteractions() {
  return readArray(STORAGE_KEYS.interactions);
}

export function loadActiveClients() {
  return loadClients().filter((client) => !client.archived);
}

export function loadActiveEmployees() {
  return loadEmployees().filter((employee) => !employee.archived);
}

export function addClient(data) {
  const { valid, errors, value } = validateClient(data);
  if (!valid) throw new ValidationError(errors);
  const client = {
    ...value,
    id: generateId('cli'),
    archived: false,
    createdAt: timestamp(),
    updatedAt: timestamp()
  };
  const clients = loadClients();
  clients.push(client);
  writeArray(STORAGE_KEYS.clients, clients);
  return client;
}

export function updateClient(id, updates) {
  const clients = loadClients();
  const index = clients.findIndex((client) => client.id === id);
  if (index < 0) throw new ValidationError([{ field: 'id', message: 'Cliente no encontrado.' }]);
  const merged = { ...clients[index], ...updates, id };
  const { valid, errors, value } = validateClient(merged, { clients, excludeId: id });
  if (!valid) throw new ValidationError(errors);
  const updated = { ...value, id, createdAt: clients[index].createdAt, updatedAt: timestamp() };
  clients[index] = updated;
  writeArray(STORAGE_KEYS.clients, clients);
  return updated;
}

export function archiveClient(id) {
  const clients = loadClients();
  const index = clients.findIndex((client) => client.id === id);
  if (index < 0) throw new ValidationError([{ field: 'id', message: 'Cliente no encontrado.' }]);
  clients[index] = { ...clients[index], archived: true, updatedAt: timestamp() };
  writeArray(STORAGE_KEYS.clients, clients);
  return clients[index];
}

export function unarchiveClient(id) {
  const clients = loadClients();
  const index = clients.findIndex((client) => client.id === id);
  if (index < 0) throw new ValidationError([{ field: 'id', message: 'Cliente no encontrado.' }]);
  if (!isEmailAvailable(clients[index].correo, id, clients)) {
    throw new ValidationError([
      { field: 'correo', message: 'El correo del cliente ya está en uso por otro registro.' }
    ]);
  }
  clients[index] = { ...clients[index], archived: false, updatedAt: timestamp() };
  writeArray(STORAGE_KEYS.clients, clients);
  return clients[index];
}

export function addEmployee(data) {
  const { valid, errors, value } = validateEmployee(data);
  if (!valid) throw new ValidationError(errors);
  const employee = {
    ...value,
    id: generateId('emp'),
    archived: false,
    createdAt: timestamp(),
    updatedAt: timestamp()
  };
  const employees = loadEmployees();
  employees.push(employee);
  writeArray(STORAGE_KEYS.employees, employees);
  return employee;
}

export function updateEmployee(id, updates) {
  const employees = loadEmployees();
  const index = employees.findIndex((employee) => employee.id === id);
  if (index < 0) throw new ValidationError([{ field: 'id', message: 'Empleado no encontrado.' }]);
  const merged = { ...employees[index], ...updates, id };
  const { valid, errors, value } = validateEmployee(merged);
  if (!valid) throw new ValidationError(errors);
  const updated = { ...value, id, createdAt: employees[index].createdAt, updatedAt: timestamp() };
  employees[index] = updated;
  writeArray(STORAGE_KEYS.employees, employees);
  return updated;
}

export function archiveEmployee(id) {
  const employees = loadEmployees();
  const index = employees.findIndex((employee) => employee.id === id);
  if (index < 0) throw new ValidationError([{ field: 'id', message: 'Empleado no encontrado.' }]);
  employees[index] = { ...employees[index], archived: true, updatedAt: timestamp() };
  writeArray(STORAGE_KEYS.employees, employees);
  return employees[index];
}

export function addOpportunity(data, options = {}) {
  const { valid, errors, value } = validateOpportunity(data, options);
  if (!valid) throw new ValidationError(errors);
  const opportunity = {
    ...value,
    id: generateId('opp'),
    etapa: value.etapa ?? DEFAULT_STAGE,
    createdAt: timestamp(),
    updatedAt: timestamp()
  };
  const opportunities = loadOpportunities();
  opportunities.push(opportunity);
  writeArray(STORAGE_KEYS.opportunities, opportunities);
  return opportunity;
}

export function updateOpportunity(id, updates, { transitions = DEFAULT_STAGE_TRANSITIONS } = {}) {
  const opportunities = loadOpportunities();
  const index = opportunities.findIndex((opportunity) => opportunity.id === id);
  if (index < 0) {
    throw new ValidationError([{ field: 'id', message: 'Oportunidad no encontrada.' }]);
  }
  const current = opportunities[index];
  const merged = { ...current, ...updates, id };
  const { valid, errors, value } = validateOpportunity(merged, {
    transitions,
    previousStage: current.etapa
  });
  if (!valid) throw new ValidationError(errors);
  const updated = { ...value, id, createdAt: current.createdAt, updatedAt: timestamp() };
  opportunities[index] = updated;
  writeArray(STORAGE_KEYS.opportunities, opportunities);
  return updated;
}

export function deleteOpportunity(id) {
  const opportunities = loadOpportunities();
  writeArray(
    STORAGE_KEYS.opportunities,
    opportunities.filter((opportunity) => opportunity.id !== id)
  );
}

export function addInteraction(data, options = {}) {
  const { valid, errors, value } = validateInteraction(data, options);
  if (!valid) throw new ValidationError(errors);
  const interaction = {
    ...value,
    id: generateId('int'),
    createdAt: timestamp(),
    updatedAt: timestamp()
  };
  const interactions = loadInteractions();
  interactions.push(interaction);
  writeArray(STORAGE_KEYS.interactions, interactions);
  return interaction;
}

export function updateInteraction(id, updates, options = {}) {
  const interactions = loadInteractions();
  const index = interactions.findIndex((interaction) => interaction.id === id);
  if (index < 0) {
    throw new ValidationError([{ field: 'id', message: 'Interacción no encontrada.' }]);
  }
  const current = interactions[index];
  const merged = { ...current, ...updates, id };
  const { valid, errors, value } = validateInteraction(merged, options);
  if (!valid) throw new ValidationError(errors);
  const updated = { ...value, id, createdAt: current.createdAt, updatedAt: timestamp() };
  interactions[index] = updated;
  writeArray(STORAGE_KEYS.interactions, interactions);
  return updated;
}

export function deleteInteraction(id) {
  const interactions = loadInteractions();
  writeArray(
    STORAGE_KEYS.interactions,
    interactions.filter((interaction) => interaction.id !== id)
  );
}

export function getClientDetail(clientId) {
  const client = findRecord(loadClients(), clientId);
  if (!client) return null;
  return {
    client,
    opportunities: loadOpportunities().filter((opportunity) => opportunity.clienteId === clientId),
    interactions: loadInteractions().filter((interaction) => interaction.clienteId === clientId)
  };
}

export function getDashboardMetrics(today = new Date()) {
  return computeDashboardMetrics(
    { clients: loadClients(), opportunities: loadOpportunities() },
    today
  );
}

export function checkReferentialIntegrity() {
  const clients = loadClients();
  const employees = loadEmployees();
  const clientIds = new Set(clients.map((client) => client.id));
  const employeeIds = new Set(employees.map((employee) => employee.id));
  const issues = [];

  loadOpportunities().forEach((opportunity) => {
    if (!clientIds.has(opportunity.clienteId)) {
      issues.push(`La oportunidad "${opportunity.id}" referencia un cliente inexistente.`);
    }
    if (!employeeIds.has(opportunity.empleadoId)) {
      issues.push(`La oportunidad "${opportunity.id}" referencia un empleado inexistente.`);
    }
  });

  loadInteractions().forEach((interaction) => {
    if (!clientIds.has(interaction.clienteId)) {
      issues.push(`La interacción "${interaction.id}" referencia un cliente inexistente.`);
    }
    if (!employeeIds.has(interaction.empleadoId)) {
      issues.push(`La interacción "${interaction.id}" referencia un empleado inexistente.`);
    }
  });

  return issues;
}

export function isTerminal(etapa) {
  return isTerminalStage(etapa);
}
