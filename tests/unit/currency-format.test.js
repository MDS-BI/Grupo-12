import { describe, expect, it } from 'vitest';
import { formatMoney, normalizeCurrency, MVP_BASE_CURRENCY } from '../../src/domain.js';

describe('US24 - moneda CLP MVP', () => {
  it('T180: normaliza moneda a base CLP y formatea consistente', () => {
    expect(MVP_BASE_CURRENCY).toBe('CLP');
    expect(normalizeCurrency('')).toBe('CLP');
    expect(normalizeCurrency('clp')).toBe('CLP');
    expect(normalizeCurrency('$')).toBe('CLP');
    expect(normalizeCurrency('USD')).toBe('CLP');
    const formatted = formatMoney(1234567, 'CLP');
    expect(formatted).toMatch(/1.?234.?567/);
    expect(formatted).toMatch(/\$|CLP/);
  });
});
