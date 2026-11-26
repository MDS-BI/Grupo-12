import { beforeEach, describe, expect, it, vi } from 'vitest';
import { addEntity, loadEntities } from '../../src/storage.js';
import { clearStorages, mountLiveDom } from './live-dom.js';

async function waitFor(predicate, attempts = 50) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    if (predicate()) return;
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  throw new Error('La condición esperada no se cumplió.');
}

describe('preservación de datos al cambiar de rol', () => {
  beforeEach(() => {
    clearStorages();
  });

  it('conserva claves y registros CRM durante login, logout y cambio de usuario', async () => {
    const entity = addEntity({
      name: 'Datos persistentes',
      code: 'P-001',
      email: 'persistente@example.cl',
      phone: '912345678',
      creditLimit: 1000
    });
    localStorage.setItem('crm.theme', 'Oscuro');
    const crmDataBefore = Object.fromEntries(
      Object.keys(localStorage)
        .filter((key) => key.startsWith('crm_module:') || key.startsWith('erp_base_module:'))
        .sort()
        .map((key) => [key, localStorage.getItem(key)])
    );

    window.history.replaceState({}, '', '/');
    mountLiveDom();
    vi.resetModules();
    await import('../../src/main.js');

    document.querySelector('#login-username').value = 'Jefe';
    document.querySelector('#login-password').value = 'Jefe123';
    document.querySelector('#login-form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await waitFor(() => document.querySelector('#app-shell')?.hidden === false);
    document.querySelector('#logout-button').click();
    await waitFor(() => document.querySelector('#login-view')?.hidden === false);

    document.querySelector('#login-username').value = 'Empleado';
    document.querySelector('#login-password').value = 'Empleado123';
    document.querySelector('#login-form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await waitFor(() => document.querySelector('#app-shell')?.hidden === false);
    expect(document.querySelector('#nav-employees').hidden).toBe(true);
    expect(document.querySelector('#welcome-title').textContent).toBe('Bienvenido, Empleado');

    const crmDataAfter = Object.fromEntries(
      Object.keys(localStorage)
        .filter((key) => key.startsWith('crm_module:') || key.startsWith('erp_base_module:'))
        .sort()
        .map((key) => [key, localStorage.getItem(key)])
    );
    expect(crmDataAfter).toEqual(crmDataBefore);
    expect(loadEntities().find((record) => record.id === entity.id)?.name).toBe('Datos persistentes');
    expect(localStorage.getItem('crm.theme')).toBe('Oscuro');
  });
});
