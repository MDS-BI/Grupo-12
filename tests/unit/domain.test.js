import { describe, expect, it } from 'vitest';
import {
  canTransition,
  computeDashboardMetrics,
  filterOpportunities,
  isTerminalStage,
  isValidDate,
  matchesClientSearch
} from '../../src/domain.js';

describe('domain transitions', () => {
  it('allows the sequential path and closing to Perdido', () => {
    expect(canTransition('Evaluación', 'Propuesta')).toBe(true);
    expect(canTransition('Propuesta', 'Negociación')).toBe(true);
    expect(canTransition('Negociación', 'Ganado')).toBe(true);
    expect(canTransition('Evaluación', 'Perdido')).toBe(true);
    expect(canTransition('Propuesta', 'Perdido')).toBe(true);
    expect(canTransition('Negociación', 'Perdido')).toBe(true);
  });

  it('rejects Ganado before Negociación and any change from terminal stages', () => {
    expect(canTransition('Evaluación', 'Ganado')).toBe(false);
    expect(canTransition('Propuesta', 'Ganado')).toBe(false);
    expect(canTransition('Ganado', 'Perdido')).toBe(false);
    expect(canTransition('Perdido', 'Negociación')).toBe(false);
    expect(isTerminalStage('Ganado')).toBe(true);
    expect(isTerminalStage('Perdido')).toBe(true);
    expect(isTerminalStage('Negociación')).toBe(false);
  });
});

describe('date validation', () => {
  it('accepts real calendar dates and rejects impossible ones', () => {
    expect(isValidDate('2026-02-28')).toBe(true);
    expect(isValidDate('2026-02-30')).toBe(false);
    expect(isValidDate('2026-13-01')).toBe(false);
    expect(isValidDate('')).toBe(false);
  });
});

describe('computeDashboardMetrics', () => {
  const today = new Date(2026, 2, 15);
  const clients = [
    { id: 'c1', estado: 'Activo', archived: false },
    { id: 'c2', estado: 'Activo', archived: true },
    { id: 'c3', estado: 'Posible', archived: false }
  ];
  const opportunities = [
    { id: 'o1', etapa: 'Propuesta', montoEstimado: 1000, fechaEstimadaCierre: '2026-03-20' },
    { id: 'o2', etapa: 'Evaluación', montoEstimado: 500, fechaEstimadaCierre: '2026-03-14' },
    { id: 'o3', etapa: 'Negociación', montoEstimado: 2000, fechaEstimadaCierre: '2026-05-01' },
    { id: 'o4', etapa: 'Ganado', montoEstimado: 5000, fechaEstimadaCierre: '2026-03-20' },
    { id: 'o5', etapa: 'Perdido', montoEstimado: 800, fechaEstimadaCierre: '2026-03-20' }
  ];

  it('counts active clients, open opportunities, pipeline and upcoming closes', () => {
    const metrics = computeDashboardMetrics({ clients, opportunities }, today);
    expect(metrics.activeClients).toBe(1);
    expect(metrics.openOpportunities).toBe(3);
    expect(metrics.pipelineTotal).toBe(3500);
    expect(metrics.upcomingCloses).toBe(1);
  });
});

describe('search helpers', () => {
  it('matches clients by company, contact, email or state ignoring case', () => {
    const client = {
      nombreEmpresa: 'Acme',
      personaContacto: 'Ana',
      correo: 'ana@acme.cl',
      estado: 'Activo'
    };
    expect(matchesClientSearch(client, 'acm')).toBe(true);
    expect(matchesClientSearch(client, 'ANA@')).toBe(true);
    expect(matchesClientSearch(client, 'activo')).toBe(true);
    expect(matchesClientSearch(client, 'zzz')).toBe(false);
  });

  it('filters opportunities by stage, employee and date range', () => {
    const opportunities = [
      { id: 'o1', etapa: 'Propuesta', empleadoId: 'e1', fechaEstimadaCierre: '2026-03-10' },
      { id: 'o2', etapa: 'Negociación', empleadoId: 'e2', fechaEstimadaCierre: '2026-04-10' }
    ];
    expect(filterOpportunities(opportunities, { etapa: 'Propuesta' })).toHaveLength(1);
    expect(filterOpportunities(opportunities, { empleadoId: 'e2' })).toHaveLength(1);
    expect(
      filterOpportunities(opportunities, { fechaDesde: '2026-04-01', fechaHasta: '2026-04-30' })
    ).toHaveLength(1);
    expect(
      filterOpportunities(opportunities, {
        etapa: 'Propuesta',
        empleadoId: 'e1',
        fechaDesde: '2026-03-01',
        fechaHasta: '2026-03-31'
      })
    ).toHaveLength(1);
  });
});
