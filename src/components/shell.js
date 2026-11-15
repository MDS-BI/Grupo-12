import { escapeHtml } from '../sanitize.js';
import { resolveLabel } from '../module-config.js';

const NAV_ITEMS = [
  { view: 'dashboard', key: 'panel', fallback: 'Panel' },
  { view: 'clients', key: 'clientes', fallback: 'Clientes' },
  { view: 'employees', key: 'empleados', fallback: 'Empleados' },
  { view: 'opportunities', key: 'oportunidades', fallback: 'Oportunidades' },
  { view: 'interactions', key: 'interacciones', fallback: 'Interacciones' },
  { view: 'search', key: 'busqueda', fallback: 'Búsqueda' }
];

function monogram(moduleName) {
  const words = String(moduleName)
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .split(/\s+/)
    .filter(Boolean);
  if (!words.length) return 'CRM';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export function renderShell({ config, activeView, content, notices = [] }) {
  const moduleName = escapeHtml(config.moduleName);
  const initials = escapeHtml(monogram(config.moduleName));
  const nav = NAV_ITEMS.map((item) => {
    const label = resolveLabel(config, item.key, item.fallback);
    const active = item.view === activeView;
    return `<button type="button" class="nav-item ${active ? 'nav-item--active' : ''}" data-nav="${item.view}" ${active ? 'aria-current="page"' : ''}>
      <span class="nav-icon" aria-hidden="true">${escapeHtml(label.slice(0, 1))}</span>
      <span class="nav-label">${escapeHtml(label)}</span>
    </button>`;
  }).join('');

  const noticesHtml = notices.length
    ? `<div class="notices">${notices
        .map(
          (notice) =>
            `<div class="notice notice--${escapeHtml(notice.type)}" role="status">${escapeHtml(notice.message)}</div>`
        )
        .join('')}</div>`
    : '';

  return `
    <div class="workspace">
      <header class="topbar">
        <div class="brand">
          <svg class="brand-logo" viewBox="0 0 48 48" role="img" aria-label="${moduleName}">
            <rect x="2" y="2" width="44" height="44" rx="12" fill="var(--accent)" />
            <text x="24" y="31" text-anchor="middle" font-family="system-ui, sans-serif" font-size="18" font-weight="700" fill="#ffffff">${initials}</text>
          </svg>
          <h1 class="brand-name">${moduleName}</h1>
        </div>
      </header>
      <aside class="sidebar" aria-label="Navegación del módulo">
        ${nav}
      </aside>
      <main class="content" id="view">
        ${noticesHtml}
        ${content}
      </main>
    </div>
  `;
}
