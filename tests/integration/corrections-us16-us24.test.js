import { beforeEach, describe, expect, it } from 'vitest';
import { bootApp, seedAuth } from './live-dom.js';
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
