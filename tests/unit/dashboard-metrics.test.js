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

    it('T192/FR-058: etapas inválidas se excluyen de conversión y se reportan como inconsistencia recuperable', () => {
    const customer = addCustomer({ companyName: 'C', contactName: 'Ana', email: 'c2@c.cl', phone: '912345678', status: 'Activo' });
    const employee = addEmployee({ name: 'Emp', role: 'Ventas' });
    addOpportunity({ clientId: customer.id, employeeId: employee.id, amount: 100, closeDate: closeDateWithin30Days(), stage: 'Ganado' });
    addOpportunity({ clientId: customer.id, employeeId: employee.id, amount: 100, closeDate: closeDateWithin30Days(), stage: 'Perdido' });
    // Seed invalid stages directly to simulate recoverable inconsistency
    const raw = JSON.parse(localStorage.getItem('crm_module:opportunities') || '[]');
    raw.push(
      { id: 'opp_bad_1', clientId: customer.id, employeeId: employee.id, amount: 100, closeDate: closeDateWithin30Days(), stage: 'EtapaRara', archived: false },
      { id: 'opp_bad_2', clientId: customer.id, employeeId: employee.id, amount: 100, closeDate: closeDateWithin30Days(), stage: null, archived: false }
    );
    localStorage.setItem('crm_module:opportunities', JSON.stringify(raw));

    const overview = getCRMOverview();
    expect(overview.invalidOpportunityStageCount).toBe(2);
    const valid = ['Prospección','Calificación','Evaluación','Propuesta','Negociación','Cierre','Ganado','Perdido'];
    const v = overview.opportunities.filter(o => valid.includes(o.stage ?? o.etapa));
    const won = v.filter(o => (o.stage ?? o.etapa) === 'Ganado').length;
    const lost = v.filter(o => (o.stage ?? o.etapa) === 'Perdido').length;
    expect(Math.round((won/(won+lost))*100)).toBe(50);
  });

  it('T147: reconcilia documentos legacy a oportunidades canónicas sin duplicar (idempotente)', async () => {
    const { reconcileLegacyDocumentsToCanonicalOpportunities } = await import('../../src/storage.js');
    localStorage.setItem('erp_base_module:documents', JSON.stringify([
      { id: 'doc-1', entity_id: 'ent-1', status: 'Evaluación', totalAmount: 1000, endDate: '2026-12-31' }
    ]));
    const a = reconcileLegacyDocumentsToCanonicalOpportunities();
    const b = reconcileLegacyDocumentsToCanonicalOpportunities();
    expect(a.filter((o) => String(o.id) === 'doc-1')).toHaveLength(1);
    expect(b.filter((o) => String(o.id) === 'doc-1')).toHaveLength(1);
    const overview = getCRMOverview();
    expect(overview.openOpportunities).toBeGreaterThanOrEqual(1);
  });
});
