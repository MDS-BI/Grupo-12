import { beforeEach, describe, expect, it } from 'vitest';
import {
  addCalendarActivity,
  addCustomer,
  addEmployee,
  addTask,
  deleteCalendarActivity,
  getCRMStorageErrors,
  loadCalendarActivities,
  loadInteractions,
  loadTasks,
  resetCorruptedCRMStorage,
  updateCalendarActivity,
  updateTask
} from '../../src/storage.js';

describe('Calendario - almacenamiento (US32/US33/US34)', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  function seedCRM() {
    const customer = addCustomer({ companyName: 'Acme', contactName: 'Ana', email: 'ana@acme.cl', phone: '+56911111111' });
    const employee = addEmployee({ name: 'Vendedor', role: 'Ejecutivo' });
    return { customer, employee };
  }

  it('persiste tareas con alcance por propietario y validación', () => {
    const task = addTask({ title: 'Tarea propia', status: 'pending', ownerUserId: 'u1' }, { ownerUserId: 'u1' });
    addTask({ title: 'Tarea ajena', status: 'pending', ownerUserId: 'u2' }, { ownerUserId: 'u2' });
    expect(loadTasks({ ownerUserId: 'u1' }).map((t) => t.id)).toEqual([task.id]);
    expect(() => addTask({ title: '', ownerUserId: 'u1' }, { ownerUserId: 'u1' })).toThrow();
    expect(updateTask(task.id, { title: 'Editada' }, { ownerUserId: 'u2' })).toBeNull();
    expect(loadTasks({ ownerUserId: 'u1' })[0].title).toBe('Tarea propia');
    expect(updateTask(task.id, { status: 'completed' }, { ownerUserId: 'u1' }).status).toBe('completed');
  });

  it('filtra actividades por rango y equipo', () => {
    addCalendarActivity({ type: 'event', title: 'Propia', startAt: '2026-11-10T10:00', endAt: '2026-11-10T11:00', status: 'scheduled', ownerUserId: 'u1' });
    addCalendarActivity({ type: 'event', title: 'Equipo', startAt: '2026-11-11T10:00', endAt: '2026-11-11T11:00', status: 'scheduled', ownerUserId: 'u2', participantUserIds: ['u1'] });
    addCalendarActivity({ type: 'event', title: 'Otra', startAt: '2026-12-11T10:00', endAt: '2026-12-11T11:00', status: 'scheduled', ownerUserId: 'u2' });
    expect(loadCalendarActivities({ from: '2026-11-01', to: '2026-11-30', userId: 'u1' }).map((a) => a.title)).toEqual(['Propia', 'Equipo']);
    expect(loadCalendarActivities({ from: '2026-11-01', to: '2026-11-30', userId: 'u3', team: true })).toHaveLength(2);
  });

  it('sincroniza llamadas/reuniones con interacciones planificadas y no crea interacción para eventos', () => {
    const { customer, employee } = seedCRM();
    const base = {
      clientId: customer.id, employeeId: employee.id,
      relatedRecords: [{ type: 'customer', id: customer.id, label: 'Acme' }],
      startAt: '2026-11-26T10:00', endAt: '2026-11-26T11:00', status: 'scheduled', ownerUserId: employee.id
    };
    const call = addCalendarActivity({ ...base, type: 'call', title: 'Llamada planeada' });
    expect(loadInteractions()).toHaveLength(1);
    expect(loadInteractions()[0].type).toBe('Llamada');
    expect(loadInteractions()[0].date).toBe('2026-11-26');
    expect(loadInteractions()[0].description).not.toContain('_resultado');

    updateCalendarActivity(call.id, { startAt: '2026-11-27T10:00', endAt: '2026-11-27T11:00' });
    expect(loadInteractions()[0].date).toBe('2026-11-27');

    addCalendarActivity({ ...base, type: 'event', title: 'Evento sin interacción' });
    expect(loadInteractions()).toHaveLength(1);

    deleteCalendarActivity(call.id);
    expect(loadInteractions()).toHaveLength(0);
  });

  it('incluye las claves nuevas en la detección y recuperación FR-072', () => {
    localStorage.setItem('crm_module:tasks', '{json roto');
    localStorage.setItem('crm_module:calendarActivities', '{"no":"array"}');
    const errors = getCRMStorageErrors();
    expect(errors.map((e) => e.key)).toContain('crm_module:tasks');
    expect(errors.map((e) => e.key)).toContain('crm_module:calendarActivities');
    resetCorruptedCRMStorage(errors);
    expect(getCRMStorageErrors()).toHaveLength(0);
    expect(JSON.parse(localStorage.getItem('crm_module:tasks'))).toEqual([]);
  });
});
