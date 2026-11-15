import { describe, expect, it } from 'vitest';
import { filterOpportunities, matchesClientSearch } from '../../src/domain.js';

const clients = [
  {
    id: 'c1',
    nombreEmpresa: 'Acme',
    personaContacto: 'Ana',
    correo: 'ana@acme.cl',
    estado: 'Activo',
    archived: false
  },
  {
    id: 'c2',
    nombreEmpresa: 'Beta',
    personaContacto: 'Beto',
    correo: 'beto@beta.cl',
    estado: 'Posible',
    archived: false
  }
];

const opportunities = [
  {
    id: 'o1',
    clienteId: 'c1',
    empleadoId: 'e1',
    etapa: 'Propuesta',
    montoEstimado: 100,
    fechaEstimadaCierre: '2026-03-10'
  },
  {
    id: 'o2',
    clienteId: 'c2',
    empleadoId: 'e2',
    etapa: 'Negociación',
    montoEstimado: 200,
    fechaEstimadaCierre: '2026-04-10'
  }
];

describe('search behaviour', () => {
  it('finds clients by company, contact, email and state', () => {
    expect(clients.filter((client) => matchesClientSearch(client, 'acme'))).toHaveLength(1);
    expect(clients.filter((client) => matchesClientSearch(client, 'beto'))).toHaveLength(1);
    expect(clients.filter((client) => matchesClientSearch(client, 'ana@'))).toHaveLength(1);
    expect(clients.filter((client) => matchesClientSearch(client, 'posible'))).toHaveLength(1);
    expect(clients.filter((client) => matchesClientSearch(client, 'nada'))).toHaveLength(0);
  });

  it('combines opportunity filters', () => {
    expect(filterOpportunities(opportunities, { etapa: 'Propuesta' })).toHaveLength(1);
    expect(filterOpportunities(opportunities, { empleadoId: 'e2' })).toHaveLength(1);
    expect(
      filterOpportunities(opportunities, { fechaDesde: '2026-04-01', fechaHasta: '2026-04-30' })
    ).toHaveLength(1);
    expect(
      filterOpportunities(opportunities, { etapa: 'Propuesta', empleadoId: 'e1' })
    ).toHaveLength(1);
    expect(
      filterOpportunities(opportunities, { etapa: 'Negociación', empleadoId: 'e1' })
    ).toHaveLength(0);
  });
});
