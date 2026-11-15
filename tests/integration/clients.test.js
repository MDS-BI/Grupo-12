import { describe, expect, it } from 'vitest';
import { click, createClient, fillForm, getForm, mountApp, submit } from '../helpers.js';
import { loadClients } from '../../src/storage.js';

const validClient = {
  nombreEmpresa: 'Acme',
  personaContacto: 'Ana Pérez',
  correo: 'ana@acme.cl',
  telefono: '+56911111111'
};

describe('US1 - gestionar clientes', () => {
  it('creates a client with default Posible state and lists it', () => {
    const { root } = mountApp();
    createClient(root, validClient);

    expect(root.textContent).toContain('Acme');
    expect(loadClients()).toHaveLength(1);
    expect(loadClients()[0].estado).toBe('Posible');
  });

  it('edits an existing client and persists the change', () => {
    const { root } = mountApp();
    createClient(root, validClient);

    click(root, '[data-action="edit-client"]');
    const form = getForm(root, 'client');
    expect(form.elements.namedItem('nombreEmpresa').value).toBe('Acme');
    fillForm(form, { estado: 'Activo' });
    submit(form);

    expect(loadClients()[0].estado).toBe('Activo');
  });

  it('shows validation errors for missing required fields', () => {
    const { root } = mountApp();
    click(root, '[data-nav="clients"]');
    click(root, '[data-action="new-client"]');
    const form = getForm(root, 'client');
    submit(form);

    expect(root.textContent).toMatch(/obligatorio/i);
    expect(loadClients()).toHaveLength(0);
  });

  it('rejects duplicate emails regardless of letter case', () => {
    const { root } = mountApp();
    createClient(root, validClient);

    click(root, '[data-action="new-client"]');
    const form = getForm(root, 'client');
    fillForm(form, { ...validClient, nombreEmpresa: 'Otra', correo: 'ANA@ACME.CL' });
    submit(form);

    expect(root.textContent).toMatch(/ya está en uso/i);
    expect(loadClients()).toHaveLength(1);
  });

  it('rejects an invalid email format', () => {
    const { root } = mountApp();
    createClient(root, { ...validClient, correo: 'correo-invalido' });
    expect(root.textContent).toMatch(/formato válido/i);
    expect(loadClients()).toHaveLength(0);
  });
});
