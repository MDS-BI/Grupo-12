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

export async function bootApp() {
  mountLiveDom();
  vi.resetModules();
  const app = await import('../../src/app.js');
  const { normalizeConfig, setActiveConfig } = await import('../../src/module-config.js');
  setActiveConfig(normalizeConfig(null).config);
  await app.boot();
  return document;
}

export function seedAuth(user = 'Cliente1', { remember = true } = {}) {
  const key = 'erp.authenticatedUser';
  localStorage.removeItem(key);
  sessionStorage.removeItem(key);
  (remember ? localStorage : sessionStorage).setItem(key, user);
}

export function clearStorages() {
  localStorage.clear();
  sessionStorage.clear();
}

export function focusableWithin(container) {
  return [...container.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')]
    .filter((el) => !el.disabled && !el.hidden && el.getAttribute('aria-hidden') !== 'true');
}

export function pressKey(el, key, opts = {}) {
  el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...opts }));
}
