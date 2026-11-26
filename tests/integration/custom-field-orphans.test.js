import { beforeEach, describe, expect, it } from 'vitest';
import { mountLiveDom, seedAuth } from './live-dom.js';
import { boot } from '../../src/app.js';
import { normalizeConfig, setActiveConfig } from '../../src/module-config.js';

const configWithSegment = {
  customFields: [
    { target: 'entity', key: 'segmento', label: 'Segmento', type: 'text' }
  ]
};

async function mountWithConfig(config) {
  seedAuth();
  mountLiveDom();
  setActiveConfig(normalizeConfig(config).config);
  await boot();
}

function submitEntity(segmento) {
  document.querySelector('#entity-form [name="name"]').value = 'Acme SpA';
  document.querySelector('#entity-form [name="code"]').value = 'CLI-1';
  document.querySelector('#entity-form [name="email"]').value = 'ana@acme.cl';
  document.querySelector('#entity-form [name="phone"]').value = '912345678';
  const custom = document.querySelector('#cf-segmento');
  if (custom) custom.value = segmento;
  document.querySelector('#entity-form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
}

function storedEntities() {
  return JSON.parse(localStorage.getItem('erp_base_module:entities') || '[]');
}

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

describe('FR-071 - valores de campos personalizados eliminados', () => {
  it('conserva el valor en localStorage y lo oculta de formularios y búsqueda', async () => {
    await mountWithConfig(configWithSegment);
    submitEntity('B');
    expect(storedEntities()[0].segmento).toBe('B');

    await mountWithConfig({ customFields: [] });
    expect(document.querySelector('#cf-segmento')).toBeNull();
    expect(storedEntities()[0].segmento).toBe('B');

    const search = document.querySelector('#search-input');
    search.value = 'Segmento';
    search.dispatchEvent(new Event('input', { bubbles: true }));
    expect(document.querySelector('#search-results-list').textContent).not.toContain('Segmento');

    search.value = 'HUERFANO_XYZ';
    search.dispatchEvent(new Event('input', { bubbles: true }));
    expect(document.querySelector('#search-results-list').textContent).toBe('');
  });

  it('edits another configured field without erasing the orphan value', async () => {
    await mountWithConfig(configWithSegment);
    submitEntity('B');

    setActiveConfig(normalizeConfig({
      customFields: [{ target: 'entity', key: 'region', label: 'Región', type: 'text' }]
    }).config);
    document.querySelector('#entity-form [name="name"]').value = 'Acme Actualizada';
    document.querySelector('#entity-form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    expect(storedEntities()[0].segmento).toBe('B');
  });
});
