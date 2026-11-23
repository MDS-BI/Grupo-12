import { beforeEach, describe, expect, it } from 'vitest';
import { bootApp, clearStorages, seedAuth } from './live-dom.js';

describe('US1 - Empleados UI real (FR-001, FR-002, FR-003, SC-001)', () => {
  beforeEach(() => {
    clearStorages();
    seedAuth();
  });

  it('crea, edita, filtra y lista empleados desde la UI real', async () => {
    await bootApp();
    document.querySelector('#nav-employees').click();

    expect(document.querySelector('#view-employees').hidden).toBe(false);
    document.querySelector('#employee-name').value = 'Ana Pérez';
    document.querySelector('#employee-role').value = 'Ejecutiva';
    document.querySelector('#employee-form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    expect(document.querySelector('#employee-list').textContent).toContain('Ana Pérez');
    expect(document.querySelector('#employee-list').textContent).toContain('Ejecutiva');

    document.querySelector('[data-action="edit-employee"]').click();
    document.querySelector('#employee-name').value = 'Ana P. Editada';
    document.querySelector('#employee-form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    expect(document.querySelector('#employee-list').textContent).toContain('Ana P. Editada');
    const names = document.querySelectorAll('#employee-list [data-employee-id]');
    expect(names.length).toBeGreaterThanOrEqual(1);

    document.querySelector('#employee-list-filter').value = 'no-match';
    document.querySelector('#employee-list-filter').dispatchEvent(new Event('input', { bubbles: true }));
    expect(document.querySelector('#employee-list-empty').hidden).toBe(false);
  });
});
