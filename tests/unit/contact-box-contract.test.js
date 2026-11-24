import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { mountLiveDom } from '../integration/live-dom.js';

const css = readFileSync(resolve(process.cwd(), 'src/styles.css'), 'utf8');
const FIELDS = ['email', 'phone', 'address', 'hours'];

function childIndex(parent, node) {
  return [...parent.children].indexOf(node);
}

describe('US31 contact box contract', () => {
  it('places both boxes in the real login and dashboard DOM', () => {
    mountLiveDom();

    const loginPanel = document.querySelector('.login-form-panel');
    const loginFooter = document.querySelector('.login-footer');
    const loginContact = document.querySelector('#login-contact-info');
    const dashboard = document.querySelector('#view-dashboard');
    const welcome = document.querySelector('.welcome-banner');
    const dashboardContact = document.querySelector('#dashboard-contact-info');
    const actions = document.querySelector('.quick-actions');

    expect(loginPanel).toBeTruthy();
    expect(loginFooter).toBeTruthy();
    expect(loginContact).toBeTruthy();
    expect(loginContact.classList.contains('contact-info')).toBe(true);
    expect(loginContact.closest('.login-form-panel')).toBe(loginPanel);
    expect(loginContact.parentElement).toBe(loginFooter.parentElement);
    expect(childIndex(loginFooter.parentElement, loginContact)).toBeGreaterThan(childIndex(loginFooter.parentElement, loginFooter));

    expect(dashboard).toBeTruthy();
    expect(welcome).toBeTruthy();
    expect(dashboardContact).toBeTruthy();
    expect(actions).toBeTruthy();
    expect(dashboardContact.classList.contains('contact-info')).toBe(true);
    expect(dashboardContact.parentElement).toBe(dashboard);
    expect(childIndex(dashboard, dashboardContact)).toBeGreaterThan(childIndex(dashboard, welcome));
    expect(childIndex(dashboard, dashboardContact)).toBeLessThan(childIndex(dashboard, actions));
  });

  it('defines unique titles, four fields and one SVG per field in both boxes', () => {
    mountLiveDom();

    for (const target of ['login', 'dashboard']) {
      const section = document.querySelector(`#${target}-contact-info`);
      expect(section).toBeTruthy();

      const title = section.querySelector('.contact-info-title');
      expect(title).toBeTruthy();
      expect(title.id).toBe(`${target}-contact-info-title`);
      expect(title.textContent).toBe('Contáctanos');
      expect(section.getAttribute('aria-labelledby')).toBe(title.id);

      for (const field of FIELDS) {
        const value = section.querySelector(`[data-contact-field="${field}"]`);
        expect(value).toBeTruthy();
        const icon = value.closest('.contact-info-item')?.querySelector('.contact-icon svg');
        expect(icon).toBeTruthy();
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

      expect(section.querySelectorAll('.contact-icon svg')).toHaveLength(4);
    }
  });

  it('uses theme tokens and stacks the grid at 900 px and 640 px', () => {
    const contactBlock = css.match(/\.contact-info\s*\{[^}]*\}/s)?.[0] ?? '';
    const iconBlock = css.match(/\.contact-icon\s*\{[^}]*\}/s)?.[0] ?? '';
    const darkBlock = css.match(/:root\[data-theme='dark'\]\s+\.contact-info\s*\{[^}]*\}/s)?.[0] ?? '';

    expect(contactBlock).toMatch(/display:\s*grid/);
    for (const token of ['--panel', '--border', '--text', '--shadow-card', '--radius-lg']) {
      expect(contactBlock).toContain(`var(${token})`);
    }
    expect(iconBlock).toContain('var(--accent-soft)');
    expect(css).toContain('var(--muted)');

    expect(css).toMatch(/@media\s*\(max-width:\s*900px\)\s*\{[\s\S]*?\.contact-info\s*\{[^}]*grid-template-columns:\s*1fr/s);
    expect(css).toMatch(/@media\s*\(max-width:\s*640px\)\s*\{[\s\S]*?\.contact-info\s*\{[^}]*grid-template-columns:\s*1fr/s);

    expect(darkBlock).toMatch(/background:\s*var\(--panel\)/);
    expect(darkBlock).not.toMatch(/#fff|#ffffff|white/i);
  });
});
