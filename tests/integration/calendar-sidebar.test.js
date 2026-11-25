import { beforeEach, describe, expect, it } from 'vitest';
import { addTask, loadTasks } from '../../src/storage.js';
import { bootApp, seedAuth } from './live-dom.js';

function offsetISO(hours) {
  return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
}

function offsetLocal(hours) {
  return offsetISO(hours).slice(0, 16);
}

describe('Calendario lateral de tareas (US32)', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    seedAuth('Cliente1');
  });

  it('muestra solo tareas del usuario actual con estados de vencimiento', async () => {
    addTask({ title: 'Atrasada', dueAt: offsetISO(-2), status: 'pending' }, { ownerUserId: 'Cliente1' });
    addTask({ title: 'Próxima', dueAt: offsetISO(2), status: 'pending' }, { ownerUserId: 'Cliente1' });
    addTask({ title: 'Futura', dueAt: offsetISO(48), status: 'pending' }, { ownerUserId: 'Cliente1' });
    addTask({ title: 'Ajena', dueAt: offsetISO(1), status: 'pending' }, { ownerUserId: 'Otro' });
    await bootApp();
    document.querySelector('#nav-calendar').click();

    const items = [...document.querySelectorAll('#task-list [data-task-id]')];
    const byTitle = new Map(items.map((item) => [item.querySelector('.task-title')?.textContent, item]));
    expect(byTitle.has('Ajena')).toBe(false);
    expect(byTitle.get('Atrasada')?.querySelector('.task-state')?.textContent).toContain('Atrasada');
    expect(byTitle.get('Próxima')?.querySelector('.task-state')?.textContent).toContain('Próxima a vencer');
    expect(byTitle.get('Futura')?.querySelector('.task-state')?.textContent).toContain('Pendiente');
  });

  it('permite crear, editar y cambiar estado desde el lateral con actualización inmediata', async () => {
    await bootApp();
    document.querySelector('#nav-calendar').click();
    document.querySelector('#task-title').value = 'Nueva tarea';
    document.querySelector('#task-due-at').value = offsetLocal(3);
    document.querySelector('#task-form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    expect(loadTasks({ ownerUserId: 'Cliente1' }).map((task) => task.title)).toContain('Nueva tarea');
    expect(document.querySelector('#task-list').textContent).toContain('Nueva tarea');

    const item = [...document.querySelectorAll('#task-list [data-task-id]')]
      .find((node) => node.textContent.includes('Nueva tarea'));
    item.querySelector('[data-action="task-edit"]').click();
    expect(document.querySelector('#task-id').value).toBeTruthy();
    document.querySelector('#task-title').value = 'Tarea editada';
    document.querySelector('#task-status').value = 'completed';
    document.querySelector('#task-form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    expect(document.querySelector('#task-list').textContent).not.toContain('Tarea editada');
    expect(loadTasks({ ownerUserId: 'Cliente1', includeCompleted: true })[0].status).toBe('completed');
  });

  it('muestra el detalle sin perder el contexto y valida campos obligatorios', async () => {
    addTask({ title: 'Consultar detalle', description: 'Notas de la tarea', dueAt: offsetISO(4), status: 'pending' }, { ownerUserId: 'Cliente1' });
    await bootApp();
    document.querySelector('#nav-calendar').click();
    document.querySelector('#task-list [data-action="task-detail"]').click();
    expect(document.querySelector('#task-detail').hidden).toBe(false);
    expect(document.querySelector('#task-detail').textContent).toContain('Notas de la tarea');
    expect(document.querySelector('#view-calendar').hidden).toBe(false);

    document.querySelector('#task-title').value = '';
    document.querySelector('#task-form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    expect(document.querySelector('#error-task-title').textContent).toBeTruthy();
  });
});
