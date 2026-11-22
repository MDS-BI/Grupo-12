import { beforeEach, describe, expect, it } from 'vitest';
import { bootApp, clearStorages, seedAuth } from './live-dom.js';
import { addClient, addEmployee, addOpportunity } from '../../src/storage.js';

function seed() {
  const acme = addClient({ nombreEmpresa: 'Acme', personaContacto: 'Ana', correo: 'ana@acme.cl', telefono: '1', estado: 'Activo' });
  const beta = addClient({ nombreEmpresa: 'Beta', personaContacto: 'Beto', correo: 'beto@beta.cl', telefono: '2', estado: 'Posible' });
  const luis = addEmployee({ nombre: 'Luis Soto', cargo: 'Ejecutivo' });
  addOpportunity({ clienteId: acme.id, empleadoId: luis.id, montoEstimado: 100, etapa: 'Propuesta', fechaEstimadaCierre: '2026-03-10' });
  addOpportunity({ clienteId: beta.id, empleadoId: luis.id, montoEstimado: 200, etapa: 'Negociación', fechaEstimadaCierre: '2026-04-10' });
  return { acme, beta };
}

describe('US20 - Búsqueda unificada', () => {
  beforeEach(() => { clearStorages(); seedAuth(); });

  it('T163: busca clientes y oportunidades por texto y muestra tipo/etiqueta/detalle', async () => {
    seed();
    await bootApp();
    document.querySelector('#nav-search').click();
    const input = document.querySelector('#search-input');
    input.value = 'Acme';
    input.dispatchEvent(new Event('input', { bubbles: true }));

    const items = [...document.querySelectorAll('#search-results-list [data-search-type]')];
    expect(items.length).toBeGreaterThanOrEqual(1);
    expect(items.some((i) => i.dataset.searchType === 'client')).toBe(true);
    expect(items.some((i) => i.dataset.searchType === 'opportunity')).toBe(true);
    const text = document.querySelector('#search-results-list').textContent;
    expect(text).toContain('Cliente');
    expect(text).toContain('Oportunidad');
    expect(text).toContain('Acme');

    input.value = 'Negociación';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    const oppOnly = [...document.querySelectorAll('#search-results-list [data-search-type]')];
    expect(oppOnly.length).toBe(1);
    expect(oppOnly[0].dataset.searchType).toBe('opportunity');
  });

  it('T163: muestra estado vacío claro cuando no hay coincidencias', async () => {
    seed();
    await bootApp();
    document.querySelector('#nav-search').click();
    const input = document.querySelector('#search-input');
    input.value = 'zzzz-no-existe';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    const empty = document.querySelector('#search-empty');
    expect(empty.hidden).toBe(false);
    expect(empty.textContent).toMatch(/no hay coincidencias|sin coincidencias|no se encontraron/i);
    expect(document.querySelectorAll('#search-results-list [data-search-type]')).toHaveLength(0);
  });
});
