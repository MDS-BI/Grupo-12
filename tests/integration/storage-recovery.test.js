import { beforeEach, describe, expect, it } from 'vitest';
import { mountLiveDom } from './live-dom.js';
import { boot } from '../../src/app.js';
import { getCRMStorageErrors, resetCorruptedCRMStorage } from '../../src/storage.js';

const ENTITY_KEYS = [
  'crm_module:customers',
  'crm_module:employees',
  'crm_module:opportunities',
  'crm_module:interactions'
];

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

describe('FR-072 - validation y recuperación de almacenamiento corrupto', () => {
  it('detecta JSON inválido y datos con forma incorrecta en las claves de entidad', () => {
    localStorage.setItem('crm_module:customers', '{no-es-json');
    localStorage.setItem('crm_module:employees', JSON.stringify({ noEsArreglo: true }));
    localStorage.setItem('crm_module:opportunities', JSON.stringify([{ id: '', stage: 'Evaluación' }]));
    localStorage.setItem('crm_module:interactions', JSON.stringify([{
      id: 'int_1', clientId: 'c1', employeeId: 'e1', date: '2026-11-20', type: 'Llamada'
    }]));

    const errors = getCRMStorageErrors();
    expect(errors).toHaveLength(3);
    expect(errors.map(({ key }) => key)).toEqual(ENTITY_KEYS.slice(0, 3));
  });

  it('acepta claves ausentes y arreglos vacíos como estado sano', () => {
    localStorage.setItem('crm_module:customers', '[]');
    expect(getCRMStorageErrors()).toEqual([]);
  });

  it('muestra el error, no sobrescribe y solo reinicia tras la acción explícita', async () => {
    const corrupted = '{no-es-json';
    localStorage.setItem('crm_module:customers', corrupted);
    localStorage.setItem('erp.authenticatedUser', 'Cliente1');
    localStorage.setItem('crm.theme', 'Oscuro');

    mountLiveDom();
    await boot();

    const errorPanel = document.querySelector('#storage-error');
    expect(errorPanel.hidden).toBe(false);
    expect(errorPanel.textContent).toMatch(/corrupt|inválid|error/i);
    expect(localStorage.getItem('crm_module:customers')).toBe(corrupted);

    document.querySelector('#storage-reset').click();

    for (const key of ENTITY_KEYS) {
      expect(localStorage.getItem(key)).toBe('[]');
    }
    expect(localStorage.getItem('erp.authenticatedUser')).toBe('Cliente1');
    expect(localStorage.getItem('crm.theme')).toBe('Oscuro');
    expect(errorPanel.hidden).toBe(true);
  });

  it('resetCorruptedCRMStorage no toca claves de sesión ni tema', () => {
    localStorage.setItem('erp.authenticatedUser', 'Cliente1');
    localStorage.setItem('crm.theme', 'Claro');
    resetCorruptedCRMStorage();
    expect(localStorage.getItem('erp.authenticatedUser')).toBe('Cliente1');
    expect(localStorage.getItem('crm.theme')).toBe('Claro');
  });
});
