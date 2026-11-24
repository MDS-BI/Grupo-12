import { beforeEach, describe, expect, it } from 'vitest';
import { boot } from '../../src/app.js';
import { CONTACT_INFO } from '../../src/contact-info.js';
import { normalizeConfig, setActiveConfig } from '../../src/module-config.js';
import { clearStorages, mountLiveDom, reloadLiveDom, seedAuth } from './live-dom.js';

const FIELDS = ['email', 'phone', 'address', 'hours'];

function expectedValues() {
  return {
    email: CONTACT_INFO.email,
    phone: CONTACT_INFO.phone,
    address: CONTACT_INFO.address,
    hours: CONTACT_INFO.hours
  };
}

function allStorageKeys() {
  return [...new Set([...Object.keys(localStorage), ...Object.keys(sessionStorage)])].sort();
}

function valuesOf(section) {
  return Object.fromEntries(FIELDS.map((field) => [
    field,
    section.querySelector(`[data-contact-field="${field}"]`)?.textContent
  ]));
}

async function mountDashboard({ corrupted = false } = {}) {
  clearStorages();
  seedAuth('Cliente1', { remember: true });
  localStorage.setItem('erp.activeView', 'dashboard');
  if (corrupted) localStorage.setItem('crm_module:customers', '{no-es-json');
  const before = allStorageKeys();

  mountLiveDom();
  setActiveConfig(normalizeConfig(null).config);
  await boot();
  return { before };
}

beforeEach(() => { clearStorages(); });

describe('US31 - recuadro Contáctanos en DOM real', () => {
  it('muestra los cuatro datos desde la fuente compartida en login sin crear claves de storage', async () => {
    const before = allStorageKeys();

    await reloadLiveDom();

    const section = document.querySelector('#login-contact-info');
    expect(section).toBeTruthy();
    expect(section.hidden).toBe(false);
    expect(valuesOf(section)).toEqual(expectedValues());
    expect(allStorageKeys()).toEqual(before);
  });

  it('replica los mismos valores en dashboard sin crear claves de storage', async () => {
    await reloadLiveDom();
    const loginValues = valuesOf(document.querySelector('#login-contact-info'));

    const { before } = await mountDashboard();

    const section = document.querySelector('#dashboard-contact-info');
    expect(document.querySelector('#view-dashboard').hidden).toBe(false);
    expect(section).toBeTruthy();
    expect(section.hidden).toBe(false);
    expect(valuesOf(section)).toEqual(loginValues);
    expect(valuesOf(section)).toEqual(expectedValues());
    expect(allStorageKeys()).toEqual(before);
  });

  it('resuelve aria-labelledby al título correspondiente en ambas instancias', async () => {
    await mountDashboard();

    for (const target of ['login', 'dashboard']) {
      const section = document.querySelector(`#${target}-contact-info`);
      const labelId = section.getAttribute('aria-labelledby');
      const title = document.getElementById(labelId);
      expect(title).toBeTruthy();
      expect(title.classList.contains('contact-info-title')).toBe(true);
      expect(title.textContent).toBe(CONTACT_INFO.title);
    }
  });

  it('oculta la instancia del dashboard durante el bloqueo FR-072 sin afectar la de login', async () => {
    await mountDashboard({ corrupted: true });

    expect(document.querySelector('#storage-error').hidden).toBe(false);
    expect(document.querySelector('#view-dashboard').style.display).toBe('none');
    expect(document.querySelector('#dashboard-contact-info').hidden).toBe(true);

    const loginSection = document.querySelector('#login-contact-info');
    expect(loginSection).toBeTruthy();
    expect(loginSection.hidden).toBe(false);
    expect(valuesOf(loginSection)).toEqual(expectedValues());
  });
});
