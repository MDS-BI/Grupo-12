import { describe, expect, it } from 'vitest';
import { evaluateOpportunityTransition, normalizeOpportunityLifecycle } from '../../src/domain.js';

describe('opportunityLifecycle transitions (FR-006, FR-007, FR-013, SC-002)', () => {
  // opportunityLifecycle is canonical name normalized from module-config.statusLifecycle
  it('allows a configured transition', () => {
    const lifecycle = normalizeOpportunityLifecycle({
      statuses: ['Prospección', 'Calificación', 'Ganado'],
      transitions: { 'Prospección': ['Calificación'], 'Calificación': ['Ganado'], 'Ganado': [] }
    });
    const result = evaluateOpportunityTransition({
      from: 'Prospección',
      to: 'Calificación',
      lifecycle
    });
    expect(result.allowed).toBe(true);
  });

  it('blocks an invalid transition with clear feedback', () => {
    const lifecycle = normalizeOpportunityLifecycle({
      statuses: ['Prospección', 'Calificación', 'Ganado'],
      transitions: { 'Prospección': ['Calificación'], 'Calificación': ['Ganado'], 'Ganado': [] }
    });
    const result = evaluateOpportunityTransition({
      from: 'Prospección',
      to: 'Ganado',
      lifecycle
    });
    expect(result.allowed).toBe(false);
    expect(String(result.reason || '')).toMatch(/transici|no permit/i);
  });

  it('falls back safely when lifecycle is invalid', () => {
    const lifecycle = normalizeOpportunityLifecycle({ statuses: [], transitions: {} });
    expect(Array.isArray(lifecycle.statuses)).toBe(true);
    expect(lifecycle.statuses.length).toBeGreaterThan(0);
    expect(lifecycle.usedFallback).toBe(true);
  });

  it('treats same-stage as allowed no-op', () => {
    const lifecycle = normalizeOpportunityLifecycle(null);
    const result = evaluateOpportunityTransition({ from: 'Evaluación', to: 'Evaluación', lifecycle });
    expect(result.allowed).toBe(true);
  });
});
