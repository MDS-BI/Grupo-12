import { afterEach, beforeEach } from 'vitest';

beforeEach(() => {
  window.localStorage.clear();
  document.body.innerHTML = '';
  delete window.__CRM_CONFIG__;
});

afterEach(() => {
  window.localStorage.clear();
});
