import { beforeEach, describe, expect, it } from 'vitest';
import { bootApp, clearStorages, seedAuth } from './live-dom.js';
import { addEntity } from '../../src/storage.js';

describe('US21 - Listado de clientes', () => {
  beforeEach(() => { clearStorages(); seedAuth(); });

  it('T169: renderiza filas con acciones Editar/Eliminar y sincroniza con formulario', async () => {
    const e1 = addEntity({ name: 'Acme', code: 'A1', email: 'a@a.cl', phone: '912345678', creditLimit: 10 });
    addEntity({ name: 'Beta', code: 'B1', email: 'b@b.cl', phone: '923456789', creditLimit: 20 });
    await bootApp();
    document.querySelector('#nav-entities').click();

    const rows = document.querySelectorAll('#entity-list [data-entity-id]');
    expect(rows.length).toBeGreaterThanOrEqual(2);
    expect(document.querySelector('#entity-list').textContent).toContain('Acme');

    const editBtn = document.querySelector(`#entity-list [data-action="edit"][data-entity-id="${e1.id}"]`);
    expect(editBtn).toBeTruthy();
    editBtn.click();
    expect(document.querySelector('#entity-id').value).toBe(e1.id);
    expect(document.querySelector('#name').value).toBe('Acme');
    expect(document.querySelector('#edit-entity').value).toBe(e1.id);

    const delBtn = document.querySelector(`#entity-list [data-action="archive-entity"][data-entity-id="${e1.id}"], #entity-list [data-action="delete"][data-entity-id="${e1.id}"]`);
    delBtn.click();
    const confirm = document.querySelector('#delete-confirm-accept, #confirm-dialog-confirm');
    if (confirm) confirm.click();
    expect(document.querySelector(`#entity-list [data-entity-id="${e1.id}"]`)).toBeNull();
    // 002: archive/restore replaces hard-delete; archived excluded by default
    document.querySelector('#entity-show-archived').checked = true;
    document.querySelector('#entity-show-archived').dispatchEvent(new Event('change', { bubbles: true }));
    expect(document.querySelector(`#entity-list [data-entity-id="${e1.id}"]`)).toBeTruthy();
    expect(document.querySelector('#entity-id').value).toBe('');
  });
});
