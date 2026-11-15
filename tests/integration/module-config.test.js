import { describe, expect, it } from 'vitest';
import { click, fillForm, getForm, mountApp, submit } from '../helpers.js';
import { loadClients } from '../../src/storage.js';

const customConfig = {
  moduleName: 'Ventas',
  labels: { clientes: 'Cuentas', cliente: 'Cuenta' },
  customFields: [
    {
      target: 'cliente',
      key: 'segmento',
      label: 'Segmento',
      type: 'select',
      options: ['A', 'B'],
      required: true
    }
  ],
  theme: { accentColor: '#ff0000' }
};

describe('US10 - configuración del módulo', () => {
  it('applies custom module name, labels and accent colour without code changes', () => {
    const { root } = mountApp(customConfig);

    expect(root.querySelector('.brand-name').textContent).toBe('Ventas');
    expect(root.querySelector('[data-nav="clients"]').textContent).toContain('Cuentas');
    expect(document.documentElement.style.getPropertyValue('--accent')).toBe('#ff0000');
  });

  it('renders custom fields and enforces their required validation', () => {
    const { root } = mountApp(customConfig);

    click(root, '[data-nav="clients"]');
    click(root, '[data-action="new-client"]');
    const form = getForm(root, 'client');
    expect(form.elements.namedItem('custom__segmento')).toBeTruthy();

    fillForm(form, {
      nombreEmpresa: 'Acme',
      personaContacto: 'Ana',
      correo: 'ana@acme.cl',
      telefono: '123'
    });
    submit(form);

    expect(root.textContent).toMatch(/Segmento es obligatorio/i);
    expect(loadClients()).toHaveLength(0);

    const retry = getForm(root, 'client');
    fillForm(retry, {
      nombreEmpresa: 'Acme',
      personaContacto: 'Ana',
      correo: 'ana@acme.cl',
      telefono: '123',
      custom__segmento: 'B'
    });
    submit(retry);

    expect(loadClients()).toHaveLength(1);
    expect(loadClients()[0].segmento).toBe('B');
  });

  it('keeps default behaviour for custom fields not configured in this module', () => {
    const { root } = mountApp();
    click(root, '[data-nav="clients"]');
    click(root, '[data-action="new-client"]');
    expect(getForm(root, 'client').elements.namedItem('custom__segmento')).toBeNull();
  });

  it('shows configuration errors without breaking the workspace', () => {
    const { root } = mountApp({ moduleName: '', theme: { accentColor: 'no-es-color!' } });

    expect(root.querySelector('.workspace')).toBeTruthy();
    expect(root.textContent).toMatch(/moduleName/i);
    expect(root.textContent).toMatch(/accentColor/i);
  });
});
