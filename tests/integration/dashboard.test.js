import { beforeEach, describe, expect, it } from 'vitest';
import { mountLiveDom, seedAuth } from './live-dom.js';
import { boot } from '../../src/app.js';
import { normalizeConfig, setActiveConfig } from '../../src/module-config.js';
import { addCustomer, addEmployee, addOpportunity } from '../../src/storage.js';

async function mount() {
  localStorage.clear();
  sessionStorage.clear();
  seedAuth('Jefe', { remember: true });
  mountLiveDom();
  setActiveConfig(normalizeConfig(null).config);
  await boot();
}

describe('US17 - dashboard coherente con oportunidades (DOM real)', () => {
  beforeEach(async () => { await mount(); });

  it('muestra KPIs en cero sin datos', () => {
    expect(document.querySelector('#stat-clients').textContent).toBe('0');
    expect(document.querySelector('#stat-opportunities').textContent).toBe('0');
    expect(document.querySelector('#stat-revenue').textContent).toBe('$0');
    expect(document.querySelector('#stat-conversion').textContent).toBe('0 %');
  });

  it('T148: crear oportunidad por storage/UI-compatible refleja KPI al mostrar dashboard', () => {
    const customer = addCustomer({ name: 'Acme', contactName: 'Ana', email: 'ana@acme.cl', phone: '912345678', status: 'Activo' });
    const employee = addEmployee({ name: 'Vendedor', role: 'Ventas' });
    addOpportunity({ clientId: customer.id, employeeId: employee.id, amount: 500000, closeDate: '2026-12-31', stage: 'Evaluación' });
    addOpportunity({ clientId: customer.id, employeeId: employee.id, amount: 0, closeDate: '2026-12-31', stage: 'Ganado' });
    addOpportunity({ clientId: customer.id, employeeId: employee.id, amount: 0, closeDate: '2026-12-31', stage: 'Perdido' });

    document.querySelector('#nav-dashboard').click();
    expect(document.querySelector('#stat-opportunities').textContent).toBe('1');
    expect(document.querySelector('#stat-revenue').textContent).toMatch(/500\.000|\$500\.000/);
    expect(document.querySelector('#stat-conversion').textContent).toBe('50 %');
  });

  it('acciones rápidas abren formularios/vistas clave', () => {
    document.querySelector('#action-new-entity').click();
    expect(document.querySelector('#view-entities').hidden).toBe(false);
    document.querySelector('#nav-dashboard').click();
    document.querySelector('#action-find').click();
    expect(document.querySelector('#view-search').hidden).toBe(false);
  });
});
