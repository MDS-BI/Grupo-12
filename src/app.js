import { labelFor, normalizeConfig, setActiveConfig, getConfig, getVisibleCustomFields, PHONE_PREFIXES } from './module-config.js';
import { computeConversionRate } from './domain.js';
import { addCustomer, addDocument, addEntity, deleteDocument, deleteEntity, getCRMOverview, getCRMStorageErrors, loadCustomers, loadDocuments, loadEntities, resetCorruptedCRMStorage,
  searchCRM, updateCustomer, updateDocument, updateEntity, validateDocument, validateEntity } from './storage.js';

export const AUTH_STORAGE_KEY = 'erp.authenticatedUser';
export const SIDEBAR_STORAGE_KEY = 'erp.sidebarCollapsed';

const VIEW_KEYS = ['dashboard', 'entities', 'documents', 'search'];
const CRM_FORM_SELECTOR = 'form.crm-form';

let pendingNavigation = null;
const formBaselines = new WeakMap();

function qs(id) {
  return document.getElementById(id);
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
  renderSearchResults();
  showView('dashboard');
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

function formatCurrency(value) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0
  }).format(Number(value) || 0);
}

function renderWelcomeBanner() {
  const node = qs('welcome-title');
  if (!node) return;
  const user = localStorage.getItem(AUTH_STORAGE_KEY)
    || sessionStorage.getItem(AUTH_STORAGE_KEY)
    || 'Cliente1';
  node.textContent = `Bienvenido, ${user}`;
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

function renderEntityList() {
  const tbody = qs('entity-list');
  const empty = qs('entity-list-empty');
  if (!tbody) return;
  const entities = loadEntities();
  tbody.replaceChildren();
  if (empty) empty.hidden = entities.length > 0;
  for (const entity of entities) {
    const tr = document.createElement('tr');
    tr.dataset.entityId = entity.id;
    tr.innerHTML = `<td>${escapeHTML(entity.name || '')}</td><td>${escapeHTML(entity.code || '')}</td><td>${escapeHTML(entity.email || '')}</td><td>${escapeHTML(entity.phone || '')}</td>`
      + `<td class="row-actions"><button type="button" class="row-action" data-action="edit" data-entity-id="${escapeHTML(entity.id)}">Editar</button>`
      + `<button type="button" class="row-action danger" data-action="delete" data-entity-id="${escapeHTML(entity.id)}">Eliminar</button></td>`;
    tr.querySelector('[data-action="edit"]').addEventListener('click', () => {
      fillEntityForm(entity);
      const select = qs('edit-entity');
      if (select) select.value = entity.id;
      qs('entity-form')?.scrollIntoView?.({ block: 'nearest' });
    });
    tr.querySelector('[data-action="delete"]').addEventListener('click', (e) => {
      openDeleteConfirmDialog({
        title: 'Confirmar eliminación',
        message: '¿Deseas eliminar el cliente seleccionado? Esta acción no se puede deshacer.',
        confirmLabel: 'Eliminar',
        opener: e.currentTarget,
        onConfirm: () => {
          deleteEntity(entity.id);
          if (qs('entity-id')?.value === entity.id) resetEntityForm();
          updateEntitySelect();
          updateDashboardStats();
          renderSearchResults();
        }
      });
    });
    tbody.appendChild(tr);
  }
}

function renderDocumentList() {
  const tbody = qs('document-list');
  const empty = qs('document-list-empty');
  if (!tbody) return;
  const docs = loadDocuments();
  tbody.replaceChildren();
  if (empty) empty.hidden = docs.length > 0;
  for (const doc of docs) {
    const tr = document.createElement('tr');
    tr.dataset.documentId = doc.id;
    const folio = [doc.series, doc.folio].filter(Boolean).join('-');
    tr.innerHTML = `<td>${escapeHTML(doc.entityName || '')}</td><td>${escapeHTML(folio)}</td><td>${escapeHTML(doc.status || '')}</td><td>${escapeHTML(doc.totalAmount ?? '')} ${escapeHTML(doc.currency || '')}</td>`
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
    const entities = loadEntities();
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
  const entities = loadEntities();
  select.replaceChildren(new Option('Seleccionar...', ''));
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
  qs('entity-currency').value = entity.currency || 'CLP';
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
  if (result.type === 'client') {
    showView('entities');
    const entity = loadEntities().find((e) => e.id === result.id || e.entity_id === result.id);
    if (entity) fillEntityForm(entity);
    const select = qs('edit-entity');
    if (select) select.value = entity?.id || result.id;
  } else if (result.type === 'opportunity') {
    showView('documents');
    const doc = loadDocuments().find((d) => d.id === result.id);
    if (doc) fillDocumentForm(doc);
    const select = qs('edit-document');
    if (select) select.value = doc?.id || result.id;
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
  select.replaceChildren();

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
    currency: form.querySelector('#entity-currency')?.value || 'CLP',
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
    currency: form.querySelector('#currency')?.value || '',
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
    currency: entity.currency || 'CLP',
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
  const validation = validateDocument(toValidate);

  if (!validation.valid) {
    exposeValidationErrors('document', validation.errors, form);
    return;
  }

  clearValidationStates('document');
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
}

async function boot() {
  const current = getConfig();
  const normalized = current && typeof current === 'object' && !Array.isArray(current)
    ? current
    : normalizeConfig(null).config;
  setActiveConfig(normalized);
  renderBranding();
  renderWelcomeBanner();
  renderModuleLabels();
  bindSidebarControls();
  bindUnsavedDialog();
  bindStorageReset();
  bindOperationalHandlers();

  if (getCRMStorageErrors().length > 0) {
    renderStorageErrors();
    return;
  }

  renderStorageErrors();
  initializeOperationalState();


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
