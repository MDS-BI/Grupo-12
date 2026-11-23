import { describe, expect, it, beforeEach } from 'vitest';
import { JSDOM } from 'jsdom';
import { addCustomer, addEmployee, addOpportunity, getReferentialIntegrityReport } from '../../src/storage.js';

beforeEach(() => {
  const dom = new JSDOM('', { url: 'http://localhost/' });
  globalThis.localStorage = dom.window.localStorage;
  globalThis.localStorage.clear();
});

describe('referential integrity report (FR-011, SC-004)', () => {
  it('reports missing references without false positives', () => {
    localStorage.setItem('crm_module:customers', JSON.stringify([{ id: 'c1', companyName: 'Acme', contactName: 'Ana', email: 'a@a.com', phone: '1', status: 'Activo', archived: false }]));
    localStorage.setItem('crm_module:employees', JSON.stringify([{ id: 'e1', name: 'Luis', role: 'Ejecutivo', archived: false }]));
    localStorage.setItem('crm_module:opportunities', JSON.stringify([
      { id: 'opp-ok', clientId: 'c1', employeeId: 'e1', amount: 100, closeDate: '2026-12-01', stage: 'Propuesta', archived: false },
      { id: 'opp-orphan', clientId: 'missing-client', employeeId: 'e1', amount: 1, closeDate: '2026-12-01', stage: 'Evaluación', archived: false }
    ]));
    localStorage.setItem('crm_module:interactions', JSON.stringify([
      { id: 'int-ok', clientId: 'c1', employeeId: 'e1', date: '2026-11-01', type: 'Llamada', description: 'ok', archived: false },
      { id: 'int-orphan', clientId: 'c1', employeeId: 'missing-emp', date: '2026-11-02', type: 'Correo', description: 'bad', archived: false }
    ]));

    const report = getReferentialIntegrityReport();
    // debug
    // console.log(report, localStorage.getItem('crm_opportunities'));
    expect(Array.isArray(report.items)).toBe(true);
    expect(report.items.some((i) => i.recordId === 'opp-orphan')).toBe(true);
    expect(report.items.some((i) => i.recordId === 'int-orphan')).toBe(true);
    expect(report.items.some((i) => i.recordId === 'c1')).toBe(false);
  });

  it('returns empty report when data is consistent', () => {
    const c = addCustomer({ companyName: 'Acme', contactName: 'Ana', email: 'ana@acme.com', phone: '111', status: 'Activo' });
    const e = addEmployee({ name: 'Luis', role: 'Ejecutivo' });
    addOpportunity({ clientId: c.id, employeeId: e.id, amount: 100, closeDate: '2026-12-01', stage: 'Propuesta' });
    const report = getReferentialIntegrityReport();
    expect(report.items).toEqual([]);
  });
});
