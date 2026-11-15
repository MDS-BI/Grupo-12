import { describe, expect, it } from 'vitest';
import { click, fillForm, getForm, mountApp, submit } from '../helpers.js';
import {
  addClient,
  addEmployee,
  archiveClient,
  loadOpportunities
} from '../../src/storage.js';

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

function newOpportunity(root, values) {
  click(root, '[data-nav="opportunities"]');
  click(root, '[data-action="new-opportunity"]');
  const form = getForm(root, 'opportunity');
  fillForm(form, values);
  submit(form);
}

const baseOpportunity = {
  montoEstimado: 1500,
  fechaEstimadaCierre: '2026-04-01',
  descripcion: 'Renovación anual'
};

describe('US4 - gestionar oportunidades', () => {
  it('creates an opportunity starting in Evaluación', () => {
    const { client, employee } = seed();
    const { root } = mountApp();

    newOpportunity(root, {
      ...baseOpportunity,
      clienteId: client.id,
      empleadoId: employee.id
    });

    const opportunities = loadOpportunities();
    expect(opportunities).toHaveLength(1);
    expect(opportunities[0].etapa).toBe('Evaluación');
    expect(root.textContent).toContain('Acme');
    expect(root.textContent).toContain('Luis Soto');
  });

  it('shows validation errors and does not store invalid data', () => {
    seed();
    const { root } = mountApp();

    newOpportunity(root, { montoEstimado: -1, fechaEstimadaCierre: '2026-02-31' });

    expect(root.textContent).toMatch(/Debe seleccionar un cliente/i);
    expect(root.textContent).toMatch(/mayor o igual a cero/i);
    expect(loadOpportunities()).toHaveLength(0);
  });

  it('advances stage by stage until Ganado', () => {
    const { client, employee } = seed();
    const { root } = mountApp();
    newOpportunity(root, { ...baseOpportunity, clienteId: client.id, empleadoId: employee.id });

    click(root, '[data-action="edit-opportunity"]');
    fillForm(getForm(root, 'opportunity'), { etapa: 'Propuesta' });
    submit(getForm(root, 'opportunity'));
    expect(loadOpportunities()[0].etapa).toBe('Propuesta');

    click(root, '[data-action="edit-opportunity"]');
    fillForm(getForm(root, 'opportunity'), { etapa: 'Negociación' });
    submit(getForm(root, 'opportunity'));
    expect(loadOpportunities()[0].etapa).toBe('Negociación');

    click(root, '[data-action="edit-opportunity"]');
    fillForm(getForm(root, 'opportunity'), { etapa: 'Ganado' });
    submit(getForm(root, 'opportunity'));
    expect(loadOpportunities()[0].etapa).toBe('Ganado');
  });

  it('does not offer archived clients as assignable accounts', () => {
    const { client, employee } = seed();
    archiveClient(client.id);
    const { root } = mountApp();

    click(root, '[data-nav="opportunities"]');
    click(root, '[data-action="new-opportunity"]');
    const options = Array.from(
      getForm(root, 'opportunity').elements.namedItem('clienteId').options
    ).map((option) => option.textContent);
    expect(options).not.toContain('Acme');
    expect(options).toContain('Seleccione un cliente');
    expect(employee.id).toBeTruthy();
  });

  it('deletes an opportunity', () => {
    const { client, employee } = seed();
    const { root } = mountApp();
    newOpportunity(root, { ...baseOpportunity, clienteId: client.id, empleadoId: employee.id });

    click(root, '[data-action="delete-opportunity"]');
    expect(loadOpportunities()).toHaveLength(0);
  });
});
