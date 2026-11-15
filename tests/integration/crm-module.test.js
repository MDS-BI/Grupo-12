import { describe, it, expect, beforeEach } from 'vitest';
import { JSDOM } from 'jsdom';
import { addCustomer, addEmployee, addOpportunity, addInteraction, getCRMOverview, clearCRMData } from '../../src/storage.js';

beforeEach(() => {
  const dom = new JSDOM('', { url: 'http://localhost/' });
  globalThis.localStorage = dom.window.localStorage;
  globalThis.localStorage.clear();
  clearCRMData();
});

describe('CRM workflow', () => {
  it('stores and validates customer data', () => {
    const customer = addCustomer({
      companyName: 'Acme',
      contactName: 'Ana García',
      email: 'ana@acme.com',
      phone: '555-1010',
      status: 'Posible'
    });

    expect(customer.companyName).toBe('Acme');
    expect(customer.status).toBe('Posible');
    expect(() => addCustomer({
      companyName: 'Beta',
      contactName: 'Bruno',
      email: 'ana@acme.com',
      phone: '555-2020'
    })).toThrow(/correo/i);
  });

  it('creates employee, opportunity and interaction records with correct validation', () => {
    const customer = addCustomer({ companyName: 'Acme', contactName: 'Ana', email: 'ana@acme.com', phone: '111' });
    const employee = addEmployee({ name: 'Luis', role: 'Ejecutivo' });

    const opportunity = addOpportunity({
      clientId: customer.id,
      employeeId: employee.id,
      amount: 2500,
      closeDate: '2026-12-20',
      stage: 'Evaluación'
    });

    expect(opportunity.stage).toBe('Evaluación');

    const interaction = addInteraction({
      clientId: customer.id,
      employeeId: employee.id,
      date: '2026-11-15',
      type: 'Llamada',
      description: 'Seguimiento inicial'
    });

    expect(interaction.type).toBe('Llamada');
    expect(() => addInteraction({
      clientId: customer.id,
      employeeId: employee.id,
      date: '',
      type: 'Correo'
    })).toThrow(/fecha/i);
  });

  it('computes dashboard metrics from open opportunities and active customers', () => {
    const customer1 = addCustomer({ companyName: 'Acme', contactName: 'Ana', email: 'ana@acme.com', phone: '111', status: 'Activo' });
    addCustomer({ companyName: 'Beta', contactName: 'Ben', email: 'ben@beta.com', phone: '222', status: 'Inactivo' });
    const employee = addEmployee({ name: 'Luis', role: 'Ejecutivo' });

    addOpportunity({ clientId: customer1.id, employeeId: employee.id, amount: 3000, closeDate: '2026-11-20', stage: 'Propuesta' });
    addOpportunity({ clientId: customer1.id, employeeId: employee.id, amount: 1500, closeDate: '2027-01-05', stage: 'Ganado' });

    const metrics = getCRMOverview();
    expect(metrics.totalCustomers).toBe(2);
    expect(metrics.activeCustomers).toBe(1);
    expect(metrics.openOpportunities).toBe(1);
    expect(metrics.totalPipeline).toBe(3000);
  });
});
