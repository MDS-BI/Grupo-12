import { describe, expect, it } from 'vitest';
import {
  STORAGE_KEYS,
  addClient,
  addEmployee,
  addInteraction,
  addOpportunity,
  archiveClient,
  checkReferentialIntegrity,
  consumeStorageErrors,
  getClientDetail,
  loadClients,
  loadInteractions,
  loadOpportunities
} from '../../src/storage.js';

function client(overrides = {}) {
  return {
    nombreEmpresa: 'Acme',
    personaContacto: 'Ana',
    correo: 'ana@acme.cl',
    telefono: '123',
    ...overrides
  };
}

describe('referential integrity', () => {
  it('reports stored records that reference missing clients or employees', () => {
    localStorage.setItem(
      STORAGE_KEYS.opportunities,
      JSON.stringify([
        { id: 'o1', clienteId: 'missing', empleadoId: 'missing', etapa: 'Evaluación' }
      ])
    );
    localStorage.setItem(
      STORAGE_KEYS.interactions,
      JSON.stringify([
        { id: 'i1', clienteId: 'missing', empleadoId: 'missing', fecha: '2026-01-01', tipo: 'Llamada' }
      ])
    );

    const issues = checkReferentialIntegrity();
    expect(issues).toHaveLength(4);
    expect(issues.join(' ')).toMatch(/cliente inexistente/);
    expect(issues.join(' ')).toMatch(/empleado inexistente/);
  });

  it('reports corrupt storage instead of failing silently', () => {
    localStorage.setItem(STORAGE_KEYS.clients, '{not-json');
    expect(loadClients()).toEqual([]);
    const errors = consumeStorageErrors();
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.join(' ')).toMatch(/corruptos/);
  });
});

describe('logical deletion preserves history', () => {
  it('keeps opportunities and interactions after archiving the client', () => {
    const record = addClient(client());
    const employee = addEmployee({ nombre: 'Luis', cargo: 'Ejecutivo' });
    addOpportunity({
      clienteId: record.id,
      empleadoId: employee.id,
      montoEstimado: 100,
      fechaEstimadaCierre: '2026-04-01'
    });
    addInteraction({
      clienteId: record.id,
      empleadoId: employee.id,
      fecha: '2026-03-01',
      tipo: 'Llamada'
    });

    archiveClient(record.id);

    expect(loadOpportunities()).toHaveLength(1);
    expect(loadInteractions()).toHaveLength(1);
    const detail = getClientDetail(record.id);
    expect(detail.client.archived).toBe(true);
    expect(detail.opportunities).toHaveLength(1);
    expect(detail.interactions).toHaveLength(1);
  });
});
