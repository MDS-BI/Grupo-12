import './styles.css';
import { loadModuleConfig } from './module-config.js';
import { AUTH_STORAGE_KEY, SIDEBAR_STORAGE_KEY, initApp } from './app.js';

export const THEME_STORAGE_KEY = 'crm.theme';
const VALID_USER = 'Cliente1';
const VALID_PASSWORD = '1234';

const { config } = loadModuleConfig();

function isAuthenticated() {
  return localStorage.getItem(AUTH_STORAGE_KEY) === VALID_USER;
}

function setAuthenticated() {
  localStorage.setItem(AUTH_STORAGE_KEY, VALID_USER);
}

function clearAuthenticated() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  sessionStorage.removeItem(SIDEBAR_STORAGE_KEY);
}

function navigate(path) {
  if (window.location.pathname !== path) {
    window.history.pushState({}, '', path);
  }
  renderRoute();
}

function setPasswordVisibility(password, toggle, visible) {
  if (!password || !toggle) return;
  password.type = visible ? 'text' : 'password';
  toggle.setAttribute('aria-pressed', String(visible));
  toggle.setAttribute('aria-label', visible ? 'Ocultar contraseña' : 'Mostrar contraseña');
}

function showLogin(errorMessage = '') {
  const loginView = document.getElementById('login-view');
  const appShell = document.getElementById('app-shell');
  const errorNode = document.getElementById('login-error');
  const password = document.getElementById('login-password');
  if (appShell) appShell.hidden = true;
  if (loginView) loginView.hidden = false;
  if (errorNode) errorNode.textContent = errorMessage;
  if (password) {
    password.value = '';
    setPasswordVisibility(password, document.getElementById('login-password-toggle'), false);
  }
  document.title = 'Iniciar sesión';
}

async function showApp() {
  const loginView = document.getElementById('login-view');
  const appShell = document.getElementById('app-shell');
  if (loginView) loginView.hidden = true;
  if (appShell) appShell.hidden = false;
  await initApp({ config });
}

async function renderRoute() {
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  const authed = isAuthenticated();

  if (path === '/' || path === '/index.html') {
    if (authed) {
      navigate('/inicio');
      return;
    }
    showLogin();
    return;
  }

  if (path === '/inicio') {
    if (!authed) {
      navigate('/');
      return;
    }
    await showApp();
    return;
  }

  navigate(authed ? '/inicio' : '/');
}

function bindAuthHandlers() {
  const form = document.getElementById('login-form');
  const logout = document.getElementById('logout-button');

  if (form && !form.dataset.bound) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const username = document.getElementById('login-username')?.value ?? '';
      const password = document.getElementById('login-password')?.value ?? '';
      if (username === VALID_USER && password === VALID_PASSWORD) {
        setAuthenticated();
        navigate('/inicio');
      } else {
        showLogin('Usuario o contraseña incorrectos.');
      }
    });
    form.dataset.bound = 'true';
  }

  if (logout && !logout.dataset.bound) {
    logout.addEventListener('click', () => {
      clearAuthenticated();
      navigate('/');
    });
    logout.dataset.bound = 'true';
  }

  window.addEventListener('popstate', () => {
    void renderRoute();
  });
}

function normalizeTheme(value) {
  return value === 'Oscuro' ? 'Oscuro' : 'Claro';
}

export function applyTheme(theme) {
  const normalized = normalizeTheme(theme);
  const datasetValue = normalized === 'Oscuro' ? 'dark' : 'light';
  document.documentElement.dataset.theme = datasetValue;
  return normalized;
}

export function bindThemeSelector() {
  const selector = document.getElementById('theme-select');
  if (!selector || selector.dataset.bound) return;
  let stored = 'Claro';
  try {
    stored = localStorage.getItem(THEME_STORAGE_KEY) || 'Claro';
  } catch {
    stored = 'Claro';
  }
  selector.value = applyTheme(stored);
  selector.addEventListener('change', () => {
    const theme = applyTheme(selector.value);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Ignore storage write failures; theme is still applied for the session.
    }
  });
  selector.dataset.bound = 'true';
}

function bindPasswordToggle() {
  const toggle = document.getElementById('login-password-toggle');
  const password = document.getElementById('login-password');
  if (!toggle || !password || toggle.dataset.bound) return;
  toggle.addEventListener('click', () => {
    setPasswordVisibility(password, toggle, password.type === 'password');
    password.focus();
  });
  toggle.dataset.bound = 'true';
}

bindThemeSelector();
bindAuthHandlers();
bindPasswordToggle();
void renderRoute();
