import { beforeEach, describe, expect, it } from 'vitest';
import { addCustomer, deleteCustomer, isEmailAvailable, updateCustomer, validateCustomer } from '../../src/storage.js';

function customerData(overrides = {}) {
  return {
    companyName: 'Acme SpA',
    contactName: 'Ana Pérez',
    email: 'ana@acme.cl',
    phone: '912345678',
    status: 'Activo',
    ...overrides
  };
}

beforeEach(() => {
  localStorage.clear();
});

describe('FR-069 - correo reservado de clientes archivados', () => {
  it('rechaza reutilizar el correo de un cliente archivado con otra capitalización', () => {
    const archived = addCustomer(customerData());
    deleteCustomer(archived.id);

    expect(isEmailAvailable('ANA@ACME.CL')).toBe(false);
    const validation = validateCustomer(customerData({ companyName: 'Otra SpA', email: 'ANA@ACME.CL' }));
    expect(validation.valid).toBe(false);
    expect(validation.errors.email).toMatch(/ya está en uso/i);
    expect(() => addCustomer(customerData({ companyName: 'Otra SpA', email: 'ANA@ACME.CL' }))).toThrow(/correo/i);
  });

  it('mantiene la unicidad al actualizar otro cliente', () => {
    const archived = addCustomer(customerData());
    const other = addCustomer(customerData({ companyName: 'Beta SpA', contactName: 'Bruno', email: 'bruno@beta.cl' }));
    deleteCustomer(archived.id);

    expect(() => updateCustomer(other.id, { email: 'ana@acme.cl' })).toThrow(/correo/i);
  });

  it('permite actualizar el propio registro archivado sin cambiar su correo', () => {
    const archived = addCustomer(customerData());
    deleteCustomer(archived.id);

    const updated = updateCustomer(archived.id, { status: 'Inactivo' });
    expect(updated.email).toBe('ana@acme.cl');
    expect(isEmailAvailable('ana@acme.cl', archived.id)).toBe(true);
  });
});
