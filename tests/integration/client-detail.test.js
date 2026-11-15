import { describe, expect, it } from 'vitest';
import { click, mountApp } from '../helpers.js';
import {
  addClient,
  addEmployee,
  addInteraction,
  addOpportunity
} from '../../src/storage.js';

function seed() {
  const client = addClient({
    nombreEmpresa: 'Acme',
    personaContacto: 'Ana Pérez',
    correo: 'ana@acme.cl',
    telefono: '123'
  });
  const employee = addEmployee({ nombre: 'Luis Soto', cargo: 'Ejecutivo' });
  addOpportunity({
    clienteId: client.id,
    empleadoId: employee.id,
    montoEstimado: 1500,
    fechaEstimadaCierre: '2026-04-01'
  });
  addInteraction({
    clienteId: client.id,
    empleadoId: employee.id,
    fecha: '2026-03-01',
    tipo: 'Llamada',
    descripcion: 'Llamada inicial'
  });
  return { client, employee };
}

describe('US6 - ficha 360 del cliente', () => {
  it('shows client data, opportunities and interactions together', () => {
    seed();
    const { root } = mountApp();

    click(root, '[data-nav="clients"]');
    click(root, '[data-action="detail-client"]');

    expect(root.textContent).toContain('Acme');
    expect(root.textContent).toContain('Ana Pérez');
    expect(root.textContent).toContain('ana@acme.cl');
    expect(root.textContent).toContain('Evaluación');
    expect(root.textContent).toContain('Llamada');
    expect(root.textContent).toContain('Llamada inicial');
    expect(root.querySelectorAll('[data-opportunity-row]')).toHaveLength(1);
    expect(root.querySelectorAll('[data-interaction-row]')).toHaveLength(1);
  });

  it('shows empty states when the client has no history', () => {
    addClient({
      nombreEmpresa: 'Solo',
      personaContacto: 'Sara',
      correo: 'sara@solo.cl',
      telefono: '9'
    });
    const { root } = mountApp();

    click(root, '[data-nav="clients"]');
    click(root, '[data-action="detail-client"]');

    expect(root.textContent).toMatch(/aún no tiene oportunidades/i);
    expect(root.textContent).toMatch(/aún no tiene interacciones/i);
  });

  it('returns to the client list and keeps data available', () => {
    seed();
    const { root } = mountApp();

    click(root, '[data-nav="clients"]');
    click(root, '[data-action="detail-client"]');
    click(root, '[data-action="back-to-clients"]');

    expect(root.querySelectorAll('[data-client-row]')).toHaveLength(1);
  });
});
