import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const css = readFileSync(resolve(process.cwd(), 'src/styles.css'), 'utf8');

function block(selector) {
  const re = new RegExp(selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*\\{([\\s\\S]*?)\\}', 'i');
  const m = css.match(re);
  return m ? m[1] : '';
}

describe('US16 theme contract', () => {
  it('T143: define tokens dark y no fija blanco en superficies críticas clave', () => {
    expect(css).toMatch(/:root\[data-theme='dark'\]/);
    for (const sel of ['.topbar', '.sidebar', '.confirm-dialog-card']) {
      const b = block(sel);
      expect(b).not.toMatch(/background:\s*(#fff\b|#ffffff\b|white\b)/i);
    }
  });
});
