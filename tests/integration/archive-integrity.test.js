import { describe, expect, it } from 'vitest';
import { click, mountApp } from '../helpers.js';
import {
  STORAGE_KEYS,
  addClient,
  addEmployee,
  addInteraction,
  addOpportunity,
  archiveClient,
  loadActiveClients,
  loadClients,
  loadInteractions,
  loadOpportunities
} from '../../src/storage.js';

function seedHistory() {
  const client = addClient({
    nombreEmpresa: 'Acme',
    personaContacto: 'Ana',
    correo: 'ana@acme.cl',
    telefono: '123'
  });
  const employee = addEmployee({ nombre: 'Luis', cargo: 'Ejecutivo' });
  addOpportunity({
    clienteId: client.id,
    empleadoId: employee.id,
    montoEstimado: 100,
    fechaEstimadaCierre: '2026-04-01'
  });
  addInteraction({
    clienteId: client.id,
    empleadoId: employee.id,
    fecha: '2026-03-01',
    tipo: 'Llamada'
  });
  return { client, employee };
}

describe('US9 - archivado lógico y respaldo', () => {
  it('archives a client without deleting opportunities or interactions', () => {
    const { client } = seedHistory();
    const { root } = mountApp();

    click(root, '[data-nav="clients"]');
    click(root, '[data-action="archive-client"]');

    expect(loadClients()[0].archived).toBe(true);
    expect(loadActiveClients()).toHaveLength(0);
    expect(loadOpportunities()).toHaveLength(1);
    expect(loadInteractions()).toHaveLength(1);
    expect(client.id).toBeTruthy();
  });

  it('hides archived clients from the operational list and shows them on demand', () => {
    seedHistory();
    const { root } = mountApp();

    click(root, '[data-nav="clients"]');
    click(root, '[data-action="archive-client"]');
    expect(root.querySelectorAll('[data-client-row]')).toHaveLength(0);

    click(root, '[data-action="toggle-archived"]');
    expect(root.querySelectorAll('[data-client-row]')).toHaveLength(1);
    expect(root.textContent).toContain('Archivado');
  });

  it('shows a warning when stored records reference missing entities', () => {
    localStorage.setItem(
      STORAGE_KEYS.opportunities,
      JSON.stringify([
        { id: 'opp-huerfana', clienteId: 'cli-fantasma', empleadoId: 'emp-fantasma', etapa: 'Evaluación' }
      ])
    );
    const { root } = mountApp();
    expect(root.textContent).toMatch(/cliente inexistente/i);
    expect(root.textContent).toMatch(/empleado inexistente/i);
  });

  it('keeps archived clients consultable through storage for history', () => {
    const { client } = seedHistory();
    archiveClient(client.id);
    expect(loadClients()).toHaveLength(1);
    expect(loadClients()[0].archived).toBe(true);
  });
});
