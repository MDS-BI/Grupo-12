import { afterEach, beforeEach } from 'vitest';

function createStorage() {
  const entries = new Map();
  return {
    get length() {
      return entries.size;
    },
    key(index) {
      return [...entries.keys()][index] ?? null;
    },
    getItem(key) {
      return entries.has(String(key)) ? entries.get(String(key)) : null;
    },
    setItem(key, value) {
      entries.set(String(key), String(value));
    },
    removeItem(key) {
      entries.delete(String(key));
    },
    clear() {
      entries.clear();
    }
  };
}

for (const name of ['localStorage', 'sessionStorage']) {
  if (!globalThis[name]) {
    Object.defineProperty(globalThis, name, { value: createStorage(), configurable: true, writable: true });
  }
  if (globalThis.window && !globalThis.window[name]) {
    Object.defineProperty(globalThis.window, name, { value: globalThis[name], configurable: true, writable: true });
  }
}

beforeEach(() => {
  window.localStorage.clear();
  window.sessionStorage.clear();
  window.history.replaceState({}, '', '/');
  document.body.innerHTML = '';
  delete window.__CRM_CONFIG__;
});

afterEach(() => {
  window.localStorage.clear();
  window.sessionStorage.clear();
});
