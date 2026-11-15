import { describe, expect, it } from 'vitest';
import { click, getForm, mountApp } from '../helpers.js';
import { addClient, addEmployee, addOpportunity } from '../../src/storage.js';
import { addDays, toDateOnly } from '../../src/domain.js';

function statValue(root, key) {
  return root.querySelector(`[data-stat="${key}"] .stat-value`)?.textContent.trim() ?? '';
}

describe('US7 - panel de indicadores', () => {
  it('shows zeroed indicators and quick actions with no data', () => {
    const { root } = mountApp();

    expect(statValue(root, 'activeClients')).toBe('0');
    expect(statValue(root, 'openOpportunities')).toBe('0');
    expect(statValue(root, 'upcomingCloses')).toBe('0');
    expect(root.querySelectorAll('.quick-action')).toHaveLength(4);
  });

  it('shows at least four quick-action buttons covering key CRM tasks', async () => {
    await bootWith(undefined);
    expect(qs('action-new-entity-title').textContent).toBe('Nuevo Cliente');
    expect(qs('action-new-document-title').textContent).toBe('Nueva Oportunidad');
    expect(qs('action-open-entities-title').textContent).toBe('Clientes');
    expect(qs('action-find-title').textContent).toBe('Buscar registros');
  });

  it('uses quick actions to open the creation forms', () => {
    const { root } = mountApp();
    click(root, '[data-action="new-client"]');
    expect(getForm(root, 'client')).toBeTruthy();
  });

  it('uses the clients quick action to reach the list', () => {
    const { root } = mountApp();
    click(root, '[data-action="nav-clients"]');
    expect(root.querySelector('[data-action="new-client"]')).toBeTruthy();
    expect(root.textContent).toContain('Clientes');
  });
});
