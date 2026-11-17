import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mountLiveDom } from './live-dom.js';
import { boot } from '../../src/app.js';
import { addCustomer, addEmployee, addOpportunity, loadEntities } from '../../src/storage.js';

async function bootAuthenticatedApp() {
  localStorage.setItem('erp.authenticatedUser', 'Cliente1');
  await boot();
}

describe('US1 - acceso dividido', () => {
  beforeEach(async () => {
    window.history.replaceState({}, '', '/');
    mountLiveDom();
    vi.resetModules();
    await import('../../src/main.js');
  });

  it('shows both login panels', () => {
    expect(document.querySelector('#login-view').hidden).toBe(false);
    expect(document.querySelector('.login-brand-panel')).toBeTruthy();
    expect(document.querySelector('.login-form-panel')).toBeTruthy();
  });

  it('toggles password visibility without changing its value', () => {
    const password = document.querySelector('#login-password');
    const toggle = document.querySelector('#login-password-toggle');
    password.value = 'Claveé123!';

    toggle.click();
    expect(password.type).toBe('text');
    expect(toggle.getAttribute('aria-pressed')).toBe('true');
    expect(toggle.getAttribute('aria-label')).toBe('Ocultar contraseña');
    expect(password.value).toBe('Claveé123!');

    toggle.click();
    expect(password.type).toBe('password');
    expect(toggle.getAttribute('aria-pressed')).toBe('false');
    expect(toggle.getAttribute('aria-label')).toBe('Mostrar contraseña');
    expect(password.value).toBe('Claveé123!');
  });

  it('shows a Spanish error that never contains the password', () => {
    const secret = 'contraseñaSuperSecreta1234';
    document.querySelector('#login-username').value = 'Cliente1';
    document.querySelector('#login-password').value = secret;
    document.querySelector('#login-form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    const error = document.querySelector('#login-error').textContent;
    expect(error).toMatch(/usuario|contraseña/i);
    expect(error).not.toContain(secret);
  });

  it('opens the app with valid credentials', () => {
    document.querySelector('#login-username').value = 'Cliente1';
    document.querySelector('#login-password').value = '1234';
    document.querySelector('#login-form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    expect(localStorage.getItem('erp.authenticatedUser')).toBe('Cliente1');
    expect(document.querySelector('#app-shell').hidden).toBe(false);
  });
});

describe('US3 - banner y KPI', () => {
  beforeEach(async () => {
    mountLiveDom();
    await bootAuthenticatedApp();
  });

  it('renders the username and four neutral KPIs', () => {
    expect(document.querySelector('#welcome-title').textContent).toBe('Bienvenido, Cliente1');
    expect(document.querySelectorAll('.stats-grid .stat-card')).toHaveLength(4);
    expect(document.querySelector('#stat-clients-label').textContent).toBe('Clientes activos');
    expect(document.querySelector('#stat-opportunities-label').textContent).toBe('Oportunidades activas');
    expect(document.querySelector('#stat-revenue-label').textContent).toBe('Ingresos estimados');
    expect(document.querySelector('#stat-conversion-label').textContent).toBe('Tasa de conversión');
    expect(document.querySelector('#stat-clients').textContent).toBe('0');
    expect(document.querySelector('#stat-opportunities').textContent).toBe('0');
    expect(document.querySelector('#stat-revenue').textContent).toBe('$0');
    expect(document.querySelector('#stat-conversion').textContent).toBe('0 %');
  });

  it('recalculates the four KPIs from CRM storage', () => {
    const customer = addCustomer({
      name: 'Ana García Ñuñez',
      contactName: 'Ana García',
      email: 'ana@ejemplo.cl',
      phone: '912345678',
      status: 'Activo'
    });
    const employee = addEmployee({ name: 'María Pérez', role: 'Ejecutiva' });
    addOpportunity({
      clientId: customer.id,
      employeeId: employee.id,
      amount: 1234567,
      closeDate: '2026-12-31',
      stage: 'Evaluación'
    });
    addOpportunity({
      clientId: customer.id,
      employeeId: employee.id,
      amount: 0,
      closeDate: '2026-12-31',
      stage: 'Ganado'
    });
    addOpportunity({
      clientId: customer.id,
      employeeId: employee.id,
      amount: 0,
      closeDate: '2026-12-31',
      stage: 'Perdido'
    });

    document.querySelector('#nav-dashboard').click();

    expect(document.querySelector('#stat-clients').textContent).toBe('1');
    expect(document.querySelector('#stat-opportunities').textContent).toBe('1');
    expect(document.querySelector('#stat-revenue').textContent).toMatch(/1\.234\.567/);
    expect(document.querySelector('#stat-conversion').textContent).toBe('50 %');
  });
});

describe('US4 - formularios estandarizados', () => {
  beforeEach(async () => {
    mountLiveDom();
    await bootAuthenticatedApp();
    document.querySelector('#nav-entities').click();
  });

  it('groups contact data and commercial terms into two exact sections', () => {
    const sections = document.querySelectorAll('#entity-form .form-section');
    expect(sections).toHaveLength(2);
    expect(sections[0].querySelector('#email')).toBeTruthy();
    expect(sections[0].querySelector('#phone')).toBeTruthy();
    expect(sections[1].querySelector('#entity-currency')).toBeTruthy();
    expect(sections[1].querySelector('#creditLimit')).toBeTruthy();
    expect(sections[1].querySelector('#paymentTerms')).toBeTruthy();
  });

  it('does not save when required fields are empty', () => {
    const before = loadEntities().length;
    document.querySelector('#entity-form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    expect(loadEntities()).toHaveLength(before);
    expect(document.querySelector('#error-name').textContent).toBeTruthy();
    expect(document.querySelector('#error-code').textContent).toBeTruthy();
  });
});

describe('US5 - UTF-8 limpio', () => {
  beforeEach(async () => {
    mountLiveDom();
    await bootAuthenticatedApp();
  });

  it('round-trips accented names and currency symbols', () => {
    document.querySelector('#nav-entities').click();
    document.querySelector('#name').value = 'Ana García Ñuñez';
    document.querySelector('#code').value = 'CLI-Ñ-001';
    document.querySelector('#email').value = 'ana@ejemplo.cl';
    document.querySelector('#entity-currency').value = '€';
    document.querySelector('#creditLimit').value = '1000';
    document.querySelector('#entity-form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    const saved = loadEntities().find((entity) => entity.name === 'Ana García Ñuñez');
    expect(saved).toBeTruthy();
    expect(saved.currency).toBe('€');
    expect(document.body.textContent).not.toContain('\uFFFD');
  });
});
