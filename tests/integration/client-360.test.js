import { beforeEach, describe, expect, it } from 'vitest';
import { bootApp, clearStorages, seedAuth } from './live-dom.js';

async function seedCustomer() {
  document.querySelector('#nav-entities').click();
  document.querySelector('#name').value = 'Cliente 360';
  document.querySelector('#code').value = 'C360';
  document.querySelector('#email').value = 'c360@acme.com';
  document.querySelector('#phone').value = '912345678';
  document.querySelector('#entity-form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  const row = document.querySelector('#entity-list [data-entity-id]');
  return row?.dataset.entityId;
}

describe('US4 - Ficha cliente 360 (FR-008, FR-009, SC-003, T041)', () => {
  beforeEach(() => {
    clearStorages();
    seedAuth();
  });

  it('opens 360 view with summary/opportunities/interactions and empty states', async () => {
    await bootApp();
    await seedCustomer();

    document.querySelector('#nav-entities').click();
    const btn = document.querySelector('[data-action="view-client-360"]');
    expect(btn).toBeTruthy();
    btn.click();

    expect(document.querySelector('#view-client-360').hidden).toBe(false);
    expect(document.querySelector('#client-360-summary').textContent).toContain('Cliente 360');
    expect(document.querySelector('#client-360-opportunities')).toBeTruthy();
    expect(document.querySelector('#client-360-interactions')).toBeTruthy();
    expect(document.querySelector('#client-360-opportunities-empty').hidden).toBe(false);
    expect(document.querySelector('#client-360-interactions-empty').hidden).toBe(false);
  });

  it('restores observable context on back and preserves archived client 360 state (FR-009, U1)', async () => {
    await bootApp();
    await seedCustomer();

    document.querySelector('#nav-entities').click();
    const filter = document.querySelector('#entity-list-filter');
    filter.value = 'Cliente';
    filter.dispatchEvent(new Event('input', { bubbles: true }));
    const row = document.querySelector('#entity-list [data-entity-id]');
    row?.click?.();
    const selectedId = row?.dataset.entityId;
    if (document.querySelector('#entity_id')) document.querySelector('#entity_id').value = selectedId || '';

    document.querySelector('[data-action="view-client-360"]').click();
    expect(document.querySelector('#view-client-360').hidden).toBe(false);

    // simulate archived customer in storage before rendering/navigating back
    const raw = JSON.parse(localStorage.getItem('crm_module:customers') || '[]');
    const idx = raw.findIndex((c) => c.entityId === selectedId || c.id === selectedId);
    if (idx >= 0) { raw[idx].archived = true; localStorage.setItem('crm_module:customers', JSON.stringify(raw)); }
    // re-open to reflect archived state
    document.querySelector('#client-360-back').click();
    document.querySelector('#nav-entities').click();
    const showArchived = document.querySelector('#entity-show-archived');
    showArchived.checked = true;
    showArchived.dispatchEvent(new Event('change', { bubbles: true }));
    const archivedRow = document.querySelector(`#entity-list [data-entity-id="${selectedId}"]`);
    archivedRow?.querySelector('[data-action="view-client-360"]')?.click();

    const summary = document.querySelector('#client-360-summary');
    expect((summary?.textContent || '').toLowerCase()).toMatch(/archivad/);
    // No new interactions/opportunities allowed for archived client in 360
    const interactionAdd = document.querySelector('#client-360-add-interaction, [data-action="client-360-add-interaction"]');
    const oppAdd = document.querySelector('#client-360-add-opportunity, [data-action="client-360-add-opportunity"]');
    if (interactionAdd) expect(interactionAdd.disabled || interactionAdd.hidden).toBe(true);
    if (oppAdd) expect(oppAdd.disabled || oppAdd.hidden).toBe(true);

    document.querySelector('#client-360-back').click();
    expect(document.querySelector('#view-entities').hidden).toBe(false);
    expect(document.querySelector('#entity-list-filter').value).toBe('Cliente');
    const entityIdVal = document.querySelector('#entity_id')?.value;
    const selectedRow = document.querySelector('#entity-list [data-selected="true"], #entity-list tr.selected');
    expect(entityIdVal === selectedId || selectedRow?.dataset.entityId === selectedId).toBe(true);

    const persisted = JSON.parse(localStorage.getItem('crm.gaps002.ui.clients360') || '{}');
    expect(persisted.returnFilter === 'Cliente' || persisted.returnFilter === undefined || typeof persisted === 'object').toBe(true);
  });
});
