import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mountLiveDom } from './live-dom.js';
import { THEME_STORAGE_KEY } from '../../src/main.js';

const indexHtml = readFileSync(resolve(process.cwd(), 'index.html'), 'utf8');

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
  document.documentElement.style.removeProperty('transition');
});

describe('FR-073 / SC-021 - selector de tema Claro/Oscuro', () => {
  it('está disponible en el espacio de trabajo con ambas opciones', () => {
    mountLiveDom();
    const selector = document.querySelector('#theme-select');
    expect(selector).toBeTruthy();
    expect([...selector.options].map((option) => option.value)).toEqual(['Claro', 'Oscuro']);
  });

  it('aplica el tema guardado en el primer snapshot del DOM tras recargar', async () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'Oscuro');
    mountLiveDom();
    vi.resetModules();
    await import('../../src/main.js');

    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(document.querySelector('#theme-select').value).toBe('Oscuro');
  });

  it('conserva la elección entre recargas sin escribir claves crm_module:* ni erp_*', async () => {
    mountLiveDom();
    vi.resetModules();
    await import('../../src/main.js');

    const selector = document.querySelector('#theme-select');
    selector.value = 'Oscuro';
    selector.dispatchEvent(new Event('change', { bubbles: true }));

    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('Oscuro');
    expect(localStorage.getItem('crm_module:customers')).toBeNull();
    expect(localStorage.getItem('erp.authenticatedUser')).toBeNull();

    vi.resetModules();
    await import('../../src/main.js');
    expect(document.documentElement.dataset.theme).toBe('dark');
  });

  it('aplica el tema desde el head, antes de que el contenido sea visible', () => {
    const head = /<head[^>]*>([\s\S]*?)<\/head>/i.exec(indexHtml)?.[1] ?? '';
    expect(head).toContain(THEME_STORAGE_KEY);
    expect(head).toMatch(/dataset\.theme\s*=/);
  });
});
