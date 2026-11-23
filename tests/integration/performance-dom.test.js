import { beforeEach, describe, expect, it } from 'vitest';
import { bootApp, clearStorages, seedAuth } from './live-dom.js';

function seed500() {
  const customers = [];
  const entities = [];
  const opportunities = [];
  const documents = [];
  for (let i = 1; i <= 500; i++) {
    const id = `c${i}`;
    customers.push({ id, name: `Cliente ${i}`, companyName: `Cliente ${i}`, contactName: `Contacto ${i}`, email: `c${i}@acme.cl`, phone: '912345678', archived: false });
    entities.push({ id, entity_id: id, name: `Cliente ${i}`, code: `C${String(i).padStart(3,'0')}`, email: `c${i}@acme.cl`, phone: '912345678' });
    const close = `2026-12-${String((i % 28) + 1).padStart(2,'0')}`;
    opportunities.push({ id: `o${i}`, customerId: id, clientId: id, employeeId: 'e1', series: 'OP', folio: i, stage: 'Propuesta', status: 'Propuesta', amount: 1000 + i, currency: 'CLP', closeDate: close, endDate: close, archived: false });
    documents.push({ id: `o${i}`, entity_id: id, series: 'OP', folio: i, status: 'Propuesta', totalAmount: 1000 + i, currency: 'CLP', startDate: '2026-01-01', endDate: close, quantity: 1, subtotal: 1000+i, discount: 0, taxAmount: 0 });
  }
  localStorage.setItem('crm_module:customers', JSON.stringify(customers));
  localStorage.setItem('erp_base_module:entities', JSON.stringify(entities));
  localStorage.setItem('crm_module:opportunities', JSON.stringify(opportunities));
  localStorage.setItem('erp_base_module:documents', JSON.stringify(documents));
}

describe('US6 - Performance DOM real 500 registros (FR-014, SC-005, T052)', () => {
  beforeEach(() => { clearStorages(); seedAuth(); });

  it('renders initial list and completes filter within SC-005 budgets', async () => {
    seed500();
    await bootApp();
    const t0 = performance.now();
    document.querySelector('#nav-entities').click();
    const renderMs = performance.now() - t0;
    expect(document.querySelectorAll('#entity-list tr').length).toBeGreaterThan(0);
    expect(renderMs).toBeLessThanOrEqual(2000);

    const filter = document.querySelector('#entity-list-filter');
    const t1 = performance.now();
    filter.value = 'Cliente 123';
    filter.dispatchEvent(new Event('input', { bubbles: true }));
    const filterMs = performance.now() - t1;
    expect(document.querySelector('#entity-list').textContent).toContain('Cliente 123');
    expect(filterMs).toBeLessThanOrEqual(10000);
  }, 60000);
});
