import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { vi } from 'vitest';

const html = readFileSync(resolve(process.cwd(), 'index.html'), 'utf8');
const body = /<body[^>]*>([\s\S]*)<\/body>/i.exec(html)?.[1] ?? html;

export function mountLiveDom() {
  document.documentElement.lang = 'es';
  document.body.innerHTML = body;
  return document;
}

export async function reloadLiveDom() {
  vi.resetModules();
  mountLiveDom();
  await import('../../src/main.js');
  return document;
}
