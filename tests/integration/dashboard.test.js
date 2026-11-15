import { describe, expect, it } from 'vitest';
import { click, getForm, mountApp } from '../helpers.js';
import { addClient, addEmployee, addOpportunity } from '../../src/storage.js';
import { addDays, toDateOnly } from '../../src/domain.js';

function statValue(root, key) {
  return root.querySelector(`[data-stat="${key}"] .stat-value`)?.textContent.trim() ?? '';
}

describe('US7 - panel de indicadores', () => {
  it('shows zeroed indicators and quick actions with no data', () => {
    const { root } = mountApp();

    expect(statValue(root, 'activeClients')).toBe('0');
    expect(statValue(root, 'openOpportunities')).toBe('0');
    expect(statValue(root, 'upcomingCloses')).toBe('0');
    expect(root.querySelectorAll('.quick-action')).toHaveLength(4);
  });

  it('reflects active clients, open opportunities, pipeline and upcoming closes', () => {
    const activeClient = addClient({
      nombreEmpresa: 'Activa',
      personaContacto: 'Ana',
      correo: 'activa@acme.cl',
      telefono: '1',
      estado: 'Activo'
    });
    addClient({
      nombreEmpresa: 'Posible',
      personaContacto: 'Beto',
      correo: 'posible@acme.cl',
      telefono: '2'
    });
    const employee = addEmployee({ nombre: 'Luis', cargo: 'Ejecutivo' });

    const soon = toDateOnly(addDays(new Date(), 10));
    const far = toDateOnly(addDays(new Date(), 60));
    addOpportunity({
      clienteId: activeClient.id,
      empleadoId: employee.id,
      montoEstimado: 1000,
      fechaEstimadaCierre: soon
    });
    addOpportunity({
      clienteId: activeClient.id,
      empleadoId: employee.id,
      montoEstimado: 500,
      fechaEstimadaCierre: far
    });
    addOpportunity({
      clienteId: activeClient.id,
      empleadoId: employee.id,
      montoEstimado: 3000,
      etapa: 'Ganado',
      fechaEstimadaCierre: soon
    });

    const { root } = mountApp();
    expect(statValue(root, 'activeClients')).toBe('1');
    expect(statValue(root, 'openOpportunities')).toBe('2');
    expect(statValue(root, 'pipelineTotal').replace(/\D/g, '')).toBe('1500');
    expect(statValue(root, 'upcomingCloses')).toBe('1');
  });

  it('uses quick actions to open the creation forms', () => {
    const { root } = mountApp();
    click(root, '[data-action="new-client"]');
    expect(getForm(root, 'client')).toBeTruthy();
  });

  it('uses the clients quick action to reach the list', () => {
    const { root } = mountApp();
    click(root, '[data-action="nav-clients"]');
    expect(root.querySelector('[data-action="new-client"]')).toBeTruthy();
    expect(root.textContent).toContain('Clientes');
  });
});
