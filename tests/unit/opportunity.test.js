import { describe, expect, it } from 'vitest';
import {
  ValidationError,
  addClient,
  addEmployee,
  addOpportunity,
  archiveClient,
  loadOpportunities,
  updateOpportunity,
  validateOpportunity
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

describe('opportunity validation', () => {
  it('rejects missing references, negative amounts and invalid dates', () => {
    const { client, employee } = setup();
    const result = validateOpportunity({
      clienteId: '',
      empleadoId: '',
      montoEstimado: -5,
      fechaEstimadaCierre: '2026-02-31'
    });
    expect(result.valid).toBe(false);
    const fields = result.errors.map((error) => error.field);
    expect(fields).toEqual(
      expect.arrayContaining(['clienteId', 'empleadoId', 'montoEstimado', 'fechaEstimadaCierre'])
    );
    expect(client.id).toBeTruthy();
    expect(employee.id).toBeTruthy();
  });

  it('rejects references to archived clients or employees', () => {
    const { client, employee } = setup();
    const archivedClient = addClient({
      nombreEmpresa: 'Beta',
      personaContacto: 'Beto',
      correo: 'beta@acme.cl',
      telefono: '456'
    });
    archiveClient(archivedClient.id);
    const result = validateOpportunity({
      clienteId: archivedClient.id,
      empleadoId: employee.id,
      montoEstimado: 10,
      fechaEstimadaCierre: '2026-04-01'
    });
    expect(result.valid).toBe(false);
    expect(result.errors[0].message).toMatch(/archivado/);
    expect(client.id).toBeTruthy();
  });

  it('defaults new opportunities to Evaluación', () => {
    const { client, employee } = setup();
    const opportunity = addOpportunity({
      clienteId: client.id,
      empleadoId: employee.id,
      montoEstimado: 1500,
      fechaEstimadaCierre: '2026-04-01'
    });
    expect(opportunity.etapa).toBe('Evaluación');
    expect(Number(opportunity.montoEstimado)).toBe(1500);
  });
});

describe('opportunity stage transitions', () => {
  it('enforces sequential transitions and terminal stages', () => {
    const { client, employee } = setup();
    const opportunity = addOpportunity({
      clienteId: client.id,
      empleadoId: employee.id,
      montoEstimado: 100,
      fechaEstimadaCierre: '2026-04-01'
    });

    expect(() => updateOpportunity(opportunity.id, { etapa: 'Ganado' })).toThrow(ValidationError);
    const proposed = updateOpportunity(opportunity.id, { etapa: 'Propuesta' });
    expect(proposed.etapa).toBe('Propuesta');
    const negotiating = updateOpportunity(opportunity.id, { etapa: 'Negociación' });
    expect(negotiating.etapa).toBe('Negociación');
    const won = updateOpportunity(opportunity.id, { etapa: 'Ganado' });
    expect(won.etapa).toBe('Ganado');
    expect(() => updateOpportunity(opportunity.id, { etapa: 'Perdido' })).toThrow(ValidationError);
    expect(loadOpportunities()[0].etapa).toBe('Ganado');
  });
});
