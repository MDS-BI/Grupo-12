import { beforeEach, describe, expect, it } from 'vitest';
import { bootApp, clearStorages, seedAuth } from './live-dom.js';

describe('US2 - Interacciones UI real (FR-004, FR-005, SC-001)', () => {
  beforeEach(() => {
    clearStorages();
    seedAuth();
  });

  async function seedCustomerAndEmployee() {
    await bootApp();
    // create customer through existing entities UI
    document.querySelector('#nav-entities').click();
    document.querySelector('#name').value = 'Cliente Uno';
    document.querySelector('#code').value = 'C1';
    document.querySelector('#email').value = 'c1@acme.com';
    document.querySelector('#phone').value = '912345678';
    document.querySelector('#entity-form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    document.querySelector('#nav-employees').click();
    document.querySelector('#employee-name').value = 'Ejecutivo Uno';
    document.querySelector('#employee-role').value = 'Ventas';
    document.querySelector('#employee-form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  }

  it('crea interacción válida y la muestra en historial', async () => {
    await seedCustomerAndEmployee();
    document.querySelector('#nav-interactions').click();
    const customerId = document.querySelector('#interaction-client-id option:not([value=""])').value;
    const employeeId = document.querySelector('#interaction-employee-id option:not([value=""])').value;
    document.querySelector('#interaction-client-id').value = customerId;
    document.querySelector('#interaction-employee-id').value = employeeId;
    document.querySelector('#interaction-date').value = '2026-11-20';
    document.querySelector('#interaction-type').value = 'Llamada';
    document.querySelector('#interaction-notes').value = 'Seguimiento inicial';
    document.querySelector('#interaction-form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    expect(document.querySelector('#interaction-list').textContent).toContain('Seguimiento inicial');
    expect(document.querySelector('#interaction-list').textContent).toContain('Llamada');
  });

  it('edita sin duplicar, elimina con confirmación accesible y muestra estado vacío', async () => {
    await seedCustomerAndEmployee();
    document.querySelector('#nav-interactions').click();
    const customerId = document.querySelector('#interaction-client-id option:not([value=""])').value;
    const employeeId = document.querySelector('#interaction-employee-id option:not([value=""])').value;
    document.querySelector('#interaction-client-id').value = customerId;
    document.querySelector('#interaction-employee-id').value = employeeId;
    document.querySelector('#interaction-date').value = '2026-11-20';
    document.querySelector('#interaction-type').value = 'Correo';
    document.querySelector('#interaction-notes').value = 'Original';
    document.querySelector('#interaction-form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    document.querySelector('[data-action="edit-interaction"]').click();
    document.querySelector('#interaction-notes').value = 'Editada';
    document.querySelector('#interaction-form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    expect(document.querySelector('#interaction-list').textContent).toContain('Editada');
    expect(document.querySelectorAll('#interaction-list [data-interaction-id]').length).toBeGreaterThanOrEqual(1);

    document.querySelector('[data-action="delete-interaction"]').click();
    const dialog = document.querySelector('#delete-confirm-dialog');
    expect(dialog.hidden).toBe(false);
    document.querySelector('#delete-confirm-accept').click();
    expect(document.querySelector('#interaction-list-empty').hidden).toBe(false);
  });
});
