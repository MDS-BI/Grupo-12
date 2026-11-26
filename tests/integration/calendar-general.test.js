import { beforeEach, describe, expect, it } from 'vitest';
import { addCalendarActivity, addCustomer } from '../../src/storage.js';
import { bootApp, seedAuth } from './live-dom.js';

function offsetISO(hours) {
  return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
}

function seedActivities() {
  return addCalendarActivity({
    type: 'meeting',
    title: 'Reunión personal',
    description: 'Revisión comercial',
    startAt: offsetISO(2),
    endAt: offsetISO(3),
    status: 'scheduled',
    ownerUserId: 'Jefe'
  });
}

describe('Calendario general y detalle (US33/US35)', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    seedAuth('Jefe');
  });

  it('cambia entre vistas anual, mensual y semanal conservando el período', async () => {
    seedActivities();
    await bootApp();
    document.querySelector('#nav-calendar').click();

    expect(document.querySelector('#calendar-view-month').getAttribute('aria-pressed')).toBe('true');
    document.querySelector('#calendar-view-week').click();
    expect(document.querySelector('#calendar-view-week').getAttribute('aria-pressed')).toBe('true');
    expect(document.querySelector('#calendar-grid').textContent).toContain('Reunión personal');

    const before = document.querySelector('#calendar-period-label').textContent;
    document.querySelector('#calendar-next').click();
    expect(document.querySelector('#calendar-period-label').textContent).not.toBe(before);
    expect(document.querySelector('#calendar-view-week').getAttribute('aria-pressed')).toBe('true');

    document.querySelector('#calendar-view-year').click();
    expect(document.querySelector('#calendar-period-label').textContent).toContain(String(new Date().getUTCFullYear()));
  });

  it('muestra por defecto actividades personales y permite el filtro de equipo', async () => {
    seedActivities();
    addCalendarActivity({
      type: 'event', title: 'Evento del equipo', startAt: offsetISO(4), endAt: offsetISO(5),
      status: 'scheduled', ownerUserId: 'Otro'
    });
    await bootApp();
    document.querySelector('#nav-calendar').click();
    expect(document.querySelector('#calendar-grid').textContent).not.toContain('Evento del equipo');

    document.querySelector('#calendar-team-filter').checked = true;
    document.querySelector('#calendar-team-filter').dispatchEvent(new Event('change', { bubbles: true }));
    expect(document.querySelector('#calendar-grid').textContent).toContain('Evento del equipo');
  });

  it('abre el detalle con relaciones legibles y estado vacío sin relaciones', async () => {
    const customer = addCustomer({ companyName: 'Acme', contactName: 'Ana', email: 'ana@acme.cl', phone: '+56911111111' });
    const activity = addCalendarActivity({
      type: 'call', title: 'Llamada de seguimiento', startAt: offsetISO(6), endAt: offsetISO(7),
      status: 'scheduled', ownerUserId: 'Jefe',
      clientId: customer.id,
      relatedRecords: [{ type: 'customer', id: customer.id, label: 'Acme' }]
    });
    const single = addCalendarActivity({
      type: 'event', title: 'Sin relaciones', startAt: offsetISO(8), endAt: offsetISO(9),
      status: 'scheduled', ownerUserId: 'Jefe'
    });
    await bootApp();
    document.querySelector('#nav-calendar').click();
    document.querySelector(`#activity-list [data-action="activity-detail"][data-activity-id="${activity.id}"]`).click();
    expect(document.querySelector('#activity-detail').hidden).toBe(false);
    expect(document.querySelector('#activity-detail').textContent).toContain('Acme');
    expect(document.querySelector('#activity-detail').textContent).toContain('Llamada de seguimiento');

    document.querySelector(`#activity-list [data-action="activity-detail"][data-activity-id="${single.id}"]`).click();
    expect(document.querySelector('#activity-detail').textContent).toContain('no tiene relaciones');
  });
});
