import { beforeEach, describe, expect, it } from 'vitest';
import {
  addCustomer,
  addEmployee,
  addOpportunity,
  deleteCustomer,
  getCRMOverview,
  getDashboardMetrics,
  loadCustomers
} from '../../src/storage.js';

function closeDateWithin30Days() {
  const date = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);
  return date.toISOString().slice(0, 10);
}

function seedArchivedCustomerOpportunity(stage = 'Evaluación') {
  const customer = addCustomer({
    companyName: 'Cliente Archivado S.A.',
    contactName: 'Ana Archivada',
    email: `archivada-${Date.now()}@ejemplo.cl`,
    phone: '912345678',
    status: 'Activo'
  });
  const employee = addEmployee({ name: 'María Pérez', role: 'Ejecutiva' });
  const opportunity = addOpportunity({
    clientId: customer.id,
    employeeId: employee.id,
    amount: 450000,
    closeDate: closeDateWithin30Days(),
    stage
  });
  deleteCustomer(customer.id);
  return { customer, employee, opportunity };
}

beforeEach(() => {
  localStorage.clear();
});

describe('FR-068 - oportunidades de clientes archivados en el dashboard', () => {
  it('cuenta la oportunidad abierta en oportunidades, pipeline y próximos cierres', () => {
    const { customer } = seedArchivedCustomerOpportunity();
    expect(loadCustomers().find((record) => record.id === customer.id)?.archived).toBe(true);

    const overview = getCRMOverview();
    expect(overview.activeCustomers).toBe(0);
    expect(overview.openOpportunities).toBe(1);
    expect(overview.totalPipeline).toBe(450000);
    expect(overview.upcomingClosures).toBe(1);
  });

  it('no cuenta como abierta una etapa terminal del cliente archivado', () => {
    seedArchivedCustomerOpportunity('Ganado');

    const overview = getCRMOverview();
    expect(overview.openOpportunities).toBe(0);
    expect(overview.totalPipeline).toBe(0);
    expect(overview.upcomingClosures).toBe(0);
  });

  it('expone getDashboardMetrics() solo como alias de compatibilidad', () => {
    seedArchivedCustomerOpportunity();
    expect(getDashboardMetrics()).toEqual(getCRMOverview());
  });
});
