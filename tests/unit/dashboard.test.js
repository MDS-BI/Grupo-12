import { describe, expect, it } from 'vitest';
import {
  addClient,
  addEmployee,
  addOpportunity,
  getDashboardMetrics
} from '../../src/storage.js';

describe('dashboard metrics from storage', () => {
  it('reflects active clients, open opportunities, pipeline and 30-day closes', () => {
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
      telefono: '2',
      estado: 'Posible'
    });
    const employee = addEmployee({ nombre: 'Luis', cargo: 'Ejecutivo' });

    addOpportunity({
      clienteId: activeClient.id,
      empleadoId: employee.id,
      montoEstimado: 1000,
      fechaEstimadaCierre: '2026-03-20'
    });
    addOpportunity({
      clienteId: activeClient.id,
      empleadoId: employee.id,
      montoEstimado: 500,
      fechaEstimadaCierre: '2026-05-01'
    });
    addOpportunity({
      clienteId: activeClient.id,
      empleadoId: employee.id,
      montoEstimado: 5000,
      etapa: 'Ganado',
      fechaEstimadaCierre: '2026-03-20'
    });

    const metrics = getDashboardMetrics(new Date(2026, 2, 15));
    expect(metrics.activeClients).toBe(1);
    expect(metrics.openOpportunities).toBe(2);
    expect(metrics.pipelineTotal).toBe(1500);
    expect(metrics.upcomingCloses).toBe(1);
  });
});
