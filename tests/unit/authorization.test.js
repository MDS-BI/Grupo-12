import { beforeEach, describe, expect, it } from 'vitest';
import {
  AUTH_STORAGE_KEY,
  ROLES,
  authenticate,
  canAccessModule,
  canPerformAction,
  clearInvalidAuthenticatedUsers,
  getAuthenticatedUser,
  getRoleForUser,
  persistAuthenticatedUser
} from '../../src/authorization.js';

describe('authorization', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('authenticates only the two configured test accounts', () => {
    expect(authenticate('Jefe', 'Jefe123')).toEqual({ username: 'Jefe', role: ROLES.BOSS });
    expect(authenticate('Empleado', 'Empleado123')).toEqual({ username: 'Empleado', role: ROLES.EMPLOYEE });
    expect(authenticate('Cliente1', '1234')).toBeNull();
    expect(authenticate('Jefe', 'Empleado123')).toBeNull();
    expect(authenticate('jefe', 'Jefe123')).toBeNull();
  });

  it('derives the role from a valid stored identity without storing credentials', () => {
    persistAuthenticatedUser('Empleado', { remember: false });

    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
    expect(sessionStorage.getItem(AUTH_STORAGE_KEY)).toBe('Empleado');
    expect(getAuthenticatedUser()).toEqual({ username: 'Empleado', role: ROLES.EMPLOYEE });
    expect(getRoleForUser('Cliente1')).toBeNull();
  });

  it('clears only invalid authentication values', () => {
    localStorage.setItem(AUTH_STORAGE_KEY, 'Cliente1');
    localStorage.setItem('crm_module:customers', '[{"id":"keep"}]');
    sessionStorage.setItem('unrelated', 'keep');

    clearInvalidAuthenticatedUsers();

    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
    expect(localStorage.getItem('crm_module:customers')).toBe('[{"id":"keep"}]');
    expect(sessionStorage.getItem('unrelated')).toBe('keep');
  });

  it('allows Jefe all existing modules and mutations', () => {
    for (const moduleName of ['dashboard', 'entities', 'documents', 'employees', 'interactions', 'calendar', 'search']) {
      expect(canAccessModule(ROLES.BOSS, moduleName)).toBe(true);
      expect(canPerformAction(ROLES.BOSS, moduleName, 'delete')).toBe(true);
    }
  });

  it('limits Empleado to operational modules and basic actions', () => {
    for (const moduleName of ['dashboard', 'entities', 'documents', 'interactions', 'calendar', 'search', 'client-360']) {
      expect(canAccessModule(ROLES.EMPLOYEE, moduleName)).toBe(true);
    }
    expect(canAccessModule(ROLES.EMPLOYEE, 'employees')).toBe(false);
    expect(canPerformAction(ROLES.EMPLOYEE, 'interactions', 'create')).toBe(true);
    expect(canPerformAction(ROLES.EMPLOYEE, 'documents', 'update-status')).toBe(true);
    expect(canPerformAction(ROLES.EMPLOYEE, 'calendar', 'update-status')).toBe(true);
    expect(canPerformAction(ROLES.EMPLOYEE, 'entities', 'edit')).toBe(false);
    expect(canPerformAction(ROLES.EMPLOYEE, 'documents', 'delete')).toBe(false);
    expect(canPerformAction(ROLES.EMPLOYEE, 'employees', 'view')).toBe(false);
  });
});
