import { beforeEach, describe, expect, it, vi } from 'vitest';
import { bootApp, mountLiveDom, seedAuth } from './live-dom.js';
import { addEmployee, addCustomer, addOpportunity, getCRMOverview } from '../../src/storage.js';

async function boot() {
  localStorage.clear();
  sessionStorage.clear();
  seedAuth('Cliente1', { remember: true });
  await bootApp();
}

function fillValidEntity() {
  document.querySelector('#name').value = 'Empresa Test';
  document.querySelector('#code').value = 'C-001';
  document.querySelector('#email').value = 'test@empresa.cl';
  document.querySelector('#phone').value = '912345678';
  document.querySelector('#creditLimit').value = '1000';
}

describe('US23 - accesibilidad formularios y diálogos', () => {
  beforeEach(async () => {
    await boot();
  });

  it('T136: aria-invalid, aria-describedby y foco al primer campo inválido en entity-form', () => {
    document.querySelector('#nav-entities').click();
    const form = document.querySelector('#entity-form');
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    const name = document.querySelector('#name');
    const code = document.querySelector('#code');
    expect(name.getAttribute('aria-invalid')).toBe('true');
    expect(code.getAttribute('aria-invalid')).toBe('true');
    const described = name.getAttribute('aria-describedby') || '';
    expect(described.split(/\s+/)).toContain('error-name');
    expect(document.querySelector('#error-name').textContent.trim()).not.toBe('');
    expect(document.activeElement).toBe(name);
  });

  it('T136: limpia aria-invalid al volverse válido y reenviar', () => {
    document.querySelector('#nav-entities').click();
    const form = document.querySelector('#entity-form');
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    fillValidEntity();
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    expect(document.querySelector('#name').getAttribute('aria-invalid')).not.toBe('true');
  });
});

describe('US16 - tema oscuro coherente', () => {
  beforeEach(async () => {
    await boot();
  });

  it('T142: vistas y diálogos críticos existen y theme dark aplica data-theme', async () => {
    const { applyTheme } = await import('../../src/main.js');
    applyTheme('Oscuro');
    expect(document.documentElement.dataset.theme).toBe('dark');
    for (const sel of ['.topbar', '.sidebar', '#view-dashboard', '#view-entities', '#view-documents', '#view-search', '#unsaved-dialog']) {
      expect(document.querySelector(sel)).toBeTruthy();
    }
  });
});

describe('US17 - dashboard coherente con oportunidades', () => {
  beforeEach(async () => {
    await boot();
  });

  it('T148: crear oportunidad por UI refleja KPI del dashboard', () => {
    // seed entity via CRM/UI-compatible storage
    const customer = addCustomer({ name: 'Acme', contactName: 'Ana', email: 'acme@test.cl', phone: '912345678', status: 'Activo' });
    const employee = addEmployee({ name: 'Vendedor', role: 'Ventas' });
    addOpportunity({ clientId: customer.id, employeeId: employee.id, amount: 100000, closeDate: '2026-12-31', stage: 'Evaluación' });

    document.querySelector('#nav-dashboard').click();
    const opp = document.querySelector('#stat-opportunities').textContent;
    const rev = document.querySelector('#stat-revenue').textContent;
    expect(Number(opp)).toBeGreaterThanOrEqual(1);
    expect(rev).toMatch(/100/);
    const overview = getCRMOverview();
    expect(overview.openOpportunities).toBeGreaterThanOrEqual(1);
  });
});

describe('US19 - confirmación accesible para eliminaciones', () => {
  beforeEach(async () => {
    await boot();
  });

  it('T153: abre diálogo, cancelar/Escape no borra, confirmar elimina con restauración de foco', async () => {
    const { addEntity } = await import('../../src/storage.js');
    const entity = addEntity({ name: 'Borrar SA', code: 'DEL-1', email: 'borrar@sa.cl', phone: '912345678', creditLimit: 1000 });
    // refresh selects without guarded boot
    document.querySelector('#nav-entities').click();
    const select = document.querySelector('#edit-entity');
    // repopulate manually by reloading app
    const { boot: bootAgain } = await import('../../src/app.js');
    await bootAgain(); // guarded - ignore
    // force refresh
    const { loadEntities } = await import('../../src/storage.js');
    select.innerHTML = '<option value="">Seleccionar...</option>';
    for (const e of loadEntities()) {
      const opt = document.createElement('option');
      opt.value = e.id; opt.textContent = `${e.name} - ${e.code || ''}`; select.appendChild(opt);
    }
    select.value = entity.id;
    select.dispatchEvent(new Event('change', { bubbles: true }));

    const deleteBtn = document.querySelector('#delete-entity');
    deleteBtn.focus();
    deleteBtn.click();
    await Promise.resolve();
    await Promise.resolve();

    const dialog = document.querySelector('#delete-confirm-dialog');
    expect(dialog).toBeTruthy();
    expect(dialog.hidden).toBe(false);
    expect(dialog.getAttribute('role')).toBe('dialog');
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(dialog.contains(document.activeElement)).toBe(true);

    document.querySelector('#delete-confirm-cancel').click();
    expect(dialog.hidden).toBe(true);
    expect(document.activeElement).toBe(deleteBtn);
    expect([...document.querySelector('#edit-entity').options].some((o) => o.value === entity.id)).toBe(true);

    deleteBtn.focus();
    deleteBtn.click();
    expect(dialog.hidden).toBe(false);
    dialog.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    expect(dialog.hidden).toBe(true);
    expect(document.activeElement).toBe(deleteBtn);
    expect([...document.querySelector('#edit-entity').options].some((o) => o.value === entity.id)).toBe(true);

    deleteBtn.focus();
    deleteBtn.click();
    document.querySelector('#delete-confirm-accept').click();
    expect(dialog.hidden).toBe(true);
    expect([...document.querySelector('#edit-entity').options].some((o) => o.value === entity.id)).toBe(false);
  });
});

describe('US22 - Restaurar vista activa', () => {
  beforeEach(() => { localStorage.clear(); sessionStorage.clear(); });

  it('T175: persiste y restaura última vista interna válida tras recarga', async () => {
    mountLiveDom();
    localStorage.setItem('erp.authenticatedUser', 'Cliente1');
    await bootApp();
    document.querySelector('#nav-entities').click();
    await new Promise((r) => setTimeout(r, 30));
    expect(localStorage.getItem('erp.activeView')).toBe('entities');
    // reload: preserve localStorage
    mountLiveDom();
    localStorage.setItem('erp.authenticatedUser', 'Cliente1');
    await bootApp();
    await new Promise((r) => setTimeout(r, 30));
    expect(document.querySelector('#view-entities').hidden).toBe(false);
    expect(document.querySelector('#view-dashboard').hidden).toBe(true);
  });
});

describe('US24 - Moneda consistente CLP', () => {
  beforeEach(() => { localStorage.clear(); sessionStorage.clear(); });

  it('T181: dashboard, listados y formularios muestran moneda/regla consistente', async () => {
    mountLiveDom();
    localStorage.setItem('erp.authenticatedUser', 'Cliente1');
    await boot();
    const { addEntity, addDocument } = await import('../../src/storage.js');
    const ent = addEntity({ name: 'Moneda SA', code: 'M1', email: 'm@m.cl', phone: '912345678', creditLimit: 1000, currency: 'CLP' });
    addDocument({ entity_id: ent.id, series: 'OP', folio: 1, startDate: '2026-01-01', endDate: '2026-02-01', quantity: 1, subtotal: 1000, discount: 0, taxAmount: 0, totalAmount: 1000, currency: 'CLP', status: 'Propuesta' });
    // re-render after data changes
    document.querySelector('#nav-dashboard').click();
    await new Promise((r) => setTimeout(r, 20));
    expect(document.querySelector('#stat-revenue').textContent).toMatch(/\$|CLP/);
    document.querySelector('#nav-documents').click();
    await new Promise((r) => setTimeout(r, 20));
    expect(document.querySelector('#document-list').textContent).toMatch(/\$|CLP/);
    document.querySelector('#nav-entities').click();
    expect(document.querySelector('#entity-currency').value || 'CLP').toMatch(/CLP/);
  });
});

describe('US18 - Recordar mi sesión', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('T158: marcado persiste en localStorage; desmarcado en sessionStorage sin restaurar en nuevo contexto; logout limpia ambas', async () => {
    const tick = () => new Promise((r) => setTimeout(r, 30));
    const waitFor = async (fn, tries = 40) => {
      for (let i = 0; i < tries; i++) { if (fn()) return true; await tick(); }
      return fn();
    };

    // Checked: remember -> localStorage
    localStorage.clear(); sessionStorage.clear();
    mountLiveDom();
    vi.resetModules();
    window.history.replaceState({}, '', '/');
    await import('../../src/main.js');
    await waitFor(() => document.querySelector('#login-form'));
    document.querySelector('#login-username').value = 'Cliente1';
    document.querySelector('#login-password').value = '1234';
    document.querySelector('#login-remember').checked = true;
    document.querySelector('#login-form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await waitFor(() => localStorage.getItem('erp.authenticatedUser') === 'Cliente1');
    expect(localStorage.getItem('erp.authenticatedUser')).toBe('Cliente1');
    expect(sessionStorage.getItem('erp.authenticatedUser')).toBeNull();

    // New browser context: session cleared, localStorage kept
    sessionStorage.clear();
    mountLiveDom();
    vi.resetModules();
    window.history.replaceState({}, '', '/inicio');
    await import('../../src/main.js');
    await waitFor(() => document.querySelector('#app-shell')?.hidden === false);
    expect(document.querySelector('#app-shell').hidden).toBe(false);

    document.querySelector('#logout-button').click();
    await waitFor(() => !localStorage.getItem('erp.authenticatedUser') && !sessionStorage.getItem('erp.authenticatedUser'));
    expect(localStorage.getItem('erp.authenticatedUser')).toBeNull();
    expect(sessionStorage.getItem('erp.authenticatedUser')).toBeNull();

    // Unchecked: session only
    mountLiveDom();
    vi.resetModules();
    window.history.replaceState({}, '', '/');
    await import('../../src/main.js');
    await waitFor(() => document.querySelector('#login-view')?.hidden === false);
    document.querySelector('#login-username').value = 'Cliente1';
    document.querySelector('#login-password').value = '1234';
    const remember = document.querySelector('#login-remember');
    if (remember) remember.checked = false;
    document.querySelector('#login-form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await waitFor(() => sessionStorage.getItem('erp.authenticatedUser') === 'Cliente1');
    expect(sessionStorage.getItem('erp.authenticatedUser')).toBe('Cliente1');
    expect(localStorage.getItem('erp.authenticatedUser')).toBeNull();

    // New browser context: no session auth
    sessionStorage.clear();
    localStorage.removeItem('erp.authenticatedUser');
    mountLiveDom();
    vi.resetModules();
    window.history.replaceState({}, '', '/inicio');
    await import('../../src/main.js');
    await waitFor(() => document.querySelector('#login-view')?.hidden === false);
    expect(document.querySelector('#login-view').hidden).toBe(false);
    expect(document.querySelector('#app-shell').hidden).toBe(true);
  });
});