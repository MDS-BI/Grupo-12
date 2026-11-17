import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { mountLiveDom } from '../integration/live-dom.js';

const html = readFileSync(resolve(process.cwd(), 'index.html'), 'utf8');

describe('form headings contract', () => {
  it('declares the exact uppercase literals in the source', () => {
    expect(html).toContain('DATOS DEL CLIENTE');
    expect(html).toContain('CONDICIONES COMERCIALES');
  });

  it('exposes the literals as DOM text', () => {
    mountLiveDom();
    const headings = [...document.querySelectorAll('#entity-form .form-section-title-text')]
      .map((node) => node.textContent.trim());
    expect(headings).toEqual(['DATOS DEL CLIENTE', 'CONDICIONES COMERCIALES']);
  });
});
