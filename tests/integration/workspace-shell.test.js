import { describe, expect, it } from 'vitest';
import { click, createClient, mountApp } from '../helpers.js';
import { loadClients } from '../../src/storage.js';

describe('US3 - shell del workspace', () => {
  it('renders brand, navigation and the main view', () => {
    const { root } = mountApp();
    expect(root.querySelector('.topbar .brand-logo')).toBeTruthy();
    expect(root.querySelector('.sidebar')).toBeTruthy();
    expect(root.querySelector('main#view')).toBeTruthy();
    expect(root.querySelectorAll('[data-nav]')).toHaveLength(6);
  });

  it('highlights only the active section', () => {
    const { root } = mountApp();
    expect(root.querySelector('[data-nav="dashboard"]').getAttribute('aria-current')).toBe('page');
    expect(root.querySelector('[data-nav="clients"]').getAttribute('aria-current')).toBeNull();

    click(root, '[data-nav="clients"]');
    expect(root.querySelector('[data-nav="clients"]').getAttribute('aria-current')).toBe('page');
    expect(root.querySelector('[data-nav="dashboard"]').getAttribute('aria-current')).toBeNull();
  });

  it('keeps the navigation available after creating records', () => {
    const { root } = mountApp();
    createClient(root, {
      nombreEmpresa: 'Acme',
      personaContacto: 'Ana',
      correo: 'ana@acme.cl',
      telefono: '123'
    });

    expect(root.querySelector('.sidebar')).toBeTruthy();
    expect(loadClients()).toHaveLength(1);

    click(root, '[data-nav="employees"]');
    expect(root.querySelector('[data-nav="employees"]').getAttribute('aria-current')).toBe('page');
    expect(loadClients()).toHaveLength(1);
  });
});
