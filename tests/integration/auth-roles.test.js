import { beforeEach, describe, expect, it, vi } from 'vitest';
import { clearStorages, mountLiveDom } from './live-dom.js';
import {
  addCalendarActivity,
  addCustomer,
  addDocument,
  addEmployee,
  addEntity,
  addTask,
  loadCalendarActivities,
  loadDocuments,
  loadEntities,
  loadInteractions,
  loadTasks
} from '../../src/storage.js';

async function waitFor(predicate, attempts = 50) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    if (predicate()) return;
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  throw new Error('La condición esperada no se cumplió.');
}

async function loadApp(path = '/') {
  window.history.replaceState({}, '', path);
  mountLiveDom();
  vi.resetModules();
  await import('../../src/main.js');
}

function submitLogin(username, password, remember = true) {
  document.querySelector('#login-username').value = username;
  document.querySelector('#login-password').value = password;
  document.querySelector('#login-remember').checked = remember;
  document.querySelector('#login-form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
}

describe('autenticación de roles', () => {
  beforeEach(() => {
    clearStorages();
  });

  it.each([
    ['Jefe', 'Jefe123'],
    ['Empleado', 'Empleado123']
  ])('inicia sesión como %s y recuerda la identidad elegida', async (username, password) => {
    await loadApp();

    submitLogin(username, password);
    await waitFor(() => document.querySelector('#app-shell')?.hidden === false);

    expect(localStorage.getItem('erp.authenticatedUser')).toBe(username);
    expect(document.querySelector('#welcome-title').textContent).toBe(`Bienvenido, ${username}`);
  });

  it('guarda una sesión no recordada solo en sessionStorage y la elimina al cerrar sesión', async () => {
    await loadApp();

    submitLogin('Empleado', 'Empleado123', false);
    await waitFor(() => document.querySelector('#app-shell')?.hidden === false);
    expect(localStorage.getItem('erp.authenticatedUser')).toBeNull();
    expect(sessionStorage.getItem('erp.authenticatedUser')).toBe('Empleado');

    document.querySelector('#logout-button').click();
    await waitFor(() => document.querySelector('#login-view')?.hidden === false);
    expect(sessionStorage.getItem('erp.authenticatedUser')).toBeNull();
  });

  it('rechaza credenciales incorrectas y una sesión legada de Cliente1', async () => {
    await loadApp();

    submitLogin('Jefe', 'Empleado123');
    expect(document.querySelector('#login-view').hidden).toBe(false);
    expect(document.querySelector('#login-error').textContent).toMatch(/incorrectos/i);

    clearStorages();
    localStorage.setItem('erp.authenticatedUser', 'Cliente1');
    await loadApp('/inicio');

    await waitFor(() => document.querySelector('#login-view')?.hidden === false);
    expect(document.querySelector('#app-shell').hidden).toBe(true);
    expect(localStorage.getItem('erp.authenticatedUser')).toBeNull();
  });

  it('limita la navegación y permite a Empleado actualizar solo estados operativos', async () => {
    const entity = addEntity({ name: 'Acme', code: 'A1', email: 'a@a.cl', phone: '912345678', creditLimit: 10 });
    const documentRecord = addDocument({
      entity_id: entity.id,
      series: 'OP',
      folio: 1,
      startDate: '2026-01-01',
      endDate: '2026-02-01',
      quantity: 1,
      subtotal: 100,
      discount: 0,
      taxAmount: 0,
      totalAmount: 100,
      currency: 'CLP',
      status: 'Prospección'
    });
    const customer = addCustomer({ companyName: 'Cliente Uno', contactName: 'Ana', email: 'c@a.cl', phone: '912345679', status: 'Activo' });
    const employee = addEmployee({ name: 'Ejecutiva Uno', role: 'Ventas' });
    const task = addTask({ title: 'Tarea pendiente', dueAt: new Date(Date.now() + 3600000).toISOString(), status: 'pending' }, { ownerUserId: 'Empleado' });
    const activity = addCalendarActivity({
      type: 'meeting',
      title: 'Reunión pendiente',
      startAt: new Date(Date.now() + 3600000).toISOString(),
      endAt: new Date(Date.now() + 7200000).toISOString(),
      status: 'scheduled',
      ownerUserId: 'Empleado'
    });
    await loadApp();
    submitLogin('Empleado', 'Empleado123');
    await waitFor(() => document.querySelector('#app-shell')?.hidden === false);

    expect(document.querySelector('#nav-employees').hidden).toBe(true);
    expect(document.querySelector('#nav-calendar').hidden).toBe(false);
    document.querySelector('#nav-employees').click();
    expect(document.querySelector('#view-employees').hidden).toBe(true);

    document.querySelector('#nav-entities').click();
    expect(document.querySelector('#entity-form').hidden).toBe(true);
    expect(document.querySelector('#entity-list [data-action="edit"]')).toBeNull();
    expect(document.querySelector('#entity-list [data-action="archive-entity"]')).toBeNull();
    document.querySelector('#entity-id').value = entity.id;
    document.querySelector('#name').value = 'No debe editarse';
    document.querySelector('#code').value = 'A1';
    document.querySelector('#email').value = 'a@a.cl';
    document.querySelector('#phone').value = '912345678';
    document.querySelector('#entity-form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    expect(loadEntities().find((record) => record.id === entity.id).name).toBe('Acme');
    for (const id of ['entity-id', 'name', 'code', 'email', 'phone']) document.querySelector(`#${id}`).value = '';

    document.querySelector('#nav-documents').click();
    expect(document.querySelector('#document-form').hidden).toBe(true);
    expect(document.querySelector('#document-list [data-action="edit"]')).toBeNull();
    expect(document.querySelector('#document-list [data-action="delete"]')).toBeNull();
    document.querySelector('#document-id').value = documentRecord.id;
    document.querySelector('#delete-document').click();
    expect(document.querySelector('#delete-confirm-dialog').hidden).toBe(true);
    expect(loadDocuments().some((record) => record.id === documentRecord.id)).toBe(true);
    document.querySelector('#document-id').value = '';

    const statusButton = document.querySelector('#document-list [data-action="update-opportunity-status"]');
    expect(statusButton).toBeTruthy();
    document.querySelector('#document-list [data-action="opportunity-status"]').value = 'Calificación';
    statusButton.click();
    expect(loadDocuments().find((record) => record.id === documentRecord.id).status).toBe('Calificación');

    document.querySelector('#nav-calendar').click();
    expect(loadTasks({ ownerUserId: 'Empleado' })).toHaveLength(1);
    expect(document.querySelector('#view-calendar').hidden).toBe(false);
    expect(document.querySelector('#task-form').hidden).toBe(true);
    expect(document.querySelector('#activity-form').hidden).toBe(true);
    document.querySelector(`[data-task-id="${task.id}"] [data-action="task-mark-completed"]`).click();
    expect(loadTasks({ ownerUserId: 'Empleado', includeCompleted: true }).find((record) => record.id === task.id).status).toBe('completed');
    document.querySelector(`[data-activity-id="${activity.id}"] [data-action="activity-mark-completed"]`).click();
    expect(loadCalendarActivities().find((record) => record.id === activity.id).status).toBe('completed');

    document.querySelector('#nav-interactions').click();
    document.querySelector('#interaction-client-id').value = customer.id;
    document.querySelector('#interaction-employee-id').value = employee.id;
    document.querySelector('#interaction-date').value = '2026-11-20';
    document.querySelector('#interaction-type').value = 'Llamada';
    document.querySelector('#interaction-notes').value = 'Contacto operativo';
    document.querySelector('#interaction-form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    expect(loadInteractions()).toHaveLength(1);
    expect(document.querySelector('#interaction-list [data-action="delete-interaction"]')).toBeNull();
  });

  it('conserva todos los módulos y acciones para Jefe', async () => {
    await loadApp();
    submitLogin('Jefe', 'Jefe123');
    await waitFor(() => document.querySelector('#app-shell')?.hidden === false);

    for (const moduleName of ['dashboard', 'entities', 'documents', 'employees', 'interactions', 'calendar', 'search']) {
      expect(document.querySelector(`[data-module="${moduleName}"]`).hidden).toBe(false);
    }
    expect(document.querySelector('#entity-form').hidden).toBe(false);
    expect(document.querySelector('#document-form').hidden).toBe(false);
    expect(document.querySelector('#task-form').hidden).toBe(false);
    expect(document.querySelector('#activity-new').hidden).toBe(false);
  });
});
