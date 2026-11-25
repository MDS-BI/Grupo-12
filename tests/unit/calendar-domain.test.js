import { describe, expect, it } from 'vitest';
import {
  ACTIVITY_TYPES,
  CALENDAR_VIEWS,
  classifyTaskDue,
  filterCalendarActivities,
  formatActivityDetail,
  getCalendarViewRange,
  navigateCalendarPeriod,
  sortTasksByDue,
  validateCalendarActivity,
  validateTask
} from '../../src/domain.js';

describe('Calendario - dominio (US32/US33/US34/US35)', () => {
  const now = new Date('2026-11-25T12:00:00.000Z');

  it('clasifica tareas atrasadas, próximas a vencer y futuras con regla determinista', () => {
    expect(classifyTaskDue({ dueAt: '2026-11-25T11:59:00.000Z' }, now)).toBe('overdue');
    expect(classifyTaskDue({ dueAt: '2026-11-25T12:00:00.000Z' }, now)).toBe('dueSoon');
    expect(classifyTaskDue({ dueAt: '2026-11-25T12:30:00.000Z' }, now)).toBe('dueSoon');
    expect(classifyTaskDue({ dueAt: '2026-11-26T12:00:01.000Z' }, now)).toBe('pendingFuture');
    expect(classifyTaskDue({}, now)).toBe('noDue');
    expect(classifyTaskDue({ dueAt: '2026-11-25T11:59:00.000Z', status: 'completed' }, now)).toBe('completed');
  });

  it('ordena tareas por proximidad de vencimiento y excluye las completadas del lateral', () => {
    const tasks = [
      { id: 'c', dueAt: '2026-11-30T10:00:00.000Z' },
      { id: 'a', dueAt: '2026-11-25T13:00:00.000Z' },
      { id: 'done', dueAt: '2026-11-25T12:30:00.000Z', status: 'completed' },
      { id: 'b', dueAt: '2026-11-26T10:00:00.000Z' },
      { id: 'none' }
    ];
    expect(sortTasksByDue(tasks).map((task) => task.id)).toEqual(['a', 'b', 'c', 'none']);
  });

  it('calcula rangos de año, mes y semana y navega conservando la vista', () => {
    const reference = '2026-11-25T12:00:00.000Z';
    const year = getCalendarViewRange({ view: 'year', referenceDate: reference });
    const month = getCalendarViewRange({ view: 'month', referenceDate: reference });
    const week = getCalendarViewRange({ view: 'week', referenceDate: reference });
    expect(year.start.slice(0, 4)).toBe('2026');
    expect(year.end.slice(0, 4)).toBe('2026');
    expect(month.start.slice(0, 7)).toBe('2026-11');
    expect(week.start <= reference).toBe(true);
    expect(CALENDAR_VIEWS).toEqual(['year', 'month', 'week']);
    expect(navigateCalendarPeriod({ view: 'month', referenceDate: reference, direction: 1 }).slice(0, 7)).toBe('2026-12');
    expect(navigateCalendarPeriod({ view: 'year', referenceDate: reference, direction: -1 }).slice(0, 4)).toBe('2025');
    expect(navigateCalendarPeriod({ view: 'week', referenceDate: reference, direction: 1 }) > reference).toBe(true);
  });

  it('filtra actividades por rango y por alcance personal/equipo', () => {
    const activities = [
      { id: 'a', ownerUserId: 'u1', startAt: '2026-11-25T09:00:00.000Z', endAt: '2026-11-25T10:00:00.000Z' },
      { id: 'b', ownerUserId: 'u2', participantUserIds: ['u1'], startAt: '2026-11-26T09:00:00.000Z', endAt: '2026-11-26T10:00:00.000Z' },
      { id: 'c', ownerUserId: 'u2', startAt: '2026-12-25T09:00:00.000Z', endAt: '2026-12-25T10:00:00.000Z' }
    ];
    const range = { start: '2026-11-01T00:00:00.000Z', end: '2026-11-30T23:59:59.999Z' };
    expect(filterCalendarActivities(activities, { ...range, userId: 'u1', team: false }).map((a) => a.id)).toEqual(['a', 'b']);
    expect(filterCalendarActivities(activities, { ...range, userId: 'u3', team: true }).map((a) => a.id)).toEqual(['a', 'b']);
    expect(filterCalendarActivities(activities, { view: 'month', referenceDate: '2026-11-25T12:00:00.000Z', userId: 'u1' }).map((a) => a.id)).toEqual(['a', 'b']);
  });

  it('valida tareas y actividades con reglas obligatorias y rango temporal', () => {
    expect(validateTask({ title: 'Llamar', ownerUserId: 'u1' }).valid).toBe(true);
    expect(validateTask({ ownerUserId: 'u1' }).errors.title).toBeTruthy();
    expect(ACTIVITY_TYPES).toContain('meeting');
    expect(validateCalendarActivity({ title: 'Reunión', type: 'meeting', startAt: '2026-11-26T10:00', endAt: '2026-11-26T11:00', status: 'scheduled', ownerUserId: 'u1' }).valid).toBe(true);
    expect(validateCalendarActivity({ title: 'Reunión', type: 'meeting', startAt: '2026-11-26T11:00', endAt: '2026-11-26T10:00', status: 'scheduled', ownerUserId: 'u1' }).errors.endAt).toBeTruthy();
    expect(validateCalendarActivity({ title: '', type: 'event', startAt: '2026-11-26T10:00', endAt: '2026-11-26T11:00', status: 'scheduled', ownerUserId: 'u1' }).errors.title).toBeTruthy();
  });

  it('formatea el detalle con relaciones legibles y estado sin relaciones', () => {
    const activity = {
      type: 'meeting', title: 'Reunión', startAt: '2026-11-26T10:00', endAt: '2026-11-26T11:00',
      status: 'scheduled', relatedRecords: [{ type: 'customer', id: 'c1', label: 'Acme' }]
    };
    const withRelation = formatActivityDetail(activity, { customers: [{ id: 'c1', companyName: 'Acme' }], opportunities: [] });
    expect(withRelation.relations).toHaveLength(1);
    expect(withRelation.relations[0].label).toBe('Acme');
    expect(withRelation.hasRelations).toBe(true);
    const without = formatActivityDetail({ ...activity, relatedRecords: [] }, {});
    expect(without.hasRelations).toBe(false);
    expect(without.emptyRelationsMessage).toBeTruthy();
  });
});
