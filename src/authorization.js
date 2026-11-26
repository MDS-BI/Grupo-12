export const AUTH_STORAGE_KEY = 'erp.authenticatedUser';

export const ROLES = Object.freeze({
  BOSS: 'Jefe',
  EMPLOYEE: 'Empleado'
});

const TEST_USERS = new Map([
  ['Jefe', Object.freeze({ password: 'Jefe123', role: ROLES.BOSS })],
  ['Empleado', Object.freeze({ password: 'Empleado123', role: ROLES.EMPLOYEE })]
]);

const KNOWN_MODULES = new Set([
  'dashboard',
  'entities',
  'documents',
  'employees',
  'interactions',
  'calendar',
  'search',
  'client-360'
]);

const EMPLOYEE_MODULES = new Set([
  'dashboard',
  'entities',
  'documents',
  'interactions',
  'calendar',
  'search',
  'client-360'
]);

const EMPLOYEE_ACTIONS = new Map([
  ['interactions', new Set(['create'])],
  ['documents', new Set(['update-status'])],
  ['calendar', new Set(['update-status'])]
]);

export function authenticate(username, password) {
  const account = TEST_USERS.get(username);
  if (!account || account.password !== password) return null;
  return { username, role: account.role };
}

export function getRoleForUser(username) {
  return TEST_USERS.get(username)?.role || null;
}

export function getAuthenticatedUser() {
  const localUser = localStorage.getItem(AUTH_STORAGE_KEY);
  const sessionUser = sessionStorage.getItem(AUTH_STORAGE_KEY);
  const username = getRoleForUser(localUser) ? localUser : sessionUser;
  const role = getRoleForUser(username);
  return role ? { username, role } : null;
}

export function persistAuthenticatedUser(username, { remember = true } = {}) {
  const role = getRoleForUser(username);
  if (!role) throw new Error('No se puede guardar una identidad no autenticada.');

  localStorage.removeItem(AUTH_STORAGE_KEY);
  sessionStorage.removeItem(AUTH_STORAGE_KEY);
  const storage = remember ? localStorage : sessionStorage;
  storage.setItem(AUTH_STORAGE_KEY, username);
  return { username, role };
}

export function clearAuthenticatedUser() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  sessionStorage.removeItem(AUTH_STORAGE_KEY);
}

export function clearInvalidAuthenticatedUsers() {
  for (const storage of [localStorage, sessionStorage]) {
    const username = storage.getItem(AUTH_STORAGE_KEY);
    if (username && !getRoleForUser(username)) {
      storage.removeItem(AUTH_STORAGE_KEY);
    }
  }
}

export function canAccessModule(role, moduleName) {
  if (!KNOWN_MODULES.has(moduleName)) return false;
  if (role === ROLES.BOSS) return true;
  return role === ROLES.EMPLOYEE && EMPLOYEE_MODULES.has(moduleName);
}

export function canPerformAction(role, moduleName, action) {
  if (!canAccessModule(role, moduleName)) return false;
  if (role === ROLES.BOSS) return true;
  if (action === 'view') return true;
  return EMPLOYEE_ACTIONS.get(moduleName)?.has(action) || false;
}
