import { beforeEach, describe, expect, it, vi } from 'vitest';
import { bootApp, clearStorages, seedAuth } from './live-dom.js';
import { addEntity, addDocument } from '../../src/storage.js';

function submitDocumentForm() {
  document.querySelector('#document-form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
}

describe('US3 - Opportunities lifecycle (FR-006, FR-007, SC-002, T030/T062)', () => {
  beforeEach(() => {
    clearStorages();
    seedAuth();
  });

  it('persists allowed transition and blocks invalid transition with accessible feedback', async () => {
    const ent = addEntity({ name: 'Acme', code: 'A1', email: 'a@a.cl', phone: '912345678', creditLimit: 10 });
    const doc = addDocument({
      entity_id: ent.id, series: 'OP', folio: 1, startDate: '2026-01-01', endDate: '2026-12-01',
      quantity: 1, subtotal: 100, discount: 0, taxAmount: 0, totalAmount: 100, currency: 'CLP', status: 'Evaluación'
    });

    await bootApp();
    document.querySelector('#nav-documents').click();

    // Open existing opportunity - allowed transitions from Evaluación include Propuesta
    document.querySelector(`[data-action="edit"][data-document-id="${doc.id}"]`).click();
    const status = document.querySelector('#status');
    expect(status).toBeTruthy();
    const options = [...status.querySelectorAll('option')].map((o) => o.value).filter(Boolean);
    expect(options).toContain('Propuesta');

    status.value = 'Propuesta';
    const errBefore = document.querySelector('#error-status')?.textContent;
    submitDocumentForm();
    const fb = document.querySelector('#lifecycle-feedback')?.textContent || '';
    const err = document.querySelector('#error-status')?.textContent || '';
    expect(fb + err).not.toMatch(/no permitida|inválida/i);
    const storedAfterAllowed = JSON.parse(localStorage.getItem('erp_base_module:documents') || '[]').find((d) => d.id === doc.id);
    expect(storedAfterAllowed.status).toBe('Propuesta');

    // Invalid transition: Propuesta -> Ganado (not allowed directly in default lifecycle)
    document.querySelector(`[data-action="edit"][data-document-id="${doc.id}"]`).click();
    const status2 = document.querySelector('#status');
    // Force invalid value to simulate tampered/invalid selection
    let opt = status2.querySelector('option[value="Ganado"]');
    if (!opt) {
      opt = document.createElement('option');
      opt.value = 'Ganado';
      opt.textContent = 'Ganado';
      status2.appendChild(opt);
    }
    status2.value = 'Ganado';
    submitDocumentForm();

    const feedback = document.querySelector('#lifecycle-feedback') || document.querySelector('#error-status');
    expect(feedback?.textContent || '').toMatch(/no permitida|inválida|transici/i);
    const storedAfterInvalid = JSON.parse(localStorage.getItem('erp_base_module:documents') || '[]').find((d) => d.id === doc.id);
    expect(storedAfterInvalid.status).toBe('Propuesta');
  });
});

describe('US3 - Config error banner (FR-013, SC-002, T064)', () => {
  beforeEach(() => {
    clearStorages();
    seedAuth();
  });

  it('shows visible config banner on loadModuleConfig error/fallback without blocking basic CRUD', async () => {
    // Invalid module config to trigger errors/fallback
    const bad = { moduleName: '', statusLifecycle: { statuses: [], transitions: {} }, theme: { accentColor: 'nope' } };
    globalThis.userConfig = bad;
    const { normalizeConfig } = await import('../../src/module-config.js');
    globalThis.__crmModuleConfigResult = normalizeConfig(bad);
    await bootApp();
    globalThis.userConfig = null;
    globalThis.__crmModuleConfigResult = undefined;

    const banner = document.querySelector('#config-error-banner');
    const detail = document.querySelector('#config-error-detail');
    expect(banner).toBeTruthy();
    expect(banner.hidden).toBe(false);
    expect((detail?.textContent || '').length).toBeGreaterThan(0);

    // Basic CRUD still usable: can navigate and create employee
    document.querySelector('#nav-employees').click();
    expect(document.querySelector('#view-employees').hidden).toBe(false);
    document.querySelector('#employee-name').value = 'Test Config';
    document.querySelector('#employee-role').value = 'Ventas';
    document.querySelector('#employee-form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    expect(document.querySelector('#employee-list').textContent).toContain('Test Config');
  });
});
