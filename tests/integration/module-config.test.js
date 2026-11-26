import { describe, expect, it } from 'vitest';
import { mountLiveDom, seedAuth } from './live-dom.js';
import { boot } from '../../src/app.js';
import { loadModuleConfig, normalizeConfig, setActiveConfig } from '../../src/module-config.js';
import { loadEntities } from '../../src/storage.js';

const customConfig = {
  moduleName: 'Ventas',
  labels: { clientes: 'Cuentas', cliente: 'Cuenta' },
  customFields: [
    {
      target: 'entity',
      key: 'segmento',
      label: 'Segmento',
      type: 'select',
      options: ['A', 'B'],
      required: true
    }
  ],
  theme: { accentColor: '#ff0000' }
};

async function mountConfig(config) {
  localStorage.clear();
  seedAuth();
  mountLiveDom();
  setActiveConfig(normalizeConfig(config).config);
  await boot();
}

describe('US10 - configuración del módulo', () => {
  it('applies custom module name, labels and accent colour without code changes', async () => {
    const { config } = normalizeConfig(customConfig);
    await mountConfig(config);

    expect(document.querySelector('#brand-name').textContent).toBe('Ventas');
    expect(document.querySelector('#nav-entities-label').textContent).toContain('Cuentas');
    expect(document.documentElement.style.getPropertyValue('--accent')).toBe('#ff0000');
  });

  it('renders custom fields and enforces their required validation', async () => {
    await mountConfig(customConfig);

    document.querySelector('#nav-entities').click();
    const form = document.querySelector('#entity-form');
    const customField = form.querySelector('[name="segmento"]');
    expect(customField).toBeTruthy();
    expect(customField.tagName).toBe('SELECT');

    form.querySelector('[name="name"]').value = 'Acme';
    form.querySelector('[name="code"]').value = 'CLI-1';
    form.querySelector('[name="email"]').value = 'ana@acme.cl';
    form.querySelector('[name="phone"]').value = '912345678';
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    expect(form.querySelector('#error-cf-segmento').textContent).toBeTruthy();
    expect(loadEntities()).toHaveLength(0);

    form.querySelector('[name="segmento"]').value = 'A';
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    expect(loadEntities()[0].segmento).toBe('A');
  });

  it('keeps default behaviour for custom fields not configured in this module', async () => {
    await mountConfig(null);
    document.querySelector('#nav-entities').click();

    const form = document.querySelector('#entity-form');
    expect(form.querySelector('[name="segmento"]')).toBeNull();
    form.querySelector('[name="name"]').value = 'Acme';
    form.querySelector('[name="code"]').value = 'CLI-1';
    form.querySelector('[name="email"]').value = 'ana@acme.cl';
    form.querySelector('[name="phone"]').value = '912345678';
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    expect(loadEntities()).toHaveLength(1);
  });

  it('shows configuration errors without breaking the workspace', () => {
    localStorage.clear();
    mountLiveDom();
    const { errors } = normalizeConfig({ moduleName: '', theme: { accentColor: 'no-es-color!' } });

    expect(errors.some((error) => /moduleName/i.test(error))).toBe(true);
    expect(errors.some((error) => /accentColor/i.test(error))).toBe(true);
    expect(document.querySelector('#app-shell')).toBeTruthy();
  });
});

describe('FR-071 - campos personalizados eliminados (DOM real)', () => {
  it('conserva el valor en localStorage y lo oculta de formularios, listas y búsqueda', async () => {
    localStorage.clear();
    seedAuth();

    mountLiveDom();
    setActiveConfig(normalizeConfig({
      customFields: [{ target: 'entity', key: 'segmento', label: 'Segmento', type: 'text' }]
    }).config);
    await boot();

    const form = document.querySelector('#entity-form');
    form.querySelector('[name="name"]').value = 'Acme SpA';
    form.querySelector('[name="code"]').value = 'CLI-1';
    form.querySelector('[name="email"]').value = 'ana@acme.cl';
    form.querySelector('[name="phone"]').value = '912345678';
    document.querySelector('#cf-segmento').value = 'B';
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    const stored = JSON.parse(localStorage.getItem('erp_base_module:entities') || '[]');
    expect(stored[0].segmento).toBe('B');

    mountLiveDom();
    setActiveConfig(normalizeConfig({ customFields: [] }).config);
    await boot();

    expect(document.querySelector('#cf-segmento')).toBeNull();
    expect(JSON.parse(localStorage.getItem('erp_base_module:entities') || '[]')[0].segmento).toBe('B');

    const search = document.querySelector('#search-input');
    search.value = 'HUERFANO_XYZ';
    search.dispatchEvent(new Event('input', { bubbles: true }));
    expect(document.querySelector('#search-results-list').textContent).toBe('');
  });
});
