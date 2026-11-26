import { beforeEach, describe, expect, it } from 'vitest';
import { addCustomer, addEmployee, addInteraction, loadInteractions } from '../../src/storage.js';
import { bootApp, seedAuth } from './live-dom.js';

function offsetLocal(hours) {
  return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString().slice(0, 16);
}

function seedCRM() {
  const customer = addCustomer({ companyName: 'Acme', contactName: 'Ana', email: 'ana@acme.cl', phone: '+56911111111' });
  const employee = addEmployee({ name: 'Vendedor', role: 'Ejecutivo' });
  return { customer, employee };
}

function fillActivityForm({ type, title, startHours, endHours, customerId, employeeId }) {
  document.querySelector('#activity-type').value = type;
  document.querySelector('#activity-title').value = title;
  document.querySelector('#activity-start-at').value = offsetLocal(startHours);
  document.querySelector('#activity-end-at').value = offsetLocal(endHours);
  if (customerId) document.querySelector('#activity-client-id').value = customerId;
  if (employeeId) document.querySelector('#activity-employee-id').value = employeeId;
  document.querySelector('#activity-form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
}

describe('Sincronización calendario ↔ Interacciones CRM (US34)', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    seedAuth('Jefe');
  });

  it('crea una interacción planificada al registrar una llamada desde el calendario', async () => {
    const { customer, employee } = seedCRM();
    await bootApp();
    document.querySelector('#nav-calendar').click();
    fillActivityForm({ type: 'call', title: 'Llamada planeada', startHours: 2, endHours: 3, customerId: customer.id, employeeId: employee.id });

    const interactions = loadInteractions();
    expect(interactions).toHaveLength(1);
    expect(interactions[0].type).toBe('Llamada');
    expect(interactions[0].description).toContain('Llamada planeada');
    expect(document.querySelector('#activity-list').textContent).toContain('Llamada planeada');
  });

  it('actualiza y elimina la interacción vinculada con la actividad', async () => {
    const { customer, employee } = seedCRM();
    await bootApp();
    document.querySelector('#nav-calendar').click();
    fillActivityForm({ type: 'meeting', title: 'Reunión planeada', startHours: 2, endHours: 3, customerId: customer.id, employeeId: employee.id });
    expect(loadInteractions()[0].type).toBe('Reunión');

    document.querySelector('#activity-list [data-action="activity-edit"]').click();
    document.querySelector('#activity-start-at').value = offsetLocal(26);
    document.querySelector('#activity-end-at').value = offsetLocal(27);
    document.querySelector('#activity-form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    expect(loadInteractions()[0].date).toBe(new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString().slice(0, 10));

    document.querySelector('#activity-list [data-action="activity-delete"]').click();
    expect(document.querySelector('#delete-confirm-dialog').hidden).toBe(false);
    document.querySelector('#delete-confirm-accept').click();
    expect(loadInteractions()).toHaveLength(0);
  });

  it('no crea interacciones para eventos y respeta la validación de campos obligatorios', async () => {
    seedCRM();
    await bootApp();
    document.querySelector('#nav-calendar').click();
    document.querySelector('#activity-form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    expect(document.querySelector('#error-activity-title').textContent).toBeTruthy();
    expect(loadInteractions()).toHaveLength(0);

    fillActivityForm({ type: 'event', title: 'Evento comercial', startHours: 2, endHours: 3 });
    expect(loadInteractions()).toHaveLength(0);
    expect(loadInteractions()).toEqual([]);
    expect(addInteraction).toBeTypeOf('function');
  });
});
