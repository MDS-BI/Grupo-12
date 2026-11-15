import { describe, expect, it } from 'vitest';
import { click, createEmployee, fillForm, getForm, mountApp, submit } from '../helpers.js';
import { loadEmployees } from '../../src/storage.js';

describe('US2 - catálogo de empleados', () => {
  it('creates and lists an employee', () => {
    const { root } = mountApp();
    createEmployee(root, { nombre: 'Luis Soto', cargo: 'Ejecutivo' });

    expect(root.textContent).toContain('Luis Soto');
    expect(loadEmployees()).toHaveLength(1);
  });

  it('shows validation errors when name or cargo is missing', () => {
    const { root } = mountApp();
    click(root, '[data-nav="employees"]');
    click(root, '[data-action="new-employee"]');
    submit(getForm(root, 'employee'));

    expect(root.textContent).toMatch(/obligatorio/i);
    expect(loadEmployees()).toHaveLength(0);
  });

  it('edits an employee and exposes it as an assignable responsible', () => {
    const { root } = mountApp();
    createEmployee(root, { nombre: 'Luis Soto', cargo: 'Ejecutivo' });

    click(root, '[data-action="edit-employee"]');
    const form = getForm(root, 'employee');
    fillForm(form, { cargo: 'Gerente' });
    submit(form);
    expect(loadEmployees()[0].cargo).toBe('Gerente');

    click(root, '[data-nav="opportunities"]');
    click(root, '[data-action="new-opportunity"]');
    const options = Array.from(
      getForm(root, 'opportunity').elements.namedItem('empleadoId').options
    ).map((option) => option.textContent);
    expect(options).toContain('Luis Soto');
  });
});
