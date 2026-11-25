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

export const VALID_OPPORTUNITY_STAGES = [...OPPORTUNITY_STAGES];

export const MVP_BASE_CURRENCY = 'CLP';

export function normalizeCurrency(value) {
  const raw = String(value ?? '').trim().toUpperCase();
  if (!raw) return MVP_BASE_CURRENCY;
  if (raw === 'CLP' || raw === '$' || raw.includes('CLP') || raw.includes('PESO')) return MVP_BASE_CURRENCY;
  return MVP_BASE_CURRENCY;
}

export function formatMoney(amount, currency = MVP_BASE_CURRENCY) {
  const value = Number(amount);
  const safe = Number.isFinite(value) ? value : 0;
  const cur = normalizeCurrency(currency);
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: cur, maximumFractionDigits: 0 }).format(safe);
}

export function getInvalidOpportunityStageCount(opportunities = []) {
  const valid = new Set(VALID_OPPORTUNITY_STAGES);
  return (Array.isArray(opportunities) ? opportunities : []).reduce((count, opportunity) => {
    const stage = opportunity?.stage ?? opportunity?.etapa;
    const normalized = String(stage ?? '').trim();
    if (!normalized) return count + 1;
    return valid.has(normalized) ? count : count + 1;
  }, 0);
}

export function isTerminalOpportunityStage(stage) {
  return TERMINAL_STAGES.includes(String(stage ?? '').trim());
}

export function computeConversionRate(wonOrOpportunities, closedCount) {
  if (Array.isArray(wonOrOpportunities)) {
    const opportunities = wonOrOpportunities;
    const won = opportunities.filter((o) => String(o?.stage ?? o?.etapa ?? '').trim() === 'Ganado').length;
    const closed = opportunities.filter((o) => ['Ganado', 'Perdido'].includes(String(o?.stage ?? o?.etapa ?? '').trim())).length;
    if (closed <= 0) return 0;
    return Math.round((won / closed) * 100);
  }
  const won = Number(wonOrOpportunities) || 0;
  const closed = Number(closedCount) || 0;
  if (closed <= 0) return 0;
  return Math.round((won / closed) * 100);
}

export function normalizeOpportunityLifecycle(lifecycle) {
  const fallbackStatuses = [...VALID_OPPORTUNITY_STAGES];
  const fallbackTransitions = {
    'Prospección': ['Calificación'],
    'Calificación': ['Evaluación'],
    'Evaluación': ['Propuesta'],
    'Propuesta': ['Negociación'],
    'Negociación': ['Cierre'],
    'Cierre': ['Ganado', 'Perdido'],
    'Ganado': [],
    'Perdido': []
  };
  const fallback = { statuses: fallbackStatuses, transitions: fallbackTransitions, usedFallback: true };
  if (!lifecycle || typeof lifecycle !== 'object') return fallback;
  const statusesRaw = Array.isArray(lifecycle.statuses) ? lifecycle.statuses : [];
  const statuses = [...new Set(statusesRaw.map((s) => String(s ?? '').trim()).filter(Boolean))];
  if (statuses.length === 0) return fallback;
  const transitionsSrc = lifecycle.transitions && typeof lifecycle.transitions === 'object' ? lifecycle.transitions : {};
  const transitions = {};
  let invalid = false;
  for (const status of statuses) {
    const next = transitionsSrc[status];
    if (next == null) { transitions[status] = []; continue; }
    if (!Array.isArray(next)) { invalid = true; transitions[status] = []; continue; }
    transitions[status] = [...new Set(next.map((n) => String(n ?? '').trim()).filter(Boolean))];
    for (const n of transitions[status]) {
      if (!statuses.includes(n)) invalid = true;
    }
  }
  for (const key of Object.keys(transitionsSrc)) {
    if (!statuses.includes(key)) invalid = true;
  }
  return { statuses, transitions, usedFallback: invalid };
}

export function evaluateOpportunityTransition({ from, to, lifecycle }) {
  const lc = normalizeOpportunityLifecycle(lifecycle);
  const fromStage = String(from ?? '').trim();
  const toStage = String(to ?? '').trim();
  if (!toStage) return { allowed: false, reason: 'La etapa de destino es obligatoria.', lifecycle: lc };
  if (!lc.statuses.includes(toStage)) return { allowed: false, reason: `La etapa "${toStage}" no pertenece al ciclo de vida configurado.`, lifecycle: lc };
  if (!fromStage) return { allowed: true, reason: '', lifecycle: lc };
  if (fromStage === toStage) return { allowed: true, reason: '', lifecycle: lc };
  if (!lc.statuses.includes(fromStage)) {
    return { allowed: false, reason: `La etapa actual "${fromStage}" no pertenece al ciclo de vida configurado.`, lifecycle: lc };
  }
  const allowedTargets = Array.isArray(lc.transitions[fromStage]) ? lc.transitions[fromStage] : [];
  if (allowedTargets.includes(toStage)) return { allowed: true, reason: '', lifecycle: lc };
  return {
    allowed: false,
    reason: `Transición no permitida: no se puede pasar de "${fromStage}" a "${toStage}" según el ciclo de vida configurado.`,
    lifecycle: lc
  };
}

export function getUpcomingClosureWindow({ now = new Date(), days = 30 } = {}) {
  const base = now instanceof Date ? now : new Date(now);
  const start = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate()));
  const end = new Date(start.getTime() + days * 24 * 60 * 60 * 1000);
  return { startMs: start.getTime(), endMs: end.getTime() };
}


// ---- Backward-compatible exports for 001-crm-module tests ----
export function isValidDate(value) {
  const str = String(value ?? '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) return false;
  const [y, m, d] = str.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

export function isTerminalStage(stage) {
  return isTerminalOpportunityStage(stage);
}

export function canTransition(from, to, lifecycle) {
  if (lifecycle) return evaluateOpportunityTransition({ from, to, lifecycle }).allowed;
  const order = ['Evaluación', 'Propuesta', 'Negociación', 'Ganado'];
  const f = String(from ?? '').trim();
  const t = String(to ?? '').trim();
  if (TERMINAL_STAGES.includes(f)) return false;
  if (t === 'Perdido') return ['Evaluación', 'Propuesta', 'Negociación'].includes(f);
  if (t === 'Ganado') return f === 'Negociación';
  const fi = order.indexOf(f);
  const ti = order.indexOf(t);
  return fi !== -1 && ti !== -1 && ti === fi + 1;
}

export function matchesClientSearch(client, term) {
  const needle = String(term ?? '').trim().toLowerCase();
  if (!needle) return true;
  const hay = [
    client?.nombreEmpresa, client?.companyName, client?.name,
    client?.personaContacto, client?.contactName, client?.contact,
    client?.correo, client?.email,
    client?.estado, client?.status
  ].filter(Boolean).join(' ').toLowerCase();
  return hay.includes(needle);
}

export function filterOpportunities(opportunities, filters = {}) {
  const list = Array.isArray(opportunities) ? opportunities : [];
  const stage = String(filters.etapa ?? filters.stage ?? '').trim();
  const employeeId = String(filters.empleadoId ?? filters.employeeId ?? '').trim();
  const from = String(filters.fechaDesde ?? filters.from ?? '').trim();
  const to = String(filters.fechaHasta ?? filters.to ?? '').trim();
  return list.filter((o) => {
    if (stage && String(o?.etapa ?? o?.stage ?? '').trim() !== stage) return false;
    if (employeeId && String(o?.empleadoId ?? o?.employeeId ?? '').trim() !== employeeId) return false;
    const date = String(o?.fechaEstimadaCierre ?? o?.closeDate ?? '').trim();
    if (from && date < from) return false;
    if (to && date > to) return false;
    return true;
  });
}

export function computeDashboardMetrics({ clients = [], opportunities = [] } = {}, today = new Date()) {
  const base = today instanceof Date ? today : new Date(today);
  const nowMs = base.getTime();
  const limitMs = nowMs + 30 * 24 * 60 * 60 * 1000;
  const activeClients = clients.filter((c) => !c.archived && String(c?.estado ?? c?.status ?? '').trim() === 'Activo').length;
  const open = opportunities.filter((o) => {
    const stage = String(o?.etapa ?? o?.stage ?? '').trim();
    return stage && !['Ganado', 'Perdido'].includes(stage);
  });
  const pipelineTotal = open.reduce((sum, o) => sum + (Number(o?.montoEstimado ?? o?.amount) || 0), 0);
  const upcomingCloses = open.filter((o) => {
    const d = String(o?.fechaEstimadaCierre ?? o?.closeDate ?? '').trim();
    if (!isValidDate(d)) return false;
    const ms = new Date(`${d}T00:00:00Z`).getTime();
    return ms >= nowMs && ms <= limitMs;
  }).length;
  const invalidOpportunityStageCount = getInvalidOpportunityStageCount(opportunities.map((o) => ({ ...o, stage: o.stage ?? o.etapa })));
  return {
    activeClients,
    activeCustomers: activeClients,
    openOpportunities: open.length,
    pipelineTotal,
    totalPipeline: pipelineTotal,
    upcomingCloses,
    upcomingClosures: upcomingCloses,
    invalidOpportunityStageCount
  };
}

// ---- Calendario CRM (US32-US35) ----
export const TASK_STATUSES = ['pending', 'in_progress', 'completed'];
export const ACTIVITY_TYPES = ['meeting', 'event', 'call', 'follow_up', 'commercial_activity'];
export const ACTIVITY_STATUSES = ['scheduled', 'completed', 'cancelled'];
export const CALENDAR_VIEWS = ['year', 'month', 'week'];
export const CRM_RELATION_TYPES = ['customer', 'contact', 'opportunity'];
export const DUE_SOON_HOURS = 24;

const ACTIVITY_TYPE_LABELS = {
  meeting: 'Reunión',
  event: 'Evento',
  call: 'Llamada',
  follow_up: 'Seguimiento',
  commercial_activity: 'Actividad comercial'
};

const ACTIVITY_STATUS_LABELS = {
  scheduled: 'Programada',
  completed: 'Completada',
  cancelled: 'Cancelada'
};

function toCalendarDate(value) {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  const text = String(value ?? '').trim();
  if (!text) return null;
  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function isValidDateTime(value) {
  return toCalendarDate(value) !== null;
}

function dateOnly(value) {
  const date = toCalendarDate(value);
  if (!date) return null;
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
}

export function classifyTaskDue(task = {}, now = new Date()) {
  const status = String(task?.status ?? 'pending').trim() || 'pending';
  if (status === 'completed') return 'completed';
  const dueDate = toCalendarDate(task?.dueAt);
  if (!dueDate) return 'noDue';
  const current = toCalendarDate(now) ?? new Date();
  const diff = dueDate.getTime() - current.getTime();
  if (diff < 0) return 'overdue';
  if (diff <= DUE_SOON_HOURS * 60 * 60 * 1000) return 'dueSoon';
  return 'pendingFuture';
}

export function sortTasksByDue(tasks = []) {
  return (Array.isArray(tasks) ? tasks : [])
    .filter((task) => task && String(task.status ?? 'pending').trim() !== 'completed')
    .slice()
    .sort((a, b) => {
      const aDate = toCalendarDate(a?.dueAt);
      const bDate = toCalendarDate(b?.dueAt);
      if (aDate && bDate) return aDate.getTime() - bDate.getTime();
      if (aDate) return -1;
      if (bDate) return 1;
      return String(a?.createdAt ?? '').localeCompare(String(b?.createdAt ?? ''));
    });
}

export function getCalendarViewRange({ view = 'month', referenceDate, now = new Date() } = {}) {
  const safeView = CALENDAR_VIEWS.includes(view) ? view : 'month';
  const base = toCalendarDate(referenceDate) ?? toCalendarDate(now) ?? new Date();
  const year = base.getUTCFullYear();
  const month = base.getUTCMonth();
  let start;
  let end;
  if (safeView === 'year') {
    start = new Date(Date.UTC(year, 0, 1));
    end = new Date(Date.UTC(year + 1, 0, 1) - 1);
  } else if (safeView === 'month') {
    start = new Date(Date.UTC(year, month, 1));
    end = new Date(Date.UTC(year, month + 1, 1) - 1);
  } else {
    const day = base.getUTCDay();
    const offset = day === 0 ? -6 : 1 - day;
    start = new Date(Date.UTC(year, month, base.getUTCDate() + offset));
    end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000 - 1);
  }
  return { view: safeView, start: start.toISOString(), end: end.toISOString(), startMs: start.getTime(), endMs: end.getTime() };
}

export function navigateCalendarPeriod({ view = 'month', referenceDate, direction = 1, now = new Date() } = {}) {
  const safeView = CALENDAR_VIEWS.includes(view) ? view : 'month';
  const base = toCalendarDate(referenceDate) ?? toCalendarDate(now) ?? new Date();
  const step = Number(direction) >= 0 ? 1 : -1;
  if (safeView === 'year') base.setUTCFullYear(base.getUTCFullYear() + step);
  else if (safeView === 'month') base.setUTCMonth(base.getUTCMonth() + step);
  else base.setUTCDate(base.getUTCDate() + step * 7);
  return base.toISOString();
}

export function activityIntersectsRange(activity = {}, range = {}) {
  const start = toCalendarDate(activity?.startAt);
  if (!start) return false;
  const end = toCalendarDate(activity?.endAt) ?? start;
  const rangeStart = toCalendarDate(range?.start ?? range?.from);
  const rangeEnd = toCalendarDate(range?.end ?? range?.to);
  if (!rangeStart || !rangeEnd) return false;
  return start.getTime() <= rangeEnd.getTime() && end.getTime() >= rangeStart.getTime();
}

export function filterCalendarActivities(activities = [], filters = {}) {
  const list = Array.isArray(activities) ? activities : [];
  const range = filters.view || filters.referenceDate
    ? getCalendarViewRange({ view: filters.view, referenceDate: filters.referenceDate, now: filters.now })
    : { start: filters.start ?? filters.from, end: filters.end ?? filters.to };
  const userId = String(filters.userId ?? filters.ownerUserId ?? '').trim();
  const team = filters.team === true;
  return list.filter((activity) => {
    if (!activityIntersectsRange(activity, range)) return false;
    if (team || !userId) return true;
    const owner = String(activity?.ownerUserId ?? '').trim();
    if (owner === userId) return true;
    return (Array.isArray(activity?.participantUserIds) ? activity.participantUserIds : [])
      .some((id) => String(id).trim() === userId);
  }).slice().sort((a, b) => String(a?.startAt ?? '').localeCompare(String(b?.startAt ?? '')));
}

export function normalizeCalendarRelations(value) {
  if (!Array.isArray(value)) return [];
  return value.filter((relation) => relation && typeof relation === 'object')
    .map((relation) => ({
      type: CRM_RELATION_TYPES.includes(String(relation.type ?? '').trim()) ? String(relation.type).trim() : '',
      id: String(relation.id ?? '').trim(),
      customerId: String(relation.customerId ?? '').trim(),
      label: String(relation.label ?? '').trim(),
      available: relation.available !== false
    }))
    .filter((relation) => relation.type && relation.id);
}

export function validateTask(data = {}) {
  const errors = {};
  const title = String(data?.title ?? '').trim();
  const status = String(data?.status ?? 'pending').trim() || 'pending';
  if (!title) errors.title = 'El título de la tarea es obligatorio.';
  if (!String(data?.ownerUserId ?? '').trim()) errors.ownerUserId = 'La tarea debe tener un responsable.';
  if (!TASK_STATUSES.includes(status)) errors.status = `El estado debe ser uno de: ${TASK_STATUSES.join(', ')}.`;
  if (data?.dueAt && !isValidDateTime(data.dueAt)) errors.dueAt = 'La fecha de vencimiento no es válida.';
  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateCalendarActivity(data = {}) {
  const errors = {};
  const title = String(data?.title ?? '').trim();
  const type = String(data?.type ?? '').trim();
  const status = String(data?.status ?? 'scheduled').trim() || 'scheduled';
  const start = toCalendarDate(data?.startAt);
  const end = toCalendarDate(data?.endAt);
  if (!title) errors.title = 'El título de la actividad es obligatorio.';
  if (!ACTIVITY_TYPES.includes(type)) errors.type = `El tipo debe ser uno de: ${ACTIVITY_TYPES.join(', ')}.`;
  if (!start) errors.startAt = 'La fecha de inicio es obligatoria.';
  if (!end) errors.endAt = 'La fecha de fin es obligatoria.';
  if (start && end && end.getTime() < start.getTime()) errors.endAt = 'La fecha de fin no puede ser anterior a la de inicio.';
  if (!ACTIVITY_STATUSES.includes(status)) errors.status = `El estado debe ser uno de: ${ACTIVITY_STATUSES.join(', ')}.`;
  if (!String(data?.ownerUserId ?? '').trim()) errors.ownerUserId = 'La actividad debe tener un responsable.';
  return { valid: Object.keys(errors).length === 0, errors };
}

export function getInteractionTypeForActivity(type) {
  if (type === 'call') return 'Llamada';
  if (type === 'meeting') return 'Reunión';
  return null;
}

export function formatActivityDetail(activity = {}, context = {}) {
  const customers = Array.isArray(context.customers) ? context.customers : [];
  const opportunities = Array.isArray(context.opportunities) ? context.opportunities : [];
  const employees = Array.isArray(context.employees) ? context.employees : [];
  const relations = normalizeCalendarRelations(activity?.relatedRecords).map((relation) => {
    let label = relation.label;
    let available = relation.available;
    if (relation.type === 'customer') {
      const customer = customers.find((item) => item.id === relation.id || item.customerId === relation.id);
      label = label || customer?.companyName || customer?.name || relation.id;
      available = Boolean(customer) && !customer.archived;
    } else if (relation.type === 'opportunity') {
      const opportunity = opportunities.find((item) => item.id === relation.id);
      label = label || opportunity?.title || opportunity?.description || relation.id;
      available = Boolean(opportunity) && !opportunity.archived;
    } else if (relation.type === 'contact') {
      const customerId = relation.customerId || String(relation.id).split(':')[1] || '';
      const customer = customers.find((item) => item.id === customerId);
      label = label || (customer ? `Contacto: ${customer.contactName || customer.contact || ''} (${customer.companyName || customer.name || ''})` : relation.id);
      available = Boolean(customer) && !customer.archived;
    }
    return { ...relation, label, available };
  });
  const owner = employees.find((employee) => employee.id === activity?.ownerUserId);
  return {
    id: String(activity?.id ?? ''),
    type: String(activity?.type ?? ''),
    typeLabel: ACTIVITY_TYPE_LABELS[activity?.type] || String(activity?.type ?? ''),
    title: String(activity?.title ?? ''),
    description: String(activity?.description ?? ''),
    startAt: String(activity?.startAt ?? ''),
    endAt: String(activity?.endAt ?? ''),
    dateLabel: dateOnly(activity?.startAt) || '',
    status: String(activity?.status ?? ''),
    statusLabel: ACTIVITY_STATUS_LABELS[activity?.status] || String(activity?.status ?? ''),
    ownerLabel: owner?.name || String(activity?.ownerUserId ?? ''),
    relations,
    hasRelations: relations.length > 0,
    emptyRelationsMessage: relations.length === 0 ? 'Esta actividad no tiene relaciones comerciales asociadas.' : ''
  };
}
