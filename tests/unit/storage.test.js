import { describe, expect, it } from 'vitest';
import {
  ValidationError,
  addClient,
  addEmployee,
  addInteraction,
  addOpportunity,
  archiveClient,
  archiveEmployee,
  getClientDetail,
  isEmailAvailable,
  loadActiveClients,
  loadActiveEmployees,
  loadClients,
  loadInteractions,
  loadOpportunities,
  updateClient
} from '../../src/storage.js';

function validClient(overrides = {}) {
  return {
    nombreEmpresa: 'Acme',
    personaContacto: 'Ana Pérez',
    correo: 'ana@acme.cl',
    telefono: '+56911111111',
    ...overrides
  };
}

function validEmployee(overrides = {}) {
  return { nombre: 'Luis Soto', cargo: 'Ejecutivo', ...overrides };
}

describe('client storage', () => {
  it('creates a client with the default state Posible', () => {
    const client = addClient(validClient());
    expect(client.id).toBeTruthy();
    expect(client.estado).toBe('Posible');
    expect(client.archived).toBe(false);
    expect(loadClients()).toHaveLength(1);
  });

  it('requires company, contact, email and phone', () => {
    try {
      addClient({});
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError);
      const fields = error.errors.map((item) => item.field);
      expect(fields).toEqual(
        expect.arrayContaining(['nombreEmpresa', 'personaContacto', 'correo', 'telefono'])
      );
      return;
    }
    throw new Error('Se esperaba un ValidationError');
  });

  it('rejects invalid email formats', () => {
    expect(() => addClient(validClient({ correo: 'not-an-email' }))).toThrow(ValidationError);
  });

  it('enforces case-insensitive email uniqueness', () => {
    addClient(validClient({ correo: 'ana@acme.cl' }));
    expect(isEmailAvailable('ANA@ACME.CL')).toBe(false);
    expect(() => addClient(validClient({ correo: 'ANA@ACME.CL', nombreEmpresa: 'Otra' }))).toThrow(
      ValidationError
    );
  });

  it('updates a client and keeps a unique email', () => {
    const first = addClient(validClient());
    const second = addClient(
      validClient({ nombreEmpresa: 'Beta', correo: 'beta@acme.cl', personaContacto: 'Beto' })
    );
    expect(() => updateClient(second.id, { correo: 'ANA@acme.cl' })).toThrow(ValidationError);
    const updated = updateClient(first.id, { estado: 'Activo' });
    expect(updated.estado).toBe('Activo');
    expect(updated.updatedAt).toBeTruthy();
  });

  it('archives clients logically without removing their records', () => {
    const client = addClient(validClient());
    archiveClient(client.id);
    expect(loadClients()).toHaveLength(1);
    expect(loadClients()[0].archived).toBe(true);
    expect(loadActiveClients()).toHaveLength(0);
  });
});

describe('employee storage', () => {
  it('requires name and cargo', () => {
    expect(() => addEmployee({})).toThrow(ValidationError);
    expect(() => addEmployee({ nombre: 'Luis' })).toThrow(ValidationError);
  });

  it('creates and archives employees logically', () => {
    const employee = addEmployee(validEmployee());
    expect(loadActiveEmployees()).toHaveLength(1);
    archiveEmployee(employee.id);
    expect(loadActiveEmployees()).toHaveLength(0);
  });
});

describe('client 360 detail', () => {
  it('returns the client together with opportunities and interactions', () => {
    const client = addClient(validClient());
    const employee = addEmployee(validEmployee());
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

    const detail = getClientDetail(client.id);
    expect(detail.client.id).toBe(client.id);
    expect(detail.opportunities).toHaveLength(1);
    expect(detail.interactions).toHaveLength(1);
    expect(loadOpportunities()).toHaveLength(1);
    expect(loadInteractions()).toHaveLength(1);
  });
});
