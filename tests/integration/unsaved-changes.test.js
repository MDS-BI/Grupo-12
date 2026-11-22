import { beforeEach, describe, expect, it } from 'vitest';
import { mountLiveDom } from './live-dom.js';
import { boot } from '../../src/app.js';
import { normalizeConfig, setActiveConfig } from '../../src/module-config.js';

async function mountAndBoot() {
  mountLiveDom();
  setActiveConfig(normalizeConfig(null).config);
  await boot();
}

beforeEach(async () => {
  window.localStorage.clear();
  window.sessionStorage.clear();
  await mountAndBoot();
});

function dialog() {
  return document.querySelector('#unsaved-dialog');
}

describe('FR-070 - confirmación al salir de formularios CRM con cambios', () => {
  it('ofrece Permanecer y Descartar y no navega sin confirmación', () => {
    document.querySelector('#nav-entities').click();
    document.querySelector('#name').value = 'Cambio sin guardar';
    document.querySelector('#nav-documents').click();

    expect(dialog().hidden).toBe(false);
    expect(dialog().textContent).toContain('Permanecer');
    expect(dialog().textContent).toContain('Descartar');
    expect(document.querySelector('#view-entities').hidden).toBe(false);
    expect(document.querySelector('#view-documents').hidden).toBe(true);
  });

  it('Permanecer conserva la vista y los valores introducidos', () => {
    document.querySelector('#nav-entities').click();
    document.querySelector('#name').value = 'Cambio sin guardar';
    document.querySelector('#nav-dashboard').click();
    document.querySelector('#unsaved-stay').click();

    expect(dialog().hidden).toBe(true);
    expect(document.querySelector('#view-entities').hidden).toBe(false);
    expect(document.querySelector('#name').value).toBe('Cambio sin guardar');
  });

  it('Descartar descarta los cambios y navega al destino', () => {
    document.querySelector('#nav-entities').click();
    document.querySelector('#name').value = 'Cambio sin guardar';
    document.querySelector('#nav-documents').click();
    document.querySelector('#unsaved-discard').click();

    expect(dialog().hidden).toBe(true);
    expect(document.querySelector('#view-documents').hidden).toBe(false);
    expect(document.querySelector('#view-entities').hidden).toBe(true);
    expect(document.querySelector('#name').value).toBe('');
  });

  it('navega directamente cuando ningún formulario tiene cambios', () => {
    document.querySelector('#nav-search').click();

    expect(dialog().hidden).toBe(true);
    expect(document.querySelector('#view-search').hidden).toBe(false);
  });

  it('protege también el formulario de oportunidades', () => {
    document.querySelector('#nav-documents').click();
    document.querySelector('#series').value = 'OPO-NUEVA';
    document.querySelector('#nav-dashboard').click();

    expect(dialog().hidden).toBe(false);
    document.querySelector('#unsaved-discard').click();
    expect(document.querySelector('#view-dashboard').hidden).toBe(false);
    expect(document.querySelector('#series').value).toBe('');
  });
});
