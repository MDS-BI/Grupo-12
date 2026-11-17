import { describe, expect, it } from 'vitest';
import { computeConversionRate } from '../../src/domain.js';

describe('computeConversionRate', () => {
  it('returns 0 when no opportunity is closed', () => {
    expect(computeConversionRate([])).toBe(0);
    expect(computeConversionRate([{ stage: 'Evaluación' }])).toBe(0);
  });

  it('uses won and closed opportunities as the ratio', () => {
    expect(computeConversionRate([
      { stage: 'Ganado' },
      { stage: 'Ganado' },
      { stage: 'Perdido' },
      { stage: 'Perdido' }
    ])).toBe(50);
    expect(computeConversionRate([
      { stage: 'Ganado' },
      { stage: 'Ganado' },
      { stage: 'Ganado' },
      { stage: 'Perdido' }
    ])).toBe(75);
    expect(computeConversionRate([
      { stage: 'Ganado' },
      { stage: 'Perdido' },
      { stage: 'Perdido' }
    ])).toBe(33);
  });

  it('accepts the etapa alias without mutating its input', () => {
    const opportunities = [{ etapa: 'Ganado' }, { etapa: 'Perdido' }];
    const snapshot = JSON.stringify(opportunities);
    expect(computeConversionRate(opportunities)).toBe(50);
    expect(JSON.stringify(opportunities)).toBe(snapshot);
  });
});
