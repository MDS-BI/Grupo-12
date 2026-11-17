export const CLIENT_STATES = ['Posible', 'Activo', 'Inactivo'];

export const DEFAULT_CLIENT_STATE = 'Posible';

export const OPPORTUNITY_STAGES = [
  'Prospección',
  'Calificación',
  'Evaluación',
  'Propuesta',
  'Negociación',
  'Cierre',
  'Ganado',
  'Perdido'
];

export const DEFAULT_STAGE = 'Evaluación';

export const INTERACTION_TYPES = ['Llamada', 'Correo', 'Reunión'];

export const TERMINAL_STAGES = ['Ganado', 'Perdido'];

export function computeConversionRate(opportunities = []) {
  const records = Array.isArray(opportunities) ? opportunities : [];
  const stageOf = (record) => record?.stage ?? record?.etapa;
  const won = records.filter((record) => stageOf(record) === 'Ganado').length;
  const lost = records.filter((record) => stageOf(record) === 'Perdido').length;
  const closed = won + lost;
  return closed === 0 ? 0 : Math.round((won / closed) * 100);
}

export const DEFAULT_STAGE_TRANSITIONS = {
  Prospección: ['Calificación', 'Perdido'],
  Calificación: ['Evaluación', 'Perdido'],
  Evaluación: ['Propuesta', 'Perdido'],
  Propuesta: ['Negociación', 'Perdido'],
  Negociación: ['Cierre', 'Ganado', 'Perdido'],
  Cierre: ['Ganado', 'Perdido'],
  Ganado: [],
  Perdido: []
};

export const BASE_FIELD_KEYS = [
  'id',
  'nombreEmpresa',
  'personaContacto',
  'correo',
  'telefono',
  'estado',
  'archived',
  'nombre',
  'cargo',
  'clienteId',
  'empleadoId',
  'descripcion',
  'montoEstimado',
  'etapa',
  'fechaEstimadaCierre',
  'fecha',
  'tipo',
  'createdAt',
  'updatedAt'
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(value) {
  return String(value ?? '').trim().toLowerCase();
}

export function isValidEmail(value) {
  return EMAIL_PATTERN.test(String(value ?? '').trim());
}

export function isValidDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value ?? '').trim());
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  );
}

export function isTerminalStage(stage) {
  return TERMINAL_STAGES.includes(stage);
}

export function allowedTransitions(stage, transitions = DEFAULT_STAGE_TRANSITIONS) {
  return Array.isArray(transitions[stage]) ? transitions[stage] : [];
}

export function canTransition(from, to, transitions = DEFAULT_STAGE_TRANSITIONS) {
  return allowedTransitions(from, transitions).includes(to);
}

export function toDateOnly(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDays(date, days) {
  const copy = new Date(date.getTime());
  copy.setDate(copy.getDate() + days);
  return copy;
}

export function computeDashboardMetrics({ clients = [], opportunities = [] }, today = new Date()) {
  const activeClients = clients.filter((client) => !client.archived && client.estado === 'Activo').length;
  const openOpportunities = opportunities.filter((opportunity) => !isTerminalStage(opportunity.etapa));
  const pipelineTotal = openOpportunities.reduce(
    (total, opportunity) => total + Number(opportunity.montoEstimado || 0),
    0
  );
  const todayValue = toDateOnly(today);
  const limitValue = toDateOnly(addDays(today, 30));
  const upcomingCloses = openOpportunities.filter(
    (opportunity) =>
      opportunity.fechaEstimadaCierre >= todayValue && opportunity.fechaEstimadaCierre <= limitValue
  ).length;

  return {
    activeClients,
    openOpportunities: openOpportunities.length,
    pipelineTotal,
    upcomingCloses
  };
}

export function matchesClientSearch(client, query, customFields = []) {
  const term = String(query ?? '').trim().toLowerCase();
  if (!term) return true;
  const values = [
    client.nombreEmpresa,
    client.personaContacto,
    client.correo,
    client.estado,
    ...customFields.map((field) => client[field.key])
  ];
  return values.some((value) => String(value ?? '').toLowerCase().includes(term));
}

export function filterOpportunities(opportunities, filters = {}) {
  return opportunities.filter((opportunity) => {
    if (filters.etapa && opportunity.etapa !== filters.etapa) return false;
    if (filters.empleadoId && opportunity.empleadoId !== filters.empleadoId) return false;
    if (filters.fechaDesde && opportunity.fechaEstimadaCierre < filters.fechaDesde) return false;
    if (filters.fechaHasta && opportunity.fechaEstimadaCierre > filters.fechaHasta) return false;
    return true;
  });
}

export function sortByDateDesc(records, field = 'fecha') {
  return [...records].sort((a, b) => String(b[field] ?? '').localeCompare(String(a[field] ?? '')));
}
