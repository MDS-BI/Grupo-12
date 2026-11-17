import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const html = readFileSync(resolve(process.cwd(), 'index.html'), 'utf8');

describe('UTF-8 contract', () => {
  it('declares Spanish and UTF-8', () => {
    expect(html).toContain('<html lang="es">');
    expect(html).toContain('<meta charset="UTF-8" />');
  });

  it('has no replacement characters or mojibake sequences', () => {
    expect(html).not.toContain('\uFFFD');
    expect(html).not.toContain('Ã');
    expect(html).not.toContain('â€');
  });
});
