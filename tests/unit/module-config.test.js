import { describe, expect, it } from 'vitest';
import {
  customFieldsFor,
  loadModuleConfig,
  resolveLabel
} from '../../src/module-config.js';

describe('module configuration', () => {
  it('falls back to CRM defaults when no configuration is provided', () => {
    const { config, errors } = loadModuleConfig(undefined);
    expect(errors).toEqual([]);
    expect(config.moduleName).toBe('Módulo CRM');
    expect(config.opportunityLifecycle.stages).toEqual([
      'Evaluación',
      'Propuesta',
      'Negociación',
      'Ganado',
      'Perdido'
    ]);
    expect(config.theme.accentColor).toBe('#0f62fe');
  });

  it('applies labels, custom fields, lifecycle and accent colour', () => {
    const { config, errors } = loadModuleConfig({
      moduleName: 'Ventas',
      labels: { cliente: 'Cuenta', clientes: 'Cuentas' },
      customFields: [
        { target: 'cliente', key: 'segmento', label: 'Segmento', type: 'select', options: ['A', 'B'], required: true }
      ],
      opportunityLifecycle: {
        stages: ['Evaluación', 'Propuesta', 'Ganado'],
        transitions: { Evaluación: ['Propuesta'], Propuesta: ['Ganado'], Ganado: [] }
      },
      theme: { accentColor: '#ff0000' }
    });
    expect(errors).toEqual([]);
    expect(config.moduleName).toBe('Ventas');
    expect(resolveLabel(config, 'cliente', 'Cliente')).toBe('Cuenta');
    expect(resolveLabel(config, 'empleado', 'Empleado')).toBe('Empleado');
    expect(customFieldsFor(config, 'cliente')).toHaveLength(1);
    expect(config.opportunityLifecycle.transitions.Propuesta).toEqual(['Ganado']);
    expect(config.theme.accentColor).toBe('#ff0000');
  });

  it('reports invalid configuration clearly', () => {
    const { errors } = loadModuleConfig({
      moduleName: '',
      labels: { cliente: 42 },
      customFields: [
        { target: 'cliente', key: 'correo', label: 'Correo', type: 'text' },
        { target: 'cliente', key: 'foo', label: 'Foo', type: 'unknown' },
        { target: 'otro', key: 'bar', label: 'Bar', type: 'text' }
      ],
      opportunityLifecycle: {
        stages: ['Evaluación'],
        transitions: { Evaluación: ['Inexistente'] }
      },
      theme: { accentColor: 'not a color!' }
    });
    expect(errors.length).toBeGreaterThanOrEqual(5);
    expect(errors.join(' ')).toMatch(/moduleName/);
    expect(errors.join(' ')).toMatch(/choca con un campo base/);
    expect(errors.join(' ')).toMatch(/tipo no soportado/);
    expect(errors.join(' ')).toMatch(/destino desconocido/);
    expect(errors.join(' ')).toMatch(/accentColor/);
  });
});
