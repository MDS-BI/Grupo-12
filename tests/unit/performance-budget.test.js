import { beforeEach, describe, expect, it } from 'vitest';
import {
  addCustomer,
  addEmployee,
  addInteraction,
  addOpportunity,
  getCRMOverview,
  loadCustomers,
  loadInteractions,
  loadOpportunities
} from '../../src/storage.js';
import { computeConversionRate } from '../../src/domain.js';

function seedPerformanceData() {
  const employees = [];
  for (let i = 1; i <= 25; i += 1) {
    employees.push(addEmployee({ name: `Empleado ${i}`, role: 'Ejecutivo' }));
  }

  for (let i = 1; i <= 500; i += 1) {
    const customer = addCustomer({
      companyName: `Empresa ${String(i).padStart(3, '0')}`,
      contactName: `Contacto ${i}`,
      email: `cliente${i}@ejemplo.cl`,
      phone: `9${String(i).padStart(8, '0')}`,
      status: i % 2 === 0 ? 'Activo' : 'Posible'
    });

    const employee = employees[i % employees.length];
    const closeDate = new Date(Date.now() + (i % 40) * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    addOpportunity({
      clientId: customer.id,
      employeeId: employee.id,
      amount: 1000 + i,
      closeDate,
      stage: i % 3 === 0 ? 'Ganado' : 'Evaluación'
    });
    addInteraction({
      clientId: customer.id,
      employeeId: employee.id,
      date: '2026-11-20',
      type: 'Llamada',
      notes: `Nota ${i}`
    });
  }
}

function searchCustomers(term) {
  const normalized = String(term).trim().toLowerCase();
  return loadCustomers().filter((customer) => {
    const haystack = [customer.companyName, customer.contactName, customer.email, customer.status]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return haystack.includes(normalized);
  });
}

describe('T071 - presupuesto de rendimiento', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('maneja 500 clientes con oportunidades/interacciones y cumple búsqueda ≤10s y render ≤2s', () => {
    seedPerformanceData();

    const searchStart = performance.now();
    const results = searchCustomers('Empresa 250');
    const searchMs = performance.now() - searchStart;

    const renderStart = performance.now();
    const overview = getCRMOverview();
    const conversion = computeConversionRate(overview.opportunities);
    const customers = loadCustomers();
    const html = customers.map((customer) =>
      `<li>${customer.companyName} ${customer.contactName} ${customer.email} ${conversion}%</li>`
    ).join('');
    const renderMs = performance.now() - renderStart;

    expect(loadCustomers()).toHaveLength(500);
    expect(loadOpportunities()).toHaveLength(500);
    expect(loadInteractions()).toHaveLength(500);
    expect(results.length).toBeGreaterThan(0);
    expect(overview.totalCustomers).toBe(500);
    expect(overview.opportunities.length).toBe(500);
    expect(html).toContain('Empresa 250');
    expect(searchMs).toBeLessThanOrEqual(10_000);
    expect(renderMs).toBeLessThanOrEqual(2_000);
  });
});
