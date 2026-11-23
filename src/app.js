import { labelFor, normalizeConfig, setActiveConfig, getConfig, getVisibleCustomFields, PHONE_PREFIXES } from './module-config.js';
import { computeConversionRate, MVP_BASE_CURRENCY, formatMoney, normalizeCurrency, evaluateOpportunityTransition, normalizeOpportunityLifecycle } from './domain.js';
import {
  addCustomer, archiveCustomer, addDocument, addEmployee, addEntity, addInteraction,
  archiveEmployee, deleteDocument, deleteEntity, deleteInteraction,
  getCRMOverview, getCRMStorageErrors, getCustomer360, getReferentialIntegrityReport, getUpcomingClosures,
  loadCustomers, loadDocuments, loadEmployees, loadEntities, loadInteractions,
  resetCorruptedCRMStorage, restoreCustomer, restoreEmployee,
  searchCRM, updateCustomer, updateDocument, updateEmployee, updateEntity, updateInteraction,
  validateDocument, validateEmployee, validateEntity, validateInteraction
} from './storage.js';

export const AUTH_STORAGE_KEY = 'erp.authenticatedUser';
export const SIDEBAR_STORAGE_KEY = 'erp.sidebarCollapsed';
export const ACTIVE_VIEW_STORAGE_KEY = 'erp.activeView';

const GAPS002_UI_KEYS = {
  employeesView: 'crm.gaps002.ui.employeesView',
  clients360: 'crm.gaps002.ui.clients360',
  archivedFilterEntities: 'crm.gaps002.ui.archivedFilter.entities',
  archivedFilterEmployees: 'crm.gaps002.ui.archivedFilter.employees'
};

function readUIState(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? { ...fallback, ...parsed } : fallback;
  } catch {
    return fallback;
  }
}

function writeUIState(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
}

function getEmployeesViewState() {
  return readUIState(GAPS002_UI_KEYS.employeesView, { filter: '', showArchived: false });
}

function setEmployeesViewState(patch) {
  const next = { ...getEmployeesViewState(), ...patch };
  writeUIState(GAPS002_UI_KEYS.employeesView, next);
  return next;
}

function getClients360ViewState() {
  return readUIState(GAPS002_UI_KEYS.clients360, { openClientId: null, returnFilter: '', selectedEntityId: '' });
}

function setClients360ViewState(patch) {
  const next = { ...getClients360ViewState(), ...patch };
  writeUIState(GAPS002_UI_KEYS.clients360, next);
  return next;
}

const VIEW_KEYS = ['dashboard', 'entities', 'documents', 'employees', 'interactions', 'search', 'client-360'];
function isValidView(name) {
  return VIEW_KEYS.includes(name);
}
function persistActiveView(name) {
  if (!isValidView(name)) return;
  try { localStorage.setItem(ACTIVE_VIEW_STORAGE_KEY, name); } catch { /* ignore */ }
}
function readPersistedView() {
  try {
    const v = localStorage.getItem(ACTIVE_VIEW_STORAGE_KEY);
    return isValidView(v) ? v : 'dashboard';
  } catch { return 'dashboard'; }
}
const CRM_FORM_SELECTOR = 'form.crm-form';

let pendingNavigation = null;
const formBaselines = new WeakMap();

function qs(id) {
  return document.getElementById(id);
}
function sanitizeText(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}
function escapeHTML(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// FR-070: cualquier formulario CRM del DOM real se considera con cambios
// cuando sus valores editables difieren de la última línea base registrada.
function editableFormFields(form) {
  return [...form.querySelectorAll('input, select, textarea')]
    .filter((field) => !['hidden', 'submit', 'button', 'reset'].includes(field.type))
    .filter((field) => !field.disabled && !field.readOnly);
}

function formBaselineMap(form) {
  const map = new Map();
  for (const field of editableFormFields(form)) {
    map.set(field.name || field.id, field.value ?? '');
  }
  return map;
}

function markFormClean(form) {
  if (form) formBaselines.set(form, formBaselineMap(form));
}

function markAllFormsClean() {
  document.querySelectorAll(CRM_FORM_SELECTOR).forEach(markFormClean);
}

function hasUnsavedChanges() {
  return [...document.querySelectorAll(CRM_FORM_SELECTOR)].some((form) => {
    const baseline = formBaselines.get(form);
    if (!baseline) return false;
    for (const field of editableFormFields(form)) {
      const key = field.name || field.id;
      if ((field.value ?? '') !== (baseline.get(key) ?? '')) return true;
    }
    return false;
  });
}

let lastDialogFocus = null;

function dialogFocusables(dialog) {
  return [...dialog.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')]
    .filter((el) => !el.disabled && !el.hidden && el.getAttribute('aria-hidden') !== 'true');
}

function openAccessibleDialog(dialog, opener) {
  if (!dialog) return false;
  lastDialogFocus = opener || document.activeElement;
  dialog.hidden = false;
  const [first] = dialogFocusables(dialog);
  (first || dialog).focus?.();
  return true;
}

function closeAccessibleDialog(dialog, { restoreFocus = true } = {}) {
  if (!dialog) return;
  dialog.hidden = true;
  if (restoreFocus && lastDialogFocus?.focus) {
    try { lastDialogFocus.focus(); } catch { /* ignore */ }
  }
  lastDialogFocus = null;
}

function bindDialogAccessibility(dialog) {
  if (!dialog || dialog.dataset.a11yBound) return;
  dialog.addEventListener('keydown', (event) => {
    if (dialog.hidden) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      if (dialog.id === 'unsaved-dialog') {
        pendingNavigation = null;
        closeAccessibleDialog(dialog);
      } else {
        closeAccessibleDialog(dialog);
      }
      return;
    }
    if (event.key !== 'Tab') return;
    const focusables = dialogFocusables(dialog);
    if (!focusables.length) { event.preventDefault(); return; }
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault(); first.focus();
    }
  });
  dialog.dataset.a11yBound = 'true';
}

function showUnsavedDialog(opener) {
  const dialog = qs('unsaved-dialog');
  bindDialogAccessibility(dialog);
  return openAccessibleDialog(dialog, opener);
}

function hideUnsavedDialog({ restoreFocus = false } = {}) {
  const dialog = qs('unsaved-dialog');
  closeAccessibleDialog(dialog, { restoreFocus });
}

let pendingDeleteAction = null;

function openDeleteConfirmDialog({ title, message, confirmLabel = 'Eliminar', opener, onConfirm }) {
  const dialog = qs('delete-confirm-dialog');
  if (!dialog) {
    console.error('delete-confirm-dialog markup is required for accessible deletion confirmation.');
    return;
  }
  const titleNode = qs('delete-confirm-title');
  const messageNode = qs('delete-confirm-message');
  const accept = qs('delete-confirm-accept');
  if (titleNode) titleNode.textContent = title || 'Confirmar eliminación';
  if (messageNode) messageNode.textContent = message || '¿Deseas eliminar este registro?';
  if (accept) accept.textContent = confirmLabel;
  pendingDeleteAction = onConfirm || null;
  bindDialogAccessibility(dialog);
  const cancel = qs('delete-confirm-cancel');
  const acceptBtn = qs('delete-confirm-accept');
  if (cancel && !cancel.dataset.bound) {
    cancel.addEventListener('click', () => {
      pendingDeleteAction = null;
      closeAccessibleDialog(dialog, { restoreFocus: true });
    });
    cancel.dataset.bound = 'true';
  }
  if (acceptBtn && !acceptBtn.dataset.bound) {
    acceptBtn.addEventListener('click', () => {
      const action = pendingDeleteAction;
      pendingDeleteAction = null;
      closeAccessibleDialog(dialog, { restoreFocus: true });
      action?.();
    });
    acceptBtn.dataset.bound = 'true';
  }
  openAccessibleDialog(dialog, opener);
}

function runNavigation(name, onNavigate) {
  showView(name);
  if (typeof onNavigate === 'function') onNavigate();
  markAllFormsClean();
}

function navigateTo(name, onNavigate) {
  if (!hasUnsavedChanges()) {
    runNavigation(name, onNavigate);
    return true;
  }
  const opener = document.activeElement;
  if (!showUnsavedDialog(opener)) {
    runNavigation(name, onNavigate);
    return true;
  }
  pendingNavigation = { name, onNavigate, opener };
  return false;
}

function discardUnsavedChanges() {
  document.querySelectorAll(CRM_FORM_SELECTOR).forEach((form) => form.reset());
  resetEntityForm();
  resetDocumentForm();
  clearValidationStates();
  markAllFormsClean();
}

function bindUnsavedDialog() {
  const dialog = qs('unsaved-dialog');
  bindDialogAccessibility(dialog);
  const stay = qs('unsaved-stay');
  if (stay && !stay.dataset.bound) {
    stay.addEventListener('click', () => {
      pendingNavigation = null;
      hideUnsavedDialog({ restoreFocus: true });
    });
    stay.dataset.bound = 'true';
  }

  const discard = qs('unsaved-discard');
  if (discard && !discard.dataset.bound) {
    discard.addEventListener('click', () => {
      const next = pendingNavigation;
      pendingNavigation = null;
      hideUnsavedDialog({ restoreFocus: false });
      if (!next) return;
      discardUnsavedChanges();
      runNavigation(next.name, next.onNavigate);
    });
    discard.dataset.bound = 'true';
  }
}

let lastStorageRecoveryError = null;

function storageErrorCategory(errors = []) {
  const hasCRM = errors.some((e) => e.category === 'crm' || String(e.key || '').startsWith('crm_module:'));
  const hasCompat = errors.some((e) => e.category === 'compatibility' || e.key === 'erp_base_module:entities' || e.key === 'erp_base_module:documents');
  if (hasCRM && hasCompat) return 'datos CRM y de compatibilidad';
  if (hasCompat) return 'datos de compatibilidad';
  return 'datos CRM';
}

function setOperationalBlocked(blocked) {
  const main = document.querySelector('main.content-area');
  if (main) {
    main.querySelectorAll('section.view, .quick-actions, .stats-grid, .welcome-banner').forEach((el) => {
      if (el.id === 'storage-error') return;
      el.style.display = blocked ? 'none' : '';
    });
  }
  document.querySelectorAll('.nav-module, #logout-button, #theme-select, #menu-toggle, #action-new-entity, #action-open-entities, #action-new-document, #action-find').forEach((el) => {
    if (blocked) {
      el.setAttribute('disabled', 'true');
      el.setAttribute('aria-disabled', 'true');
    } else {
      el.removeAttribute('disabled');
      el.removeAttribute('aria-disabled');
    }
  });
}

function getModuleConfigResult() {
  return globalThis.__crmModuleConfigResult || { config: getConfig(), errors: [], usedFallback: false };
}

function renderConfigBanner() {
  const banner = qs('config-error-banner');
  if (!banner) return;
  const result = getModuleConfigResult();
  const errors = Array.isArray(result?.errors) ? result.errors : [];
  const hasErrors = errors.length > 0 || Boolean(result?.usedFallback);
  banner.hidden = !hasErrors;
  const detail = qs('config-error-detail');
  if (detail) detail.textContent = hasErrors ? (errors.join(' ') || 'Se usó configuración por defecto segura.') : '';
}

function renderStorageErrors() {
  const panel = qs('storage-error');
  if (!panel) return;
  const errors = getCRMStorageErrors();
  const hasErrors = errors.length > 0 || !!lastStorageRecoveryError;
  panel.hidden = !hasErrors;
  const message = qs('storage-error-message');
  const detail = qs('storage-error-detail');
  const resetButton = qs('storage-reset');
  const retryButton = qs('storage-retry');
  if (!hasErrors) {
    if (detail) { detail.hidden = true; detail.textContent = ''; }
    if (retryButton) retryButton.hidden = true;
    if (resetButton) resetButton.hidden = false;
    setOperationalBlocked(false);
    return;
  }
  const category = storageErrorCategory(errors);
  if (message) {
    message.textContent = `Se detectó un problema en ${category} (${errors.map((error) => error.key).join(', ')}). La aplicación está bloqueada hasta que reinicies los datos afectados.`;
  }
  if (detail) {
    detail.hidden = !lastStorageRecoveryError;
    detail.textContent = lastStorageRecoveryError ? `No se pudo completar el reinicio: ${lastStorageRecoveryError}. Puedes reintentar.` : '';
  }
  if (retryButton) retryButton.hidden = !lastStorageRecoveryError;
  if (resetButton) resetButton.hidden = false;
  setOperationalBlocked(true);
}

function initializeOperationalState() {
  attachStatusOptions();
  updateEntitySelect();
  updateDocumentSelect();
  populateEntityDropdown();
  updateEntityFieldOptions();
  updateDocumentFieldOptions();
  updateDashboardStats();
  renderEntityList();
  renderDocumentList();
  renderSearchResults();
  markAllFormsClean();
}

async function attemptStorageRecovery() {
  const errors = getCRMStorageErrors();
  if (!errors.length) { lastStorageRecoveryError = null; renderStorageErrors(); return; }
  try {
    resetCorruptedCRMStorage(errors);
    const remaining = getCRMStorageErrors();
    if (remaining.length > 0) {
      const failed = remaining.map((e) => e.key).join(', ');
      lastStorageRecoveryError = `quedaron claves afectadas: ${failed}`;
      renderStorageErrors();
      return;
    }
    lastStorageRecoveryError = null;
    renderStorageErrors();
    initializeOperationalState();
  } catch (error) {
    lastStorageRecoveryError = error?.message || 'error desconocido';
    renderStorageErrors();
  }
}

function bindConfigBanner() {
  const btn = qs('config-error-dismiss');
  if (btn && !btn.dataset.bound) {
    btn.addEventListener('click', () => { const b = qs('config-error-banner'); if (b) b.hidden = true; });
    btn.dataset.bound = 'true';
  }
}

function bindStorageReset() {
  const button = qs('storage-reset');
  const retry = qs('storage-retry');
  if (button && !button.dataset.bound) {
    button.addEventListener('click', () => { void attemptStorageRecovery(); });
    button.dataset.bound = 'true';
  }
  if (retry && !retry.dataset.bound) {
    retry.addEventListener('click', () => { void attemptStorageRecovery(); });
    retry.dataset.bound = 'true';
  }
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

function errorNodeIdForField(fieldId) {
  if (fieldId.startsWith('error-')) return fieldId;
  if (fieldId === 'entity_id' || fieldId === 'document-entity') return 'error-document-entity';
  return `error-${fieldId}`;
}

function fieldIdFromErrorNode(errorId) {
  if (errorId === 'error-document-entity') return 'document-entity';
  return errorId.replace(/^error-/, '');
}

function setErrorText(fieldId, message = '') {
  const errorId = errorNodeIdForField(fieldId);
  const node = qs(errorId);
  if (node) node.textContent = message;
  const inputId = fieldIdFromErrorNode(errorId);
  const input = qs(inputId);
  if (input) {
    if (message) {
      input.setAttribute('aria-invalid', 'true');
      const described = new Set((input.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean));
      described.add(errorId);
      input.setAttribute('aria-describedby', [...described].join(' '));
    } else {
      input.removeAttribute('aria-invalid');
      const described = (input.getAttribute('aria-describedby') || '').split(/\s+/).filter((id) => id && id !== errorId);
      if (described.length) input.setAttribute('aria-describedby', described.join(' '));
      else input.removeAttribute('aria-describedby');
    }
  }
}

function clearValidationStates(formOrScope) {
  const scopes = formOrScope ? [formOrScope] : ['entity', 'document'];
  for (const scope of scopes) {
    if (scope === 'entity' || scope === 'document') clearFormErrors(scope);
  }
}

function focusFirstInvalid(form) {
  if (!form) return null;
  const invalid = form.querySelector('[aria-invalid="true"], .validation-error:not(:empty)');
  if (!invalid) return null;
  if (invalid.getAttribute && invalid.getAttribute('aria-invalid') === 'true') {
    invalid.focus?.();
    return invalid;
  }
  const id = invalid.id;
  const field = id ? qs(fieldIdFromErrorNode(id)) : null;
  field?.focus?.();
  return field;
}

function clearFormErrors(scope) {
  const ids = [];
  if (scope === 'entity') {
    ids.push(
      'error-name', 'error-code', 'error-taxId', 'error-email', 'error-phone', 'error-address', 'error-category',
      'error-targetDate', 'error-creditLimit', 'error-entity-currency', 'error-paymentTerms', 'error-cf-name'
    );
  }
  if (scope === 'document') {
    ids.push(
      'error-document-entity', 'error-series', 'error-folio', 'error-startDate', 'error-endDate', 'error-quantity',
      'error-subtotal', 'error-discount', 'error-taxAmount', 'error-totalAmount', 'error-currency', 'error-docPaymentTerms', 'error-status'
    );
  }
  if (scope === 'employee') {
    ids.push('error-employee-name', 'error-employee-role');
  }
  if (scope === 'interaction') {
    ids.push('error-interaction-client-id', 'error-interaction-employee-id', 'error-interaction-date', 'error-interaction-type', 'error-interaction-notes');
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
  const safe = isValidView(name) ? name : 'dashboard';
  if (safe === 'entities') { updateEntitySelect(); }
  if (safe === 'documents') {
    populateEntityDropdown();
    updateDocumentSelect();
  }
  if (safe === 'dashboard') updateDashboardStats();
  if (safe === 'employees') renderEmployeeList();
  if (safe === 'interactions') { populateInteractionSelectors(); renderInteractionList(); }
  if (safe === 'client-360') { renderClient360(getClients360ViewState().openClientId); }
  if (safe === 'search') renderSearchResults();

  for (const key of VIEW_KEYS) {
    const view = qs(`view-${key}`);
    if (view) view.hidden = key !== safe;
  }

  document.querySelectorAll('.nav-module').forEach((button) => {
    button.setAttribute('aria-current', button.id === `nav-${safe}` ? 'page' : 'false');
  });
  persistActiveView(safe);
}

function formatCurrency(value) {
  return formatMoney(value, MVP_BASE_CURRENCY);
}

function renderWelcomeBanner() {
  const node = qs('welcome-title');
  if (!node) return;
  const user = localStorage.getItem(AUTH_STORAGE_KEY)
    || sessionStorage.getItem(AUTH_STORAGE_KEY)
    || 'Cliente1';
  node.textContent = `Bienvenido, ${user}`;
}

function renderUpcomingClosures() {
  const list = qs('upcoming-closures-list');
  const empty = qs('upcoming-closures-empty');
  if (!list) return;
  const items = getUpcomingClosures({ windowDays: 30 });
  list.replaceChildren();
  if (empty) empty.hidden = items.length > 0;
  const customersById = new Map(loadCustomers().map((c) => [String(c.id), c]));
  const entitiesById = new Map(loadEntities().map((e) => [String(e.id), e]));
  for (const item of items) {
    const tr = document.createElement('tr');
    const customer = customersById.get(String(item.customerId || item.clientId || ''));
    const entity = entitiesById.get(String(item.customerId || item.clientId || ''));
    const clientName = customer?.companyName || customer?.name || entity?.name || item.customerId || '-';
    const folio = [item.series, item.folio].filter(Boolean).join('-') || item.id || '-';
    tr.innerHTML = `<td>${escapeHTML(clientName)}</td><td>${escapeHTML(folio)}</td><td>${escapeHTML(item.closeDate || '-')}</td><td>${escapeHTML(item.stage || '-')}</td><td>${escapeHTML(formatMoney(item.amount, item.currency || MVP_BASE_CURRENCY))}</td><td><button type="button" class="row-action" data-action="open-upcoming-opportunity" data-document-id="${escapeHTML(item.id)}">Abrir</button></td>`;
    tr.querySelector('[data-action="open-upcoming-opportunity"]').addEventListener('click', () => {
      showView('documents');
      updateDocumentSelect();
      renderDocumentList();
      const doc = loadDocuments().find((d) => String(d.id) === String(item.id));
      if (doc) fillDocumentForm(doc);
    });
    list.appendChild(tr);
  }
}

function renderIntegrityReport() {
  const report = qs('integrity-report');
  const list = qs('integrity-report-list');
  const empty = qs('integrity-report-empty');
  if (!report || !list) return;
  const reportData = getReferentialIntegrityReport();
  const findings = Array.isArray(reportData) ? reportData : (Array.isArray(reportData?.items) ? reportData.items : []);
  list.replaceChildren();
  const has = findings.length > 0;
  report.hidden = false;
  if (empty) empty.hidden = has;
  for (const f of findings) {
    const tr = document.createElement('tr');
    const ref = f.missingRef || f.refType || '-';
    const missing = f.missingId || f.missingRefId || f.missingRef || '';
    tr.innerHTML = `<td>${escapeHTML(f.type || '-')}</td><td>${escapeHTML(f.recordId || f.id || '-')}</td><td>${escapeHTML(ref)}${missing && missing !== ref ? ': ' + escapeHTML(missing) : ''}</td><td>${escapeHTML(f.message || '')}</td>`;
    list.appendChild(tr);
  }
}

function updateDashboardStats() {
  const overview = getCRMOverview();
  const values = {
    'stat-clients': String(overview.activeCustomers),
    'stat-opportunities': String(overview.openOpportunities),
    'stat-revenue': formatCurrency(overview.totalPipeline),
    'stat-conversion': `${computeConversionRate(overview.opportunities)} %`
  };

  for (const [id, value] of Object.entries(values)) {
    const node = qs(id);
    if (node) node.textContent = value;
  }

  const warning = qs('dashboard-data-warning');
  if (warning) {
    const count = Number(overview.invalidOpportunityStageCount) || 0;
    warning.hidden = count <= 0;
    warning.textContent = count > 0
      ? `Se detectaron ${count} oportunidad(es) con etapa ausente, nula o inválida. Fueron excluidas de la tasa de conversión.`
      : '';
  }
  renderUpcomingClosures();
  renderIntegrityReport();
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
    ['nav-employees', 'employees'],
    ['nav-interactions', 'interactions'],
    ['nav-search', 'search']
  ];

  for (const [buttonId, key] of nav) {
    const labelNode = qs(`${buttonId}-label`);
    if (labelNode) labelNode.textContent = labelFor(key, config);
  }

  const entityLabel = labelFor('entities', config);
  const documentLabel = labelFor('documents', config);
  const entitySingular = labelFor('entity', config);
  const documentSingular = labelFor('document', config);
  const entityArticle = nounArticle(entitySingular, { newItem: false });
  const documentArticle = nounArticle(documentSingular, { newItem: false });
  const entityNewArticle = nounArticle(entitySingular, { newItem: true });
  const documentNewArticle = nounArticle(documentSingular, { newItem: true });

  if (qs('entities-view-heading')) qs('entities-view-heading').textContent = entityLabel;
  if (qs('documents-view-heading')) qs('documents-view-heading').textContent = documentLabel;
  if (qs('search-view-heading')) qs('search-view-heading').textContent = `Buscar ${entityLabel}`;
  if (qs('stat-clients-label')) qs('stat-clients-label').textContent = 'Clientes activos';
  if (qs('stat-opportunities-label')) qs('stat-opportunities-label').textContent = 'Oportunidades activas';
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

function getEntityArchivedState(entity, customersById = null) {
  const id = String(entity?.id || entity?.entity_id || '');
  if (!id) return false;
  const customers = loadCustomers();
  const map = customersById || new Map(customers.map((c) => [String(c.id), c]));
  const customer = map.get(id) || map.get(String(entity?.entity_id || '')) || customers.find((c) => String(c.entityId || '') === id);
  return Boolean(customer?.archived || entity?.archived);
}

function renderEntityList() {
  const tbody = qs('entity-list');
  const empty = qs('entity-list-empty');
  if (!tbody) return;
  const showArchived = Boolean(qs('entity-show-archived')?.checked);
  const filter = sanitizeText(qs('entity-list-filter')?.value || '').toLowerCase();
  const customers = loadCustomers();
  const custById = new Map();
  const custByEntityId = new Map();
  for (const c of customers) { custById.set(String(c.id), c); if (c.entityId) custByEntityId.set(String(c.entityId), c); }
  const allEntities = loadEntities();
  const rows = [];
  let baseCount = 0;
  for (const entity of allEntities) {
    const id = String(entity?.id || entity?.entity_id || '');
    const archived = Boolean(custById.get(id)?.archived || custByEntityId.get(id)?.archived || entity?.archived);
    if (showArchived || !archived) baseCount += 1;
    if (!showArchived && archived) continue;
    if (filter && ![entity.name, entity.code, entity.email, entity.phone, entity.taxId].some((v) => String(v || '').toLowerCase().includes(filter))) continue;
    rows.push({ entity, archived });
  }
  tbody.replaceChildren();
  if (empty) {
    empty.hidden = rows.length > 0;
    empty.textContent = baseCount === 0 ? 'No hay clientes registrados.' : 'No hay clientes que coincidan con el filtro.';
  }
  const selectedId = getSelectedEntityId();
  const frag = document.createDocumentFragment();
  for (const { entity, archived } of rows) {
    const tr = document.createElement('tr');
    tr.dataset.entityId = entity.id;
    if (archived) tr.classList.add('is-archived');
    if (selectedId && selectedId === entity.id) {
      tr.classList.add('selected');
      tr.setAttribute('data-selected', 'true');
    }
    const archiveAction = archived
      ? `<button type="button" class="row-action" data-action="restore-entity" data-entity-id="${escapeHTML(entity.id)}">Restaurar</button>`
      : `<button type="button" class="row-action danger" data-action="archive-entity" data-entity-id="${escapeHTML(entity.id)}">Archivar</button>`;
    tr.innerHTML = `<td>${escapeHTML(entity.name || '')}${archived ? ' <span class="badge-archived">Archivado</span>' : ''}</td><td>${escapeHTML(entity.code || '')}</td><td>${escapeHTML(entity.email || '')}</td><td>${escapeHTML(entity.phone || '')}</td>`
      + `<td class="row-actions"><button type="button" class="row-action" data-action="view-client-360" data-entity-id="${escapeHTML(entity.id)}">Ver ficha</button>`
      + `<button type="button" class="row-action" data-action="edit" data-entity-id="${escapeHTML(entity.id)}">Editar</button>`
      + archiveAction
      + `</td>`;
    tr.addEventListener('click', (ev) => {
      if (ev.target.closest('button')) return;
      selectEntityRow(entity.id);
    });
    tr.querySelector('[data-action="view-client-360"]').addEventListener('click', () => openClient360(entity.id));
    tr.querySelector('[data-action="edit"]').addEventListener('click', () => {
      selectEntityRow(entity.id);
      fillEntityForm(entity);
      const select = qs('edit-entity');
      if (select) select.value = entity.id;
      qs('entity-form')?.scrollIntoView?.({ block: 'nearest' });
    });
    const archiveBtn = tr.querySelector('[data-action="archive-entity"]');
    if (archiveBtn) archiveBtn.addEventListener('click', (e) => {
      openDeleteConfirmDialog({
        title: 'Confirmar archivado',
        message: '\u00bfDeseas archivar el cliente seleccionado? Podr\u00e1s restaurarlo desde la vista de archivados.',
        confirmLabel: 'Archivar',
        opener: e.currentTarget,
        onConfirm: () => {
          const customer = custById.get(String(entity.id)) || custByEntityId.get(String(entity.id)) || loadCustomers().find((c) => String(c.entityId || '') === String(entity.id));
          const custId = customer?.id || entity.id;
          archiveCustomer(custId);
          try {
            const raw = JSON.parse(localStorage.getItem('erp_base_module:entities') || '[]');
            localStorage.setItem('erp_base_module:entities', JSON.stringify(raw.map((e) => String(e?.id) === String(entity.id) ? { ...e, archived: true } : e)));
          } catch { /* ignore */ }
          if (qs('entity-id')?.value === entity.id) resetEntityForm();
          updateEntitySelect(); updateDashboardStats(); renderSearchResults(); populateInteractionSelectors();
        }
      });
    });
    const restoreBtn = tr.querySelector('[data-action="restore-entity"]');
    if (restoreBtn) restoreBtn.addEventListener('click', () => {
      const customer = custById.get(String(entity.id)) || custByEntityId.get(String(entity.id)) || loadCustomers().find((c) => String(c.entityId || '') === String(entity.id));
      const custId = customer?.id || entity.id;
      restoreCustomer(custId);
      try {
        const raw = JSON.parse(localStorage.getItem('erp_base_module:entities') || '[]');
        localStorage.setItem('erp_base_module:entities', JSON.stringify(raw.map((e) => String(e?.id) === String(entity.id) ? { ...e, archived: false } : e)));
      } catch { /* ignore */ }
      updateEntitySelect(); updateDashboardStats(); renderSearchResults(); populateInteractionSelectors();
    });
    frag.appendChild(tr);
  }
  tbody.appendChild(frag);
}

function renderDocumentList() {
  const tbody = qs('document-list');
  const empty = qs('document-list-empty');
  if (!tbody) return;
  const filter = sanitizeText(qs('document-list-filter')?.value || '').toLowerCase();
  const docs = loadDocuments().filter((doc) => !filter || [doc.entityName, doc.series, doc.folio, doc.status, doc.totalAmount, doc.currency, [doc.series, doc.folio].filter(Boolean).join('-')]
    .some((v) => String(v ?? '').toLowerCase().includes(filter)));
  tbody.replaceChildren();
  if (empty) {
    empty.hidden = docs.length > 0;
    empty.textContent = loadDocuments().length === 0 ? 'No hay oportunidades registradas.' : 'No hay oportunidades que coincidan con el filtro.';
  }
  for (const doc of docs) {
    const tr = document.createElement('tr');
    tr.dataset.documentId = doc.id;
    const folio = [doc.series, doc.folio].filter(Boolean).join('-');
    const amountLabel = formatMoney(doc.totalAmount, doc.currency || MVP_BASE_CURRENCY);
    tr.innerHTML = `<td>${escapeHTML(doc.entityName || '')}</td><td>${escapeHTML(folio)}</td><td>${escapeHTML(doc.status || '')}</td><td>${escapeHTML(amountLabel)}</td>`
      + `<td class="row-actions"><button type="button" class="row-action" data-action="edit" data-document-id="${escapeHTML(doc.id)}">Editar</button>`
      + `<button type="button" class="row-action danger" data-action="delete" data-document-id="${escapeHTML(doc.id)}">Eliminar</button></td>`;
    tr.querySelector('[data-action="edit"]').addEventListener('click', () => {
      fillDocumentForm(doc);
      const select = qs('edit-document');
      if (select) select.value = doc.id;
      qs('document-form')?.scrollIntoView?.({ block: 'nearest' });
    });
    tr.querySelector('[data-action="delete"]').addEventListener('click', (e) => {
      openDeleteConfirmDialog({
        title: 'Confirmar eliminación',
        message: '¿Deseas eliminar la oportunidad seleccionada? Esta acción no se puede deshacer.',
        confirmLabel: 'Eliminar',
        opener: e.currentTarget,
        onConfirm: () => {
          deleteDocument(doc.id);
          if (qs('document-id')?.value === doc.id) resetDocumentForm();
          updateDocumentSelect();
          updateDashboardStats();
          renderSearchResults();
        }
      });
    });
    tbody.appendChild(tr);
  }
}

function updateEntitySelect() {
  const select = qs('edit-entity');
  if (select) {
    const entities = loadEntities().filter((entity) => !getEntityArchivedState(entity));
    const selected = select.value;
    select.replaceChildren(new Option('Seleccionar...', ''));
    for (const entity of entities) {
      const option = document.createElement('option');
      option.value = entity.id;
      option.textContent = `${entity.name || 'Sin nombre'} - ${entity.code || entity.entity_id || 'Sin código'}`;
      select.appendChild(option);
    }
    select.value = selected;
  }
  renderEntityList();
}

function updateDocumentSelect() {
  const select = qs('edit-document');
  if (select) {
    const documents = loadDocuments();
    const selected = select.value;
    select.replaceChildren(new Option('Seleccionar...', ''));
    for (const record of documents) {
      const entity = loadEntities().find((item) => item.entity_id === record.entity_id || item.id === record.entity_id);
      const label = [record.series || 'SIN-SERIE', record.folio || '0'].join(' - ');
      const option = document.createElement('option');
      option.value = record.id;
      option.textContent = `${label}${entity ? ` · ${entity.name}` : ''}`;
      select.appendChild(option);
    }
    select.value = selected;
  }
  renderDocumentList();
}

function updateEntityFieldOptions() {
  const config = getActiveConfig();
  const container = qs('entity-custom-fields');
  if (!container) return;
  const fields = getVisibleCustomFields('entity', config);
  container.replaceChildren();
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
  const fields = getVisibleCustomFields('document', config);
  container.replaceChildren();
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
  const entities = loadEntities().filter((entity) => !getEntityArchivedState(entity));
  select.replaceChildren(new Option('Seleccionar...', ''));
  for (const entity of entities) {
    const option = document.createElement('option');
    const eid = entity.id || entity.entity_id || '';
    option.value = eid;
    option.textContent = `${entity.name || 'Sin nombre'} - ${entity.code || 'Sin código'}`;
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
  markFormClean(form);
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
  markFormClean(form);
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
  qs('entity-currency').value = normalizeCurrency(entity.currency || MVP_BASE_CURRENCY);
  qs('paymentTerms').value = entity.paymentTerms || '';

  const config = getActiveConfig();
  for (const field of getVisibleCustomFields('entity', config)) {
    const input = qs(`cf-${field.key}`);
    if (input) input.value = entity[field.key] ?? '';
  }

  qs('submit-button').textContent = 'Actualizar';
  markFormClean(qs('entity-form'));
}

function fillDocumentForm(record) {
  if (!record) return;
  populateEntityDropdown();
  qs('document-id').value = record.id;
  const select = qs('document-entity');
  if (select) {
    const wanted = String(record.entity_id || record.entityId || record.id_entity || '');
    select.value = wanted;
    if (select.value !== wanted) {
      const match = [...select.options].find((o) => o.value === wanted || o.dataset.entityId === wanted);
      if (match) select.value = match.value;
    }
  }
  qs('series').value = record.series || '';
  qs('folio').value = record.folio ?? '';
  qs('startDate').value = record.startDate || '';
  qs('endDate').value = record.endDate || '';
  qs('quantity').value = record.quantity ?? '';
  qs('subtotal').value = record.subtotal ?? '';
  qs('discount').value = record.discount ?? '';
  qs('taxAmount').value = record.taxAmount ?? '';
  qs('totalAmount').value = record.totalAmount ?? '';
  qs('currency').value = normalizeCurrency(record.currency || MVP_BASE_CURRENCY);
  qs('docPaymentTerms').value = record.paymentTerms || '';
  qs('notes').value = record.notes || '';
  const statusField = qs('status');
  if (statusField) {
    attachStatusOptions(record.status || '');
    const refreshed = qs('status');
    if (refreshed) refreshed.value = record.status || '';
  }

  const config = getActiveConfig();
  for (const field of getVisibleCustomFields('document', config)) {
    const input = qs(`cf-${field.key}`);
    if (input) input.value = record[field.key] ?? '';
  }

  const documentSubmitButton = qs('document-submit-button') || qs('submit-document-button');
  if (documentSubmitButton) documentSubmitButton.textContent = 'Actualizar Documento';
  markFormClean(qs('document-form'));
}

function renderSearchResults() {
  const input = qs('search-input');
  const resultsList = qs('search-results-list');
  const emptyState = qs('search-empty');
  if (!input || !resultsList || !emptyState) return;

  const term = input.value.trim();
  resultsList.replaceChildren();
  if (!term) {
    emptyState.hidden = true;
    emptyState.textContent = 'No hay coincidencias para su búsqueda.';
    return;
  }

  const matches = searchCRM(term);
  if (!matches.length) {
    emptyState.hidden = false;
    emptyState.textContent = 'No hay coincidencias para su búsqueda.';
    return;
  }

  emptyState.hidden = true;
  for (const result of matches) {
    const item = document.createElement('li');
    item.className = 'search-result-item';
    item.dataset.searchType = result.type;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'search-result-button';
    btn.dataset.searchId = result.id;
    btn.dataset.searchType = result.type;
    btn.innerHTML = `<span class="search-result-type">${escapeHTML(result.typeLabel)}</span>`
      + `<span class="search-result-body"><strong class="search-result-label">${escapeHTML(result.label)}</strong>`
      + `<span class="search-result-detail">${escapeHTML(result.detail || '')}</span></span>`;
    btn.addEventListener('click', () => navigateToSearchResult(result));
    item.appendChild(btn);
    resultsList.appendChild(item);
  }
}

function navigateToSearchResult(result) {
  if (!result) return;
  const go = () => {
    if (result.type === 'client') {
      const entity = loadEntities().find((e) => e.id === result.id || e.entity_id === result.id);
      if (entity) fillEntityForm(entity);
      const select = qs('edit-entity');
      if (select) select.value = entity?.id || result.id;
    } else if (result.type === 'opportunity') {
      const doc = loadDocuments().find((d) => d.id === result.id);
      if (doc) fillDocumentForm(doc);
      const select = qs('edit-document');
      if (select) select.value = doc?.id || result.id;
    }
  };
  const view = result.type === 'client' ? 'entities' : result.type === 'opportunity' ? 'documents' : null;
  if (!view) return;
  navigateTo(view, go);
}

function getActiveOpportunityLifecycle() {
  const config = getActiveConfig();
  return normalizeOpportunityLifecycle(config?.statusLifecycle);
}

function setLifecycleFeedback(message = '', { invalid = false } = {}) {
  const feedback = qs('lifecycle-feedback');
  if (feedback) feedback.textContent = message;
  setErrorText('error-status', message || '');
  const statusField = qs('status');
  if (statusField) {
    if (invalid) statusField.setAttribute('aria-invalid', 'true');
    else if (!message) statusField.removeAttribute('aria-invalid');
  }
}

function attachStatusOptions(currentStatus = '') {
  const statusField = qs('status');
  if (!statusField) return;

  const lifecycle = getActiveOpportunityLifecycle();
  const allStatuses = lifecycle.statuses;

  if (statusField.tagName !== 'SELECT') {
    const replacement = document.createElement('select');
    replacement.id = 'status';
    replacement.name = 'status';
    replacement.className = statusField.className;
    statusField.replaceWith(replacement);
  }

  const select = qs('status');
  if (!select) return;

  const normalizedCurrent = String(currentStatus || '').trim();
  const transitions = lifecycle.transitions || {};
  const allowedNext = normalizedCurrent ? (Array.isArray(transitions[normalizedCurrent]) ? transitions[normalizedCurrent] : []) : allStatuses;
  const ordered = normalizedCurrent
    ? [normalizedCurrent, ...allowedNext.filter((s) => s !== normalizedCurrent), ...allStatuses.filter((s) => s !== normalizedCurrent && !allowedNext.includes(s))]
    : [...allStatuses];

  select.replaceChildren();
  if (!normalizedCurrent) {
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = '-- Sin estado --';
    select.appendChild(placeholder);
  }
  const seen = new Set();
  for (const status of ordered) {
    if (!status || seen.has(status)) continue;
    seen.add(status);
    const option = document.createElement('option');
    option.value = status;
    option.textContent = status;
    if (normalizedCurrent && status !== normalizedCurrent && !allowedNext.includes(status)) {
      option.disabled = true;
    }
    select.appendChild(option);
  }
  if (normalizedCurrent) select.value = normalizedCurrent;
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
    currency: normalizeCurrency(form.querySelector('#entity-currency')?.value || MVP_BASE_CURRENCY),
    paymentTerms: form.querySelector('#paymentTerms')?.value || ''
  };

  for (const field of getVisibleCustomFields('entity')) {
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
    currency: normalizeCurrency(form.querySelector('#currency')?.value || MVP_BASE_CURRENCY),
    paymentTerms: form.querySelector('#docPaymentTerms')?.value || '',
    notes: form.querySelector('#notes')?.value || '',
    status: form.querySelector('#status')?.value || ''
  };

  for (const field of getVisibleCustomFields('document')) {
    const node = form.querySelector(`#cf-${field.key}`);
    if (node) payload[field.key] = node.value;
  }
  return payload;
}

const ERROR_FIELD_ALIASES = {
  companyName: 'name',
  contactName: 'category',
  clientId: 'document-entity',
  employeeId: 'series',
  amount: 'subtotal',
  closeDate: 'endDate',
  stage: 'status'
};

function exposeValidationErrors(scope, errors = {}, form) {
  clearValidationStates(scope);
  const local = Object.entries(errors || {});
  for (const [key, message] of local) {
    const field = ERROR_FIELD_ALIASES[key] || key;
    const inputId = field === 'entity_id' ? 'document-entity' : field;
    setErrorText(inputId, message);
  }

  for (const field of getActiveConfig().customFields || []) {
    const value = errors[field.key];
    if (value) setErrorText(`cf-${field.key}`, value);
  }
  focusFirstInvalid(form);
}

function syncCustomerMirror(entity) {
  if (!entity) return null;
  const safeId = String(entity.id || 'cliente').replace(/[^a-zA-Z0-9_-]/g, '');
  const payload = {
    name: entity.name || 'Sin nombre',
    contactName: entity.category || entity.name || 'Contacto',
    email: entity.email || `cliente-${safeId}@crm.local`,
    phone: entity.phone || '900000000',
    status: 'Activo',
    archived: false,
    entityId: entity.id,
    customerId: entity.id,
    code: entity.code || '',
    taxId: entity.taxId || '',
    address: entity.address || '',
    category: entity.category || '',
    currency: normalizeCurrency(entity.currency || MVP_BASE_CURRENCY),
    creditLimit: entity.creditLimit || 0,
    paymentTerms: entity.paymentTerms || ''
  };

  const existing = loadCustomers().find((customer) =>
    customer.entityId === entity.id || customer.customerId === entity.id || customer.id === entity.id
  );

  try {
    return existing ? updateCustomer(existing.id, payload) : addCustomer(payload);
  } catch {
    return null;
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
    exposeValidationErrors('entity', validation.errors, form);
    return;
  }

  clearValidationStates('entity');
  const savedEntity = id ? updateEntity(id, payload) : addEntity(payload);
  syncCustomerMirror(savedEntity);

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
  setLifecycleFeedback('', { invalid: false });
  const validation = validateDocument(toValidate);

  const fromStage = sanitizeText(currentDocument?.status || '');
  const toStage = sanitizeText(values.status || '');
  const lifecycle = getActiveOpportunityLifecycle();
  const transition = (fromStage && toStage && fromStage !== toStage)
    ? evaluateOpportunityTransition({ from: fromStage, to: toStage, lifecycle })
    : { allowed: true, reason: '' };
  if (!transition.allowed) {
    validation.valid = false;
    validation.errors = { ...(validation.errors || {}), status: transition.reason };
  }

  if (!validation.valid) {
    exposeValidationErrors('document', validation.errors, form);
    if (validation.errors.status) setLifecycleFeedback(validation.errors.status, { invalid: true });
    return;
  }

  clearValidationStates('document');
  setLifecycleFeedback('', { invalid: false });
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

function isCompactViewport() {
  return typeof window.matchMedia === 'function' && window.matchMedia('(max-width: 900px)').matches;
}

function applySidebarState(collapsed, { persist = false, moveFocus = false } = {}) {
  const appShell = qs('app-shell');
  const menuToggle = qs('menu-toggle');
  if (!appShell || !menuToggle) return;

  appShell.classList.toggle('sidebar-collapsed', collapsed);
  menuToggle.setAttribute('aria-expanded', String(!collapsed));
  menuToggle.setAttribute('aria-label', collapsed ? 'Expandir menú lateral' : 'Contraer menú lateral');

  if (persist) {
    sessionStorage.setItem(SIDEBAR_STORAGE_KEY, String(collapsed));
  }

  if (moveFocus && isCompactViewport()) {
    if (collapsed) qs('nav-dashboard')?.focus();
    else menuToggle.focus();
  }
}

function bindSidebarControls() {
  const menuToggle = qs('menu-toggle');
  const appShell = qs('app-shell');
  const backdrop = qs('sidebar-backdrop');
  if (!menuToggle || !appShell || menuToggle.dataset.bound) return;

  const saved = sessionStorage.getItem(SIDEBAR_STORAGE_KEY);
  applySidebarState(saved === 'true');

  menuToggle.addEventListener('click', () => {
    applySidebarState(!appShell.classList.contains('sidebar-collapsed'), { persist: true, moveFocus: true });
  });

  document.addEventListener('keydown', (event) => {
    if (qs('app-shell') !== appShell) return;
    if (event.key === 'Escape' && isCompactViewport() && appShell.classList.contains('sidebar-collapsed')) {
      applySidebarState(false, { persist: true, moveFocus: true });
    }
  });

  const closeFromOutside = (event) => {
    if (qs('app-shell') !== appShell) return;
    if (!isCompactViewport() || !appShell.classList.contains('sidebar-collapsed')) return;
    const sidebar = qs('sidebar');
    if (sidebar?.contains(event.target) || menuToggle.contains(event.target)) return;
    applySidebarState(false, { persist: true, moveFocus: true });
  };

  document.addEventListener('click', closeFromOutside);
  backdrop?.addEventListener('click', closeFromOutside);
  menuToggle.dataset.bound = 'true';
}


function clearEmployeeErrors() {
  setErrorText('error-employee-name', '');
  setErrorText('error-employee-role', '');
  ['employee-name','employee-role'].forEach((id) => qs(id)?.removeAttribute('aria-invalid'));
}

function resetEmployeeForm() {
  const form = qs('employee-form');
  if (form) form.reset();
  const id = qs('employee-id');
  if (id) id.value = '';
  clearEmployeeErrors();
  markFormClean(form);
}

function fillEmployeeForm(record) {
  if (!record) return;
  if (qs('employee-id')) qs('employee-id').value = record.id || '';
  if (qs('employee-name')) qs('employee-name').value = record.name || '';
  if (qs('employee-role')) qs('employee-role').value = record.role || record.cargo || '';
  clearEmployeeErrors();
  markFormClean(qs('employee-form'));
}

function renderEmployeeList() {
  const list = qs('employee-list');
  const empty = qs('employee-list-empty');
  if (!list) return;
  const state = getEmployeesViewState();
  const filterInput = qs('employee-list-filter');
  const showArchivedToggle = qs('employee-show-archived');
  if (filterInput && filterInput.value !== state.filter) filterInput.value = state.filter || '';
  if (showArchivedToggle) showArchivedToggle.checked = Boolean(state.showArchived);
  const term = sanitizeText(state.filter).toLowerCase();
  const employees = loadEmployees({ includeArchived: Boolean(state.showArchived) })
    .filter((employee) => !term || [employee.name, employee.role].some((v) => String(v || '').toLowerCase().includes(term)));

  list.replaceChildren();
  if (empty) {
    empty.hidden = employees.length > 0;
    empty.textContent = loadEmployees({ includeArchived: true }).length === 0
      ? 'No hay empleados registrados.'
      : 'No hay empleados que coincidan con el filtro.';
  }

  const seenEmp = new Set();
  for (const employee of employees) {
    if (seenEmp.has(employee.id)) continue;
    seenEmp.add(employee.id);
    const tr = document.createElement('tr');
    tr.dataset.employeeId = employee.id;
    if (employee.archived) tr.dataset.archived = 'true';
    const status = employee.archived ? '<span class="badge-archived" data-archived="true">Archivado</span>' : 'Activo';
    const actions = employee.archived
      ? `<button type="button" class="link-action" data-action="restore-employee" data-employee-id="${escapeHTML(employee.id)}">Restaurar</button>`
      : `<button type="button" class="link-action" data-action="edit-employee" data-employee-id="${escapeHTML(employee.id)}">Editar</button>
         <button type="button" class="link-action danger" data-action="archive-employee" data-employee-id="${escapeHTML(employee.id)}">Archivar</button>`;
    tr.innerHTML = `
      <td>${escapeHTML(employee.name || '')}</td>
      <td>${escapeHTML(employee.role || '')}</td>
      <td>${status}</td>
      <td class="row-actions">${actions}</td>`;
    tr.querySelectorAll('[data-action="edit-employee"]').forEach((btn) => {
      btn.addEventListener('click', () => fillEmployeeForm(employee));
    });
    tr.querySelectorAll('[data-action="archive-employee"]').forEach((btn) => {
      btn.addEventListener('click', () => {
        archiveEmployee(employee.id);
        if (qs('employee-id')?.value === employee.id) resetEmployeeForm();
        renderEmployeeList();
        populateInteractionSelectors();
      });
    });
    tr.querySelectorAll('[data-action="restore-employee"]').forEach((btn) => {
      btn.addEventListener('click', () => {
        restoreEmployee(employee.id);
        renderEmployeeList();
        populateInteractionSelectors();
      });
    });
    list.appendChild(tr);
  }
}

function handleEmployeeSubmit(event) {
  event.preventDefault();
  clearEmployeeErrors();
  const id = sanitizeText(qs('employee-id')?.value);
  const name = sanitizeText(qs('employee-name')?.value);
  const role = sanitizeText(qs('employee-role')?.value);
  const payload = { name, role };
  const validation = validateEmployee(payload);
  if (!validation.valid) {
    if (validation.errors.name) { setErrorText('error-employee-name', validation.errors.name); qs('employee-name')?.setAttribute('aria-invalid', 'true'); }
    if (validation.errors.role) { setErrorText('error-employee-role', validation.errors.role); qs('employee-role')?.setAttribute('aria-invalid', 'true'); }
    qs('[aria-invalid="true"]')?.focus();
    return;
  }
  if (id) updateEmployee(id, payload);
  else addEmployee(payload);
  resetEmployeeForm();
  renderEmployeeList();
  populateInteractionSelectors();
}

function populateInteractionSelectors() {
  const clientSelect = qs('interaction-client-id');
  const employeeSelect = qs('interaction-employee-id');
  const typeSelect = qs('interaction-type');
  if (clientSelect) {
    const selected = clientSelect.value;
    clientSelect.replaceChildren(new Option('Seleccionar cliente...', ''));
    loadCustomers().filter((c) => !c.archived).forEach((customer) => {
      const opt = new Option(customer.companyName || customer.name || customer.id, customer.id);
      clientSelect.appendChild(opt);
    });
    clientSelect.value = selected;
  }
  if (employeeSelect) {
    const selected = employeeSelect.value;
    employeeSelect.replaceChildren(new Option('Seleccionar responsable...', ''));
    loadEmployees({ includeArchived: false }).forEach((employee) => {
      const opt = new Option(employee.name || employee.id, employee.id);
      employeeSelect.appendChild(opt);
    });
    employeeSelect.value = selected;
  }
  if (typeSelect) {
    const selected = typeSelect.value;
    typeSelect.replaceChildren(new Option('Seleccionar tipo...', ''));
    (['Llamada', 'Correo', 'Reunión']).forEach((type) => {
      typeSelect.appendChild(new Option(type, type));
    });
    typeSelect.value = selected;
  }
}

function clearInteractionErrors() {
  ['error-interaction-client-id','error-interaction-employee-id','error-interaction-date','error-interaction-type','error-interaction-notes'].forEach((id) => setErrorText(id, ''));
  ['interaction-client-id','interaction-employee-id','interaction-date','interaction-type','interaction-notes'].forEach((id) => qs(id)?.removeAttribute('aria-invalid'));
}

function resetInteractionForm() {
  const form = qs('interaction-form');
  if (form) form.reset();
  if (qs('interaction-id')) qs('interaction-id').value = '';
  clearInteractionErrors();
  populateInteractionSelectors();
  markFormClean(form);
}

function fillInteractionForm(record) {
  if (!record) return;
  populateInteractionSelectors();
  if (qs('interaction-id')) qs('interaction-id').value = record.id || '';
  if (qs('interaction-client-id')) qs('interaction-client-id').value = record.clientId || record.customerId || '';
  if (qs('interaction-employee-id')) qs('interaction-employee-id').value = record.employeeId || '';
  if (qs('interaction-date')) qs('interaction-date').value = record.date || '';
  if (qs('interaction-type')) qs('interaction-type').value = record.type || '';
  if (qs('interaction-notes')) qs('interaction-notes').value = record.description || record.notes || '';
  clearInteractionErrors();
  markFormClean(qs('interaction-form'));
}

function renderInteractionList() {
  const list = qs('interaction-list');
  const empty = qs('interaction-list-empty');
  if (!list) return;
  list.replaceChildren();
  const filter = sanitizeText(qs('interaction-list-filter')?.value).toLowerCase();
  const customers = new Map(loadCustomers().map((c) => [c.id, c]));
  const employees = new Map(loadEmployees({ includeArchived: true }).map((e) => [e.id, e]));
  const interactions = loadInteractions({ includeArchived: false }).filter((interaction) => {
    const customer = customers.get(interaction.clientId || interaction.customerId);
    const employee = employees.get(interaction.employeeId);
    const haystack = [interaction.date, interaction.type, interaction.description, interaction.notes, customer?.companyName, customer?.name, employee?.name].join(' ').toLowerCase();
    return !filter || haystack.includes(filter);
  }).sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));

  if (empty) {
    empty.hidden = interactions.length > 0;
    empty.textContent = loadInteractions({ includeArchived: false }).length === 0 ? 'No hay interacciones registradas.' : 'No hay interacciones que coincidan con el filtro.';
  }
  const seenInt = new Set();
  for (const interaction of interactions) {
    if (seenInt.has(interaction.id)) continue;
    seenInt.add(interaction.id);
    const customer = customers.get(interaction.clientId || interaction.customerId);
    const employee = employees.get(interaction.employeeId);
    const tr = document.createElement('tr');
    tr.dataset.interactionId = interaction.id;
    tr.innerHTML = `
      <td>${escapeHTML(interaction.date || '')}</td>
      <td>${escapeHTML(interaction.type || '')}</td>
      <td>${escapeHTML(customer?.companyName || customer?.name || interaction.clientId || '')}</td>
      <td>${escapeHTML(employee?.name || interaction.employeeId || '')}</td>
      <td>${escapeHTML(interaction.description || interaction.notes || '')}</td>
      <td class="row-actions">
        <button type="button" class="link-action" data-action="edit-interaction" data-interaction-id="${escapeHTML(interaction.id)}">Editar</button>
        <button type="button" class="link-action danger" data-action="delete-interaction" data-interaction-id="${escapeHTML(interaction.id)}">Eliminar</button>
      </td>`;
    tr.querySelector('[data-action="edit-interaction"]')?.addEventListener('click', () => fillInteractionForm(interaction));
    tr.querySelector('[data-action="delete-interaction"]')?.addEventListener('click', () => {
      openDeleteConfirmDialog({
        title: 'Eliminar interacción',
        message: '¿Deseas eliminar esta interacción? Esta acción no se puede deshacer.',
        confirmLabel: 'Eliminar',
        onConfirm: () => {
          deleteInteraction(interaction.id);
          if (qs('interaction-id')?.value === interaction.id) resetInteractionForm();
          renderInteractionList();
        }
      });
    });
    list.appendChild(tr);
  }
}

function handleInteractionSubmit(event) {
  event.preventDefault();
  clearInteractionErrors();
  const id = sanitizeText(qs('interaction-id')?.value);
  const payload = {
    clientId: sanitizeText(qs('interaction-client-id')?.value),
    employeeId: sanitizeText(qs('interaction-employee-id')?.value),
    date: sanitizeText(qs('interaction-date')?.value),
    type: sanitizeText(qs('interaction-type')?.value),
    description: sanitizeText(qs('interaction-notes')?.value)
  };
  const validation = validateInteraction(payload);
  if (!validation.valid) {
    const map = {
      clientId: ['error-interaction-client-id', 'interaction-client-id'],
      employeeId: ['error-interaction-employee-id', 'interaction-employee-id'],
      date: ['error-interaction-date', 'interaction-date'],
      type: ['error-interaction-type', 'interaction-type'],
      description: ['error-interaction-notes', 'interaction-notes']
    };
    for (const [key, [errId, fieldId]] of Object.entries(map)) {
      if (validation.errors[key]) {
        setErrorText(errId, validation.errors[key]);
        qs(fieldId)?.setAttribute('aria-invalid', 'true');
      }
    }
    qs('[aria-invalid="true"]')?.focus();
    return;
  }
  if (id) updateInteraction(id, payload);
  else addInteraction(payload);
  resetInteractionForm();
  renderInteractionList();
}


function getSelectedEntityId() {
  return sanitizeText(qs('entity_id')?.value || qs('edit-entity')?.value || qs('entity-id')?.value || '')
    || sanitizeText(qs('#entity-list tr[data-selected="true"]')?.dataset?.entityId || '');
}

function selectEntityRow(entityId) {
  const list = qs('entity-list');
  if (!list) return;
  const id = String(entityId || '');
  list.querySelectorAll('tr').forEach((tr) => {
    const selected = tr.dataset.entityId === id;
    tr.classList.toggle('selected', selected);
    if (selected) tr.setAttribute('data-selected', 'true');
    else tr.removeAttribute('data-selected');
  });
  if (id) {
    if (qs('entity_id')) qs('entity_id').value = id;
    if (qs('edit-entity')) qs('edit-entity').value = id;
  }
}

function captureClients360Context(openClientId) {
  const filter = sanitizeText(qs('entity-list-filter')?.value || '');
  const selectedEntityId = getSelectedEntityId();
  setClients360ViewState({
    openClientId: openClientId || null,
    returnFilter: filter,
    selectedEntityId
  });
  return { filter, selectedEntityId };
}

function openClient360(entityId) {
  const id = String(entityId || '').trim();
  if (!id) return;
  captureClients360Context(id);
  renderClient360(id);
  navigateTo('client-360', () => {
    renderClient360(id);
    qs('client-360-back')?.focus?.();
  });
}

function renderClient360(customerId) {
  const id = String(customerId || getClients360ViewState().openClientId || '').trim();
  if (!id) return;
  const { customer, opportunities, interactions, isArchived, emptyStates } = getCustomer360(id);
  const summary = qs('client-360-summary');
  const oppBody = qs('client-360-opportunities');
  const intBody = qs('client-360-interactions');
  const oppEmpty = qs('client-360-opportunities-empty');
  const intEmpty = qs('client-360-interactions-empty');
  if (!summary || !oppBody || !intBody) return;

  if (!customer) {
    summary.innerHTML = '<p>No se encontró el cliente solicitado.</p>';
    oppBody.replaceChildren();
    intBody.replaceChildren();
    if (oppEmpty) oppEmpty.hidden = false;
    if (intEmpty) intEmpty.hidden = false;
    return;
  }

  const name = escapeHTML(customer.companyName || customer.name || customer.id || 'Cliente');
  const contact = escapeHTML(customer.contactName || customer.contact || '-');
  const email = escapeHTML(customer.email || '-');
  const phone = escapeHTML(customer.phone || '-');
  const status = escapeHTML(customer.status || '-');
  const archivedBadge = isArchived ? '<span class="badge-archived" data-archived="true">Archivado</span>' : '<span class="status-active">Activo</span>';
  summary.innerHTML = `
    <div class="client-360-summary-grid">
      <div><strong>Cliente</strong><div>${name}</div></div>
      <div><strong>Contacto</strong><div>${contact}</div></div>
      <div><strong>Correo</strong><div>${email}</div></div>
      <div><strong>Teléfono</strong><div>${phone}</div></div>
      <div><strong>Estado</strong><div>${status} ${archivedBadge}</div></div>
    </div>
    ${isArchived ? '<p class="client-360-archived-note" role="status">Este cliente está archivado. No se permiten nuevas interacciones ni oportunidades.</p>' : ''}`;

  oppBody.replaceChildren();
  const opps = Array.isArray(opportunities) ? opportunities : [];
  if (oppEmpty) oppEmpty.hidden = !emptyStates.opportunities && opps.length > 0;
  for (const opp of opps) {
    const tr = document.createElement('tr');
    const folio = [opp.series, opp.folio].filter(Boolean).join('-') || opp.id || '-';
    tr.innerHTML = `<td>${escapeHTML(folio)}</td><td>${escapeHTML(opp.stage || opp.status || '-')}</td><td>${escapeHTML(formatMoney(opp.amount ?? opp.totalAmount, opp.currency || MVP_BASE_CURRENCY))}</td><td>${escapeHTML(opp.closeDate || opp.endDate || '-')}</td>`;
    oppBody.appendChild(tr);
  }

  intBody.replaceChildren();
  const ints = Array.isArray(interactions) ? interactions : [];
  if (intEmpty) intEmpty.hidden = !emptyStates.interactions && ints.length > 0;
  const employeesById = new Map(loadEmployees({ includeArchived: true }).map((e) => [String(e.id), e]));
  for (const interaction of ints) {
    const employee = employeesById.get(String(interaction.employeeId || ''));
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${escapeHTML(interaction.date || '-')}</td><td>${escapeHTML(interaction.type || '-')}</td><td>${escapeHTML(employee?.name || interaction.employeeId || '-')}</td><td>${escapeHTML(interaction.description || interaction.notes || '-')}</td>`;
    intBody.appendChild(tr);
  }

  setClients360ViewState({ openClientId: id });
}

function restoreClients360Context() {
  const state = getClients360ViewState();
  const filter = sanitizeText(state.returnFilter || '');
  const selectedId = sanitizeText(state.selectedEntityId || '');
  navigateTo('entities', () => {
    const filterInput = qs('entity-list-filter');
    if (filterInput) {
      filterInput.value = filter;
      filterInput.dispatchEvent(new Event('input', { bubbles: true }));
    } else {
      renderEntityList();
    }
    if (selectedId) selectEntityRow(selectedId);
    const selectedRow = qs(`#entity-list [data-entity-id="${CSS.escape(selectedId)}"]`);
    (selectedRow || qs('entity-list-filter') || qs('nav-entities'))?.focus?.();
  });
}

function bindOperationalHandlers() {
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

  const employeeForm = qs('employee-form');
  if (employeeForm && !employeeForm.dataset.bound) {
    employeeForm.addEventListener('submit', handleEmployeeSubmit);
    employeeForm.dataset.bound = 'true';
  }
  const employeeReset = qs('employee-reset');
  if (employeeReset && !employeeReset.dataset.bound) {
    employeeReset.addEventListener('click', resetEmployeeForm);
    employeeReset.dataset.bound = 'true';
  }
  const employeeFilter = qs('employee-list-filter');
  if (employeeFilter && !employeeFilter.dataset.bound) {
    employeeFilter.addEventListener('input', () => { setEmployeesViewState({ filter: employeeFilter.value }); renderEmployeeList(); });
    employeeFilter.dataset.bound = 'true';
  }
  const employeeArchived = qs('employee-show-archived');
  if (employeeArchived && !employeeArchived.dataset.bound) {
    employeeArchived.addEventListener('change', () => { setEmployeesViewState({ showArchived: employeeArchived.checked }); renderEmployeeList(); populateInteractionSelectors(); });
    employeeArchived.dataset.bound = 'true';
  }

  const interactionForm = qs('interaction-form');
  if (interactionForm && !interactionForm.dataset.bound) {
    interactionForm.addEventListener('submit', handleInteractionSubmit);
    interactionForm.dataset.bound = 'true';
  }
  const interactionReset = qs('interaction-reset');
  if (interactionReset && !interactionReset.dataset.bound) {
    interactionReset.addEventListener('click', resetInteractionForm);
    interactionReset.dataset.bound = 'true';
  }
  const interactionFilter = qs('interaction-list-filter');
  if (interactionFilter && !interactionFilter.dataset.bound) {
    interactionFilter.addEventListener('input', renderInteractionList);
    interactionFilter.dataset.bound = 'true';
  }

  const entityShowArchived = qs('entity-show-archived');
  if (entityShowArchived && !entityShowArchived.dataset.bound) {
    entityShowArchived.addEventListener('change', () => { updateEntitySelect(); populateInteractionSelectors(); });
    entityShowArchived.dataset.bound = 'true';
  }

  const client360Back = qs('client-360-back');
  if (client360Back && !client360Back.dataset.bound) {
    client360Back.addEventListener('click', restoreClients360Context);
    client360Back.dataset.bound = 'true';
  }

  const navButtons = document.querySelectorAll('.nav-module');
  navButtons.forEach((button) => {
    if (button.dataset.bound) return;
    button.addEventListener('click', () => navigateTo(button.dataset.module));
    button.dataset.bound = 'true';
  });

  const dashboardActions = [
    ['action-new-entity', 'entities', 'name'],
    ['action-new-document', 'documents', 'document-entity'],
    ['action-find', 'search', 'search-input'],
    ['action-open-entities', 'entities']
  ];

  dashboardActions.forEach(([id, viewName, focusId]) => {
    const button = qs(id);
    if (!button || button.dataset.bound) return;
    button.addEventListener('click', () => {
      navigateTo(viewName, () => {
        if (focusId) qs(focusId)?.focus();
      });
    });
    button.dataset.bound = 'true';
  });

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

  const entityFilter = qs('entity-list-filter');
  if (entityFilter && !entityFilter.dataset.bound) {
    entityFilter.addEventListener('input', renderEntityList);
    entityFilter.dataset.bound = 'true';
  }
  const documentFilter = qs('document-list-filter');
  if (documentFilter && !documentFilter.dataset.bound) {
    documentFilter.addEventListener('input', renderDocumentList);
    documentFilter.dataset.bound = 'true';
  }
}

async function boot() {
  const injectedResult = globalThis.__crmModuleConfigResult;
  const hasModuleResult = injectedResult && typeof injectedResult === 'object' && !injectedResult.__bootOwned;
  const hasUserConfig = typeof globalThis.userConfig !== 'undefined';
  const current = getConfig();
  const moduleResult = hasModuleResult
    ? injectedResult
    : hasUserConfig
      ? normalizeConfig(globalThis.userConfig)
      : (current && typeof current === 'object' ? { config: current, errors: [], usedFallback: false } : normalizeConfig(null));
  if (moduleResult?.config) setActiveConfig(moduleResult.config);
  else setActiveConfig(normalizeConfig(null).config);
  globalThis.__crmModuleConfigResult = {
    config: getActiveConfig(),
    errors: Array.isArray(moduleResult?.errors) ? moduleResult.errors : [],
    usedFallback: Boolean(moduleResult?.usedFallback),
    __bootOwned: true
  };

  renderBranding();
  renderWelcomeBanner();
  renderModuleLabels();
  renderConfigBanner();
  bindSidebarControls();
  bindUnsavedDialog();
  bindConfigBanner();
  bindStorageReset();
  bindOperationalHandlers();

  if (getCRMStorageErrors().length > 0) {
    renderStorageErrors();
    return;
  }

  renderConfigBanner();
  renderStorageErrors();
  initializeOperationalState();
  showView(readPersistedView());

  const entityDelete = qs('delete-entity');
  if (entityDelete && !entityDelete.dataset.bound) {
    entityDelete.addEventListener('click', () => {
      const selectedId = qs('entity-id')?.value;
      if (!selectedId) return;
      openDeleteConfirmDialog({
        title: 'Confirmar eliminación',
        message: '¿Deseas eliminar el cliente seleccionado? Esta acción no se puede deshacer.',
        confirmLabel: 'Eliminar',
        opener: entityDelete,
        onConfirm: () => {
          deleteEntity(selectedId);
          updateEntitySelect();
          resetEntityForm();
          updateDashboardStats();
          renderSearchResults();
        }
      });
    });
    entityDelete.dataset.bound = 'true';
  }

  const documentDelete = qs('delete-document');
  if (documentDelete && !documentDelete.dataset.bound) {
    documentDelete.addEventListener('click', () => {
      const selectedId = qs('document-id')?.value;
      if (!selectedId) return;
      openDeleteConfirmDialog({
        title: 'Confirmar eliminación',
        message: '¿Deseas eliminar la oportunidad seleccionada? Esta acción no se puede deshacer.',
        confirmLabel: 'Eliminar',
        opener: documentDelete,
        onConfirm: () => {
          deleteDocument(selectedId);
          updateDocumentSelect();
          resetDocumentForm();
          updateDashboardStats();
          renderSearchResults();
        }
      });
    });
    documentDelete.dataset.bound = 'true';
  }

  const initialView = readPersistedView();
  showView(initialView);
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
