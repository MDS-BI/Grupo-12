import { describe, expect, it } from 'vitest';
import { mountLiveDom } from '../integration/live-dom.js';

function iconAttributes(selector) {
  const icon = document.querySelector(selector);
  expect(icon, selector).toBeTruthy();
  return icon;
}

describe('SVG icon contract', () => {
  it('normalizes the password and menu icons', () => {
    mountLiveDom();
    const selectors = ['.icon-eye', '.icon-eye-off', '#menu-toggle svg'];

    for (const selector of selectors) {
      const icon = iconAttributes(selector);
      expect(icon.getAttribute('viewBox')).toBe('0 0 24 24');
      expect(icon.getAttribute('fill')).toBe('none');
      expect(icon.getAttribute('stroke')).toBe('currentColor');
      expect(icon.getAttribute('stroke-width')).toBe('2');
      expect(icon.getAttribute('stroke-linecap')).toBe('round');
      expect(icon.getAttribute('stroke-linejoin')).toBe('round');
      expect(icon.getAttribute('aria-hidden')).toBe('true');
      expect(icon.getAttribute('focusable')).toBe('false');
      expect(icon.hasAttribute('width')).toBe(false);
      expect(icon.hasAttribute('height')).toBe(false);
    }
  });

  it('keeps the accessible name on the buttons', () => {
    mountLiveDom();
    expect(document.querySelector('#login-password-toggle').getAttribute('aria-label')).toBe('Mostrar contraseña');
    expect(document.querySelector('#menu-toggle').getAttribute('aria-label')).toBe('Contraer menú lateral');
    expect(document.querySelector('#menu-toggle').getAttribute('aria-controls')).toBe('sidebar');
  });
});
