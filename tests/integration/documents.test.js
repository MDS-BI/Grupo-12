import { beforeEach, describe, expect, it } from 'vitest';
import { bootApp, clearStorages, seedAuth } from './live-dom.js';
import { addEntity, addDocument } from '../../src/storage.js';

describe('US21 - Listado de oportunidades', () => {
  beforeEach(() => { clearStorages(); seedAuth(); });

  it('T170: renderiza filas con acciones Editar/Eliminar y sincroniza con formulario', async () => {
    const ent = addEntity({ name: 'Acme', code: 'A1', email: 'a@a.cl', phone: '912345678', creditLimit: 10 });
    const d1 = addDocument({ entity_id: ent.id, series: 'OP', folio: 1, startDate: '2026-01-01', endDate: '2026-02-01', quantity: 1, subtotal: 100, discount: 0, taxAmount: 0, totalAmount: 100, currency: 'CLP', status: 'Propuesta' });
    addDocument({ entity_id: ent.id, series: 'OP', folio: 2, startDate: '2026-01-01', endDate: '2026-02-01', quantity: 1, subtotal: 200, discount: 0, taxAmount: 0, totalAmount: 200, currency: 'CLP', status: 'Negociación' });
    await bootApp();
    document.querySelector('#nav-documents').click();

    const rows = document.querySelectorAll('#document-list [data-document-id]');
    expect(rows.length).toBeGreaterThanOrEqual(2);
    expect(document.querySelector('#document-list').textContent).toContain('OP');

    const editBtn = document.querySelector(`#document-list [data-action="edit"][data-document-id="${d1.id}"]`);
    expect(editBtn).toBeTruthy();
    editBtn.click();
    expect(document.querySelector('#document-id').value).toBe(d1.id);
    expect(document.querySelector('#series').value).toBe('OP');
    expect(document.querySelector('#edit-document').value).toBe(d1.id);

    const delBtn = document.querySelector(`#document-list [data-action="delete"][data-document-id="${d1.id}"]`);
    delBtn.click();
    document.querySelector('#delete-confirm-accept').click();
    expect(document.querySelector(`#document-list [data-document-id="${d1.id}"]`)).toBeNull();
    expect(document.querySelector('#document-id').value).toBe('');
  });
});
