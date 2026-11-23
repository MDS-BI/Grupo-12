import { beforeEach, describe, expect, it } from 'vitest';
import { bootApp, clearStorages, seedAuth } from './live-dom.js';

function seed() {
  const customers = [
    { id: 'c1', name: 'Acme', companyName: 'Acme', contactName: 'Ana', email: 'a@a.cl', phone: '912345678', archived: false },
    { id: 'c2', name: 'Beta', companyName: 'Beta', contactName: 'Beto', email: 'b@b.cl', phone: '912345679', archived: false },
  ];
  localStorage.setItem('crm_module:customers', JSON.stringify(customers));
  localStorage.setItem('crm_module:employees', JSON.stringify([{id:'e1',name:'Emp',role:'Ventas',archived:false}]));
  localStorage.setItem('erp_base_module:entities', JSON.stringify([
    { id: 'c1', entity_id: 'c1', name: 'Acme', code: 'A1', email: 'a@a.cl', phone: '912345678' },
    { id: 'c2', entity_id: 'c2', name: 'Beta', code: 'B1', email: 'b@b.cl', phone: '912345679' },
  ]));
  const now = new Date();
  const in10 = new Date(now.getTime() + 10 * 24 * 3600 * 1000).toISOString().slice(0, 10);
  const in60 = new Date(now.getTime() + 60 * 24 * 3600 * 1000).toISOString().slice(0, 10);
  localStorage.setItem('crm_module:opportunities', JSON.stringify([
    { id: 'o1', customerId: 'c1', clientId: 'c1', employeeId: 'e1', series: 'OP', folio: 1, stage: 'Propuesta', status: 'Propuesta', amount: 1000, currency: 'CLP', closeDate: in10, endDate: in10, archived: false },
    { id: 'o2', customerId: 'c2', clientId: 'c2', employeeId: 'e1', series: 'OP', folio: 2, stage: 'Propuesta', status: 'Propuesta', amount: 2000, currency: 'CLP', closeDate: in60, endDate: in60, archived: false },
    { id: 'o3', customerId: 'c1', clientId: 'c1', employeeId: 'e1', series: 'OP', folio: 3, stage: 'Ganado', status: 'Ganado', amount: 500, currency: 'CLP', closeDate: in10, endDate: in10, archived: false },
  ]));
  localStorage.setItem('erp_base_module:documents', JSON.stringify([
    { id: 'o1', entity_id: 'c1', series: 'OP', folio: 1, status: 'Propuesta', totalAmount: 1000, currency: 'CLP', startDate: '2026-01-01', endDate: in10 },
    { id: 'o2', entity_id: 'c2', series: 'OP', folio: 2, status: 'Propuesta', totalAmount: 2000, currency: 'CLP', startDate: '2026-01-01', endDate: in60 },
    { id: 'o3', entity_id: 'c1', series: 'OP', folio: 3, status: 'Ganado', totalAmount: 500, currency: 'CLP', startDate: '2026-01-01', endDate: in10 },
  ]));
}

describe('US5 - Dashboard próximos cierres e integridad (FR-010, FR-011, SC-004, T046/T057)', () => {
  beforeEach(() => { clearStorages(); seedAuth(); });

  it('renders upcoming closures within 30 days, excludes archived/closed, and navigates to document', async () => {
    seed();
    await bootApp();
    document.querySelector('#nav-dashboard').click();

    const section = document.querySelector('#upcoming-closures-section');
    const list = document.querySelector('#upcoming-closures-list');
    const empty = document.querySelector('#upcoming-closures-empty');
    expect(section).toBeTruthy();
    expect(list).toBeTruthy();
    expect(empty.hidden).toBe(true);
    expect(list.textContent).toContain('Acme');
    expect(list.textContent).not.toContain('Beta'); // 60 days
    expect(list.textContent).not.toContain('Ganado');

    const action = list.querySelector('[data-action="open-upcoming-opportunity"]');
    expect(action).toBeTruthy();
    action.click();
    expect(document.querySelector('#view-documents').hidden).toBe(false);
  });

  it('renders referential integrity report when there are orphan refs and no false positives when clean', async () => {
    seed();
    // add orphan interaction
    localStorage.setItem('crm_module:interactions', JSON.stringify([
      { id: 'i1', clientId: 'missing-client', employeeId: 'missing-emp', type: 'Llamada', date: '2026-01-01', notes: 'x', archived: false }
    ]));
    await bootApp();
    document.querySelector('#nav-dashboard').click();
    const report = document.querySelector('#integrity-report');
    const rlist = document.querySelector('#integrity-report-list');
    const rempty = document.querySelector('#integrity-report-empty');
    expect(report).toBeTruthy();
    expect(rlist.textContent.length).toBeGreaterThan(0);
    expect(rempty.hidden).toBe(true);

    // clean case: no false positives
    clearStorages(); seedAuth(); seed();
    localStorage.setItem('crm_module:interactions', JSON.stringify([]));
    await bootApp();
    document.querySelector('#nav-dashboard').click();
    const rempty2 = document.querySelector('#integrity-report-empty');
    const rlist2 = document.querySelector('#integrity-report-list');
    expect(rempty2.hidden).toBe(false);
    expect(rlist2.children.length).toBe(0);
  });
});
