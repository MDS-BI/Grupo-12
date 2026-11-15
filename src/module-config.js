export const BASE_FIELDS = Object.freeze({
  entity: [
    'id',
    'entity_id',
    'name',
    'code',
    'taxId',
    'email',
    'phone',
    'address',
    'category',
    'targetDate',
    'creditLimit',
    'paymentTerms'
  ],
  document: [
    'id',
    'entity_id',
    'series',
    'folio',
    'startDate',
    'endDate',
    'quantity',
    'subtotal',
    'discount',
    'taxAmount',
    'totalAmount',
    'currency',
    'paymentTerms',
    'notes',
    'status'
  ]
});

export const FIELD_TYPES = Object.freeze(['text', 'number', 'date', 'select']);

export const CRM_DEFAULT_STAGE_SEQUENCE = Object.freeze([
  'Evaluación',
  'Propuesta',
  'Negociación',
  'Ganado',
  'Perdido'
]);

export const CRM_DEFAULT_INTERACTION_TYPES = Object.freeze([
  'Llamada',
  'Correo',
  'Reunión'
]);

export const CRM_DEFAULT_CUSTOMER_STATUSES = Object.freeze([
  'Posible',
  'Activo',
  'Inactivo'
]);

export const DEFAULT_CONFIG = Object.freeze({
  moduleName: 'CRM',
  labels: Object.freeze({
    entity: 'Cliente',
    entities: 'Clientes',
    document: 'Oportunidad',
    documents: 'Oportunidades',
    dashboard: 'Dashboard',
    search: 'Búsqueda',
    customers: 'Clientes',
    customer: 'Cliente',
    employees: 'Empleados',
    employee: 'Empleado',
    opportunities: 'Oportunidades',
    opportunity: 'Oportunidad',
    interactions: 'Interacciones',
    interaction: 'Interacción'
  }),
  customFields: [],
  statusLifecycle: Object.freeze({
    statuses: [...CRM_DEFAULT_CUSTOMER_STATUSES],
    transitions: {
      Posible: ['Activo', 'Inactivo'],
      Activo: ['Inactivo'],
      Inactivo: ['Activo']
    }
  }),
  theme: Object.freeze({ accentColor: '#2563eb' }),
  moduleType: 'crm'
});

export const CRM_DEFAULT_CONFIG = Object.freeze({
  moduleName: 'CRM',
  labels: Object.freeze({
    entity: 'Cliente',
    entities: 'Clientes',
    document: 'Oportunidad',
    documents: 'Oportunidades',
    dashboard: 'Dashboard',
    search: 'Búsqueda',
    employees: 'Empleados',
    employee: 'Empleado',
    opportunities: 'Oportunidades',
    opportunity: 'Oportunidad',
    interactions: 'Interacciones',
    interaction: 'Interacción'
  }),
  customFields: [],
  statusLifecycle: Object.freeze({
    statuses: [...CRM_DEFAULT_CUSTOMER_STATUSES],
    transitions: {
      Posible: ['Activo', 'Inactivo'],
      Activo: ['Inactivo'],
      Inactivo: ['Activo']
    }
  }),
  theme: Object.freeze({ accentColor: '#2563eb' }),
  moduleType: 'crm'
});

export const userConfig = null;

let activeConfig = null;

function cloneDefaultConfig() {
  return {
    moduleName: DEFAULT_CONFIG.moduleName,
    labels: { ...DEFAULT_CONFIG.labels },
    customFields: Array.from(DEFAULT_CONFIG.customFields),
    statusLifecycle: DEFAULT_CONFIG.statusLifecycle,
    theme: { ...DEFAULT_CONFIG.theme },
    moduleType: DEFAULT_CONFIG.moduleType
  };
}

function isHexColor(value) {
  return typeof value === 'string' && /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value.trim());
}

function toSafeFieldArray(value) {
  return Array.isArray(value) ? value : [];
}

export function normalizeConfig(rawConfig) {
  const defaults = cloneDefaultConfig();
  const source = rawConfig && typeof rawConfig === 'object' ? rawConfig : {};
  const normalized = {
    moduleName: typeof source.moduleName === 'string' && source.moduleName.trim() ? source.moduleName.trim() : defaults.moduleName,
    labels: {
      ...defaults.labels,
      ...(source.labels && typeof source.labels === 'object' && !Array.isArray(source.labels) ? source.labels : {})
    },
    customFields: Array.isArray(source.customFields) ? source.customFields.map((field) => ({ ...field })) : [...defaults.customFields],
    statusLifecycle: source.statusLifecycle === undefined ? defaults.statusLifecycle : source.statusLifecycle,
    theme: {
      ...defaults.theme,
      ...(source.theme && typeof source.theme === 'object' && !Array.isArray(source.theme) ? source.theme : {})
    },
    moduleType: source.moduleType === 'generic' ? 'generic' : (source.moduleType === 'crm' ? 'crm' : defaults.moduleType)
  };

  const errors = [];

  if (!rawConfig || rawConfig === null) {
    return { config: normalized, errors };
  }

  if (rawConfig.moduleName !== undefined && (typeof rawConfig.moduleName !== 'string' || !rawConfig.moduleName.trim())) {
    errors.push('moduleName debe tener un valor válido.');
    normalized.moduleName = defaults.moduleName;
  }

  if (rawConfig.labels != null && (typeof rawConfig.labels !== 'object' || Array.isArray(rawConfig.labels))) {
    errors.push('labels debe ser un objeto.');
    normalized.labels = { ...defaults.labels };
  }

  if (rawConfig.customFields != null && !Array.isArray(rawConfig.customFields)) {
    errors.push('customFields debe ser una lista de campos.');
    normalized.customFields = [];
  }

  const seen = {};
  for (const field of normalized.customFields) {
    if (!field || typeof field !== 'object') {
      errors.push('Cada campo personalizado debe ser un objeto.');
      continue;
    }

    const target = field.target === 'document' ? 'document' : 'entity';
    const key = typeof field.key === 'string' ? field.key.trim() : '';
    const type = typeof field.type === 'string' ? field.type : '';

    if (!key) {
      errors.push('Cada campo personalizado requiere una clave válida.');
      continue;
    }

    const collisionSet = BASE_FIELDS[target];
    if (collisionSet.includes(key)) {
      errors.push(`El campo personalizado '${key}' choca con un campo base de ${target}.`);
    }

    const seenKey = `${target}:${key}`;
    if (seen[seenKey]) {
      errors.push(`El campo personalizado '${key}' no puede aparecer más de una vez por destino.`);
    }
    seen[seenKey] = true;

    if (!FIELD_TYPES.includes(type)) {
      errors.push(`El campo '${key}' tiene un type no válido: '${type}'.`);
    }

    if (type === 'select') {
      const options = toSafeFieldArray(field.options);
      if (options.length === 0) {
        errors.push(`El campo '${key}' de tipo select requiere opciones (options).`);
      }
    }

    if (field.required !== undefined && typeof field.required !== 'boolean') {
      errors.push(`El campo '${key}' requiere un valor booleano en required.`);
    }
  }

  if (rawConfig.statusLifecycle !== undefined && rawConfig.statusLifecycle !== null && typeof rawConfig.statusLifecycle !== 'object') {
    errors.push('statusLifecycle debe ser un objeto o null.');
    normalized.statusLifecycle = defaults.statusLifecycle;
  }

  if (normalized.statusLifecycle && typeof normalized.statusLifecycle === 'object') {
    const lifecycle = normalized.statusLifecycle;
    const statuses = Array.isArray(lifecycle.statuses) ? lifecycle.statuses : [];
    const transitions = lifecycle.transitions && typeof lifecycle.transitions === 'object' ? lifecycle.transitions : {};

    if (!Array.isArray(lifecycle.statuses) || statuses.length === 0) {
      errors.push('statusLifecycle.statuses debe ser una lista con al menos un estado.');
      normalized.statusLifecycle = defaults.statusLifecycle;
    } else {
      for (const status of statuses) {
        if (typeof status !== 'string' || !status.trim()) {
          errors.push('Los estados del ciclo de vida deben ser textos válidos.');
          break;
        }
      }

      for (const [fromStatus, nextStatuses] of Object.entries(transitions)) {
        if (!statuses.includes(fromStatus)) {
          errors.push(`La transición '${fromStatus}' hace referencia a un estado desconocido.`);
        }
        if (!Array.isArray(nextStatuses)) {
          errors.push(`Las transiciones de '${fromStatus}' deben ser una lista.`);
          continue;
        }

        for (const nextStatus of nextStatuses) {
          if (!statuses.includes(nextStatus)) {
            errors.push(`La transición '${fromStatus}' apunta a '${nextStatus}', que no existe en el ciclo de vida.`);
          }
        }
      }
    }
  }

  if (rawConfig.theme !== undefined && rawConfig.theme !== null && (typeof rawConfig.theme !== 'object' || Array.isArray(rawConfig.theme))) {
    errors.push('theme debe ser un objeto.');
    normalized.theme = { ...defaults.theme };
  }

  if (normalized.theme && typeof normalized.theme === 'object') {
    const accent = normalized.theme.accentColor;
    if (accent === undefined || accent === null || accent === '') {
      normalized.theme.accentColor = defaults.theme.accentColor;
    } else if (!isHexColor(accent)) {
      errors.push('theme.accentColor debe ser un valor hexadecimal válido (ej. #0f62fe).');
      normalized.theme.accentColor = defaults.theme.accentColor;
    }
  }

  return { config: normalized, errors };
}

export function setActiveConfig(config) {
  const value = config && config.config ? config.config : config ?? cloneDefaultConfig();
  activeConfig = value;
  return activeConfig;
}

export function getConfig() {
  return activeConfig || cloneDefaultConfig();
}

export function labelFor(key) {
  const labels = getConfig().labels || DEFAULT_CONFIG.labels;
  return labels[key] || DEFAULT_CONFIG.labels[key] || key;
}

export async function loadModuleConfig() {
  const userSet = (typeof globalThis !== 'undefined' && globalThis.userConfig !== undefined) ? globalThis.userConfig : userConfig;
  const normalized = normalizeConfig(userSet);
  setActiveConfig(normalized.config);
  return normalized;
}
