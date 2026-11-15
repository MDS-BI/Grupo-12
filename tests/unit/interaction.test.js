import { describe, expect, it } from 'vitest';
import {
  ValidationError,
  addClient,
  addEmployee,
  addInteraction,
  archiveEmployee,
  loadInteractions,
  validateInteraction
} from '../../src/storage.js';

function setup() {
  const client = addClient({
    nombreEmpresa: 'Acme',
    personaContacto: 'Ana',
    correo: 'ana@acme.cl',
    telefono: '123'
  });
  const employee = addEmployee({ nombre: 'Luis', cargo: 'Ejecutivo' });
  return { client, employee };
}

describe('interaction validation', () => {
  it('requires date, type, client and employee', () => {
    const result = validateInteraction({});
    expect(result.valid).toBe(false);
    const fields = result.errors.map((error) => error.field);
    expect(fields).toEqual(
      expect.arrayContaining(['clienteId', 'empleadoId', 'fecha', 'tipo'])
    );
  });

  it('only accepts Llamada, Correo or Reunión as type', () => {
    const { client, employee } = setup();
    expect(() =>
      addInteraction({
        clienteId: client.id,
        empleadoId: employee.id,
        fecha: '2026-03-01',
        tipo: 'Visita'
      })
    ).toThrow(ValidationError);
  });

  it('stores an interaction with an optional description', () => {
    const { client, employee } = setup();
    const interaction = addInteraction({
      clienteId: client.id,
      empleadoId: employee.id,
      fecha: '2026-03-01',
      tipo: 'Reunión'
    });
    expect(interaction.descripcion).toBe('');
    expect(loadInteractions()).toHaveLength(1);
  });

  it('rejects referencing an archived employee', () => {
    const { client, employee } = setup();
    archiveEmployee(employee.id);
    expect(() =>
      addInteraction({
        clienteId: client.id,
        empleadoId: employee.id,
        fecha: '2026-03-01',
        tipo: 'Correo'
      })
    ).toThrow(ValidationError);
  });
});
