import { beforeEach, describe, expect, it } from 'vitest';
import { bootApp, clearStorages, seedAuth } from './live-dom.js';

describe('US1/US6 archive-restore UI (FR-002, FR-003, SC-001)', () => {
  beforeEach(() => {
    clearStorages();
    seedAuth();
  });

  it('archiva y restaura empleado, y excluye archivados de selectores operativos', async () => {
    await bootApp();
    document.querySelector('#nav-employees').click();
    document.querySelector('#employee-name').value = 'Luis Archivado';
    document.querySelector('#employee-role').value = 'Analista';
    document.querySelector('#employee-form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    document.querySelector('[data-action="archive-employee"]').click();
    expect(document.querySelector('#employee-list').textContent).not.toContain('Luis Archivado');

    document.querySelector('#employee-show-archived').checked = true;
    document.querySelector('#employee-show-archived').dispatchEvent(new Event('change', { bubbles: true }));
    expect(document.querySelector('#employee-list').textContent).toContain('Luis Archivado');
    expect(document.querySelector('.badge-archived')).toBeTruthy();

    document.querySelector('#nav-interactions').click();
    const options = [...document.querySelectorAll('#interaction-employee-id option')].map((o) => o.textContent);
    expect(options.join(' ')).not.toContain('Luis Archivado');

    document.querySelector('#nav-employees').click();
    document.querySelector('#employee-show-archived').checked = true;
    document.querySelector('#employee-show-archived').dispatchEvent(new Event('change', { bubbles: true }));
    document.querySelector('[data-action="restore-employee"]').click();
    expect(document.querySelector('#employee-show-archived').checked).toBe(true);
    expect(document.querySelector('#employee-list').textContent).toContain('Luis Archivado');

    document.querySelector('#nav-interactions').click();
    const optionsAfter = [...document.querySelectorAll('#interaction-employee-id option')].map((o) => o.textContent);
    expect(optionsAfter.join(' ')).toContain('Luis Archivado');
  });
});
