import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const css = readFileSync(resolve(process.cwd(), 'src/styles.css'), 'utf8');

describe('layout contract', () => {
  it('uses a 45%/55% login grid and stacks it at 820 px', () => {
    expect(css).toMatch(/\.login-card\s*\{[^}]*grid-template-columns:\s*45%\s+55%/s);
    expect(css).toMatch(/@media\s*\(max-width:\s*820px\)\s*\{[^}]*\.login-card\s*\{[^}]*grid-template-columns:\s*1fr/s);
  });

  it('defines both sidebar width tokens', () => {
    expect(css).toMatch(/--sidebar-width:\s*260px/);
    expect(css).toMatch(/--sidebar-width-collapsed:\s*64px/);
  });

  it('never hides the collapsed sidebar with display:none', () => {
    expect(css).not.toMatch(/\.app-shell\.sidebar-collapsed\s+\.sidebar\s*\{[^}]*display:\s*none/s);
  });
});
