import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mountLiveDom } from './live-dom.js';
import { boot } from '../../src/app.js';

function compactViewport(active) {
  window.matchMedia = (query) => ({
    matches: active && query.includes('900px'),
    media: query,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent: () => false
  });
}

describe('sidebar collapse', () => {
  const originalMatchMedia = window.matchMedia;

  beforeEach(async () => {
    mountLiveDom();
    localStorage.setItem('erp.authenticatedUser', 'Jefe');
    await boot();
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it('collapses, announces the state and persists it for the session', () => {
    const toggle = document.querySelector('#menu-toggle');
    toggle.click();

    expect(document.querySelector('#app-shell').classList.contains('sidebar-collapsed')).toBe(true);
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(toggle.getAttribute('aria-label')).toBe('Expandir menú lateral');
    expect(sessionStorage.getItem('erp.sidebarCollapsed')).toBe('true');
  });

  it('keeps the active section when collapsing', () => {
    document.querySelector('#nav-entities').click();
    document.querySelector('#menu-toggle').click();

    expect(document.querySelector('#nav-entities').getAttribute('aria-current')).toBe('page');
    expect(document.querySelector('#app-shell').classList.contains('sidebar-collapsed')).toBe(true);
  });

  it('restores the saved state after a reload', async () => {
    sessionStorage.setItem('erp.sidebarCollapsed', 'true');
    mountLiveDom();
    await boot();

    expect(document.querySelector('#app-shell').classList.contains('sidebar-collapsed')).toBe(true);
    expect(document.querySelector('#menu-toggle').getAttribute('aria-expanded')).toBe('false');
  });

  it('closes the mobile overlay with Escape and returns focus', () => {
    compactViewport(true);
    const toggle = document.querySelector('#menu-toggle');
    toggle.click();

    expect(document.querySelector('#app-shell').classList.contains('sidebar-collapsed')).toBe(true);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

    expect(document.querySelector('#app-shell').classList.contains('sidebar-collapsed')).toBe(false);
    expect(document.activeElement).toBe(toggle);
  });

  it('clears the preference on logout', async () => {
    sessionStorage.setItem('erp.sidebarCollapsed', 'true');
    vi.resetModules();
    await import('../../src/main.js');
    document.querySelector('#logout-button').click();

    expect(sessionStorage.getItem('erp.sidebarCollapsed')).toBeNull();
  });
});
