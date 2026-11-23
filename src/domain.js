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
