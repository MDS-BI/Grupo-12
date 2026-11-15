import { describe, expect, it } from 'vitest';
import { click, fillForm, getForm, mountApp, submit } from '../helpers.js';
import { addClient, addEmployee, loadInteractions } from '../../src/storage.js';

function seed() {
  const client = addClient({
    nombreEmpresa: 'Acme',
    personaContacto: 'Ana',
    correo: 'ana@acme.cl',
    telefono: '123'
  });
  const employee = addEmployee({ nombre: 'Luis Soto', cargo: 'Ejecutivo' });
  return { client, employee };
}

function newInteraction(root, values) {
  click(root, '[data-nav="interactions"]');
  click(root, '[data-action="new-interaction"]');
  const form = getForm(root, 'interaction');
  fillForm(form, values);
  submit(form);
}

describe('US5 - registrar interacciones', () => {
  it('registers a Llamada with an optional description', () => {
    const { client, employee } = seed();
    const { root } = mountApp();

    newInteraction(root, {
      clienteId: client.id,
      empleadoId: employee.id,
      fecha: '2026-03-01',
      tipo: 'Llamada',
      descripcion: 'Primer contacto'
    });

    const interactions = loadInteractions();
    expect(interactions).toHaveLength(1);
    expect(interactions[0].tipo).toBe('Llamada');
    expect(root.textContent).toContain('Primer contacto');
  });

  it('offers only Llamada, Correo and Reunión', () => {
    seed();
    const { root } = mountApp();
    click(root, '[data-nav="interactions"]');
    click(root, '[data-action="new-interaction"]');
    const options = Array.from(
      getForm(root, 'interaction').elements.namedItem('tipo').options
    ).map((option) => option.value);
    expect(options).toEqual(['', 'Llamada', 'Correo', 'Reunión']);
  });

  it('shows validation errors for missing data', () => {
    seed();
    const { root } = mountApp();

    newInteraction(root, {});

    expect(root.textContent).toMatch(/obligatorio/i);
    expect(loadInteractions()).toHaveLength(0);
  });

  it('edits and deletes an interaction', () => {
    const { client, employee } = seed();
    const { root } = mountApp();
    newInteraction(root, {
      clienteId: client.id,
      empleadoId: employee.id,
      fecha: '2026-03-01',
      tipo: 'Correo'
    });

    click(root, '[data-action="edit-interaction"]');
    fillForm(getForm(root, 'interaction'), { tipo: 'Reunión' });
    submit(getForm(root, 'interaction'));
    expect(loadInteractions()[0].tipo).toBe('Reunión');

    click(root, '[data-action="delete-interaction"]');
    expect(loadInteractions()).toHaveLength(0);
  });
});
