import { describe, expect, it } from 'vitest';
import { click, mountApp } from '../helpers.js';
import {
  addClient,
  addEmployee,
  addOpportunity
} from '../../src/storage.js';

function seed() {
  const acme = addClient({
    nombreEmpresa: 'Acme',
    personaContacto: 'Ana',
    correo: 'ana@acme.cl',
    telefono: '1',
    estado: 'Activo'
  });
  const beta = addClient({
    nombreEmpresa: 'Beta',
    personaContacto: 'Beto',
    correo: 'beto@beta.cl',
    telefono: '2',
    estado: 'Posible'
  });
  const luis = addEmployee({ nombre: 'Luis Soto', cargo: 'Ejecutivo' });
  const marta = addEmployee({ nombre: 'Marta Ruiz', cargo: 'Gerente' });
  addOpportunity({
    clienteId: acme.id,
    empleadoId: luis.id,
    montoEstimado: 100,
    etapa: 'Propuesta',
    fechaEstimadaCierre: '2026-03-10'
  });
  addOpportunity({
    clienteId: beta.id,
    empleadoId: marta.id,
    montoEstimado: 200,
    etapa: 'Negociación',
    fechaEstimadaCierre: '2026-04-10'
  });
  return { acme, beta, luis, marta };
}

function searchRoot() {
  const { root } = mountApp();
  click(root, '[data-nav="search"]');
  return root;
}

function setField(root, name, value, eventName = 'input') {
  const field = root.querySelector(`[data-form="search"] [name="${name}"]`);
  field.value = value;
  field.dispatchEvent(new Event(eventName, { bubbles: true }));
}

describe('US8 - búsqueda y filtros', () => {
  it('filters clients by text in company, contact, email or state', () => {
    seed();
    const root = searchRoot();

    setField(root, 'query', 'acm');
    expect(root.querySelectorAll('#search-results [data-search-client]')).toHaveLength(1);
    expect(root.querySelector('#search-results').textContent).toContain('Acme');

    setField(root, 'query', 'posible');
    expect(root.querySelectorAll('#search-results [data-search-client]')).toHaveLength(1);
    expect(root.querySelector('#search-results').textContent).toContain('Beta');
  });

  it('filters opportunities by stage and responsible', () => {
    const { marta } = seed();
    const root = searchRoot();

    setField(root, 'etapa', 'Negociación', 'change');
    const byStage = root.querySelectorAll('#search-results [data-search-opportunity]');
    expect(byStage).toHaveLength(1);
    expect(byStage[0].textContent).toContain('Beta');

    setField(root, 'etapa', '', 'change');
    setField(root, 'empleadoId', marta.id, 'change');
    const byEmployee = root.querySelectorAll('#search-results [data-search-opportunity]');
    expect(byEmployee).toHaveLength(1);
    expect(byEmployee[0].textContent).toContain('Marta Ruiz');
  });

  it('filters opportunities by close date range', () => {
    seed();
    const root = searchRoot();

    setField(root, 'fechaDesde', '2026-04-01');
    setField(root, 'fechaHasta', '2026-04-30', 'change');

    const rows = root.querySelectorAll('#search-results [data-search-opportunity]');
    expect(rows).toHaveLength(1);
    expect(rows[0].textContent).toContain('2026-04-10');
  });

  it('shows empty states when nothing matches', () => {
    seed();
    const root = searchRoot();

    setField(root, 'query', 'inexistente');
    expect(root.querySelectorAll('#search-results [data-search-client]')).toHaveLength(0);
    expect(root.querySelector('#search-results').textContent).toMatch(/No se encontraron clientes/i);
  });
});
