import { BASE_FIELD_KEYS, DEFAULT_STAGE_TRANSITIONS, OPPORTUNITY_STAGES } from './domain.js';

const TARGETS = ['cliente', 'empleado', 'oportunidad', 'interaccion'];
const FIELD_TYPES = ['text', 'number', 'date', 'select'];
const COLOR_PATTERN = /^(#[0-9a-f]{3,8}|rgba?\([^)]*\)|hsla?\([^)]*\)|[a-z]+)$/i;

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function createDefaultConfig() {
  return {
    moduleName: 'Módulo CRM',
    labels: {},
    customFields: [],
    opportunityLifecycle: {
      stages: [...OPPORTUNITY_STAGES],
      transitions: clone(DEFAULT_STAGE_TRANSITIONS)
    },
    theme: { accentColor: '#0f62fe' }
  };
}

export function resolveLabel(config, key, fallback) {
  const value = config?.labels?.[key];
  return typeof value === 'string' && value.trim() ? value : fallback;
}

export function customFieldsFor(config, target) {
  return (config?.customFields ?? []).filter((field) => field.target === target);
}

function validateCustomFields(customFields, config, errors) {
  if (!Array.isArray(customFields)) {
    errors.push('customFields debe ser una lista.');
    return;
  }
  customFields.forEach((field, index) => {
    if (!field || typeof field !== 'object') {
      errors.push(`El campo personalizado #${index + 1} no es válido.`);
      return;
    }
    if (!TARGETS.includes(field.target)) {
      errors.push(`El campo "${field.key ?? index}" tiene un destino desconocido.`);
      return;
    }
    if (typeof field.key !== 'string' || !field.key.trim()) {
      errors.push(`El campo personalizado #${index + 1} necesita una clave.`);
      return;
    }
    if (BASE_FIELD_KEYS.includes(field.key)) {
      errors.push(`La clave "${field.key}" choca con un campo base.`);
      return;
    }
    if (!FIELD_TYPES.includes(field.type)) {
      errors.push(`El campo "${field.key}" tiene un tipo no soportado.`);
      return;
    }
    if (field.type === 'select' && !Array.isArray(field.options)) {
      errors.push(`El campo de selección "${field.key}" necesita opciones.`);
      return;
    }
    config.customFields.push({
      target: field.target,
      key: field.key,
      label: field.label || field.key,
      type: field.type,
      required: Boolean(field.required),
      options: field.type === 'select' ? field.options.map(String) : undefined
    });
  });
}

function validateLifecycle(lifecycle, config, errors) {
  if (!lifecycle || typeof lifecycle !== 'object') {
    errors.push('opportunityLifecycle debe ser un objeto.');
    return;
  }
  const stages = Array.isArray(lifecycle.stages) ? lifecycle.stages : OPPORTUNITY_STAGES;
  const invalidStage = stages.find((stage) => !OPPORTUNITY_STAGES.includes(stage));
  if (invalidStage) {
    errors.push(`La etapa "${invalidStage}" no es válida.`);
    return;
  }
  const transitions = lifecycle.transitions;
  if (!transitions || typeof transitions !== 'object') {
    errors.push('opportunityLifecycle.transitions debe ser un objeto.');
    return;
  }
  const normalized = {};
  for (const [from, targets] of Object.entries(transitions)) {
    if (!stages.includes(from)) {
      errors.push(`La transición parte de la etapa desconocida "${from}".`);
      continue;
    }
    if (!Array.isArray(targets)) {
      errors.push(`Las transiciones de "${from}" deben ser una lista.`);
      continue;
    }
    const invalidTarget = targets.find((target) => !stages.includes(target));
    if (invalidTarget) {
      errors.push(`La transición "${from}" apunta a la etapa desconocida "${invalidTarget}".`);
      continue;
    }
    normalized[from] = [...targets];
  }
  if (Object.keys(normalized).length) {
    config.opportunityLifecycle = { stages: [...stages], transitions: normalized };
  }
}

export function loadModuleConfig(source) {
  const resolvedSource =
    source !== undefined
      ? source
      : typeof window !== 'undefined'
        ? window.__CRM_CONFIG__
        : undefined;

  const config = createDefaultConfig();
  const errors = [];

  if (resolvedSource === undefined || resolvedSource === null) {
    return { config, errors };
  }
  if (typeof resolvedSource !== 'object' || Array.isArray(resolvedSource)) {
    return { config, errors: ['La configuración del módulo debe ser un objeto.'] };
  }

  if (resolvedSource.moduleName !== undefined) {
    if (
      typeof resolvedSource.moduleName === 'string' &&
      resolvedSource.moduleName.trim().length > 0
    ) {
      config.moduleName = resolvedSource.moduleName.trim();
    } else {
      errors.push('moduleName debe ser un texto no vacío.');
    }
  }

  if (resolvedSource.labels !== undefined) {
    if (resolvedSource.labels && typeof resolvedSource.labels === 'object') {
      for (const [key, value] of Object.entries(resolvedSource.labels)) {
        if (typeof value === 'string') config.labels[key] = value;
        else errors.push(`La etiqueta "${key}" debe ser un texto.`);
      }
    } else {
      errors.push('labels debe ser un objeto.');
    }
  }

  if (resolvedSource.customFields !== undefined) {
    validateCustomFields(resolvedSource.customFields, config, errors);
  }

  if (resolvedSource.opportunityLifecycle !== undefined) {
    validateLifecycle(resolvedSource.opportunityLifecycle, config, errors);
  }

  if (resolvedSource.theme !== undefined) {
    if (resolvedSource.theme && typeof resolvedSource.theme === 'object') {
      const accent = resolvedSource.theme.accentColor;
      if (accent !== undefined) {
        if (typeof accent === 'string' && COLOR_PATTERN.test(accent.trim())) {
          config.theme.accentColor = accent.trim();
        } else {
          errors.push('theme.accentColor debe ser un color CSS válido.');
        }
      }
    } else {
      errors.push('theme debe ser un objeto.');
    }
  }

  return { config, errors };
}
