import { initApp } from '../src/app.js';
import { loadModuleConfig } from '../src/module-config.js';

export function mountApp(source) {
  const root = document.createElement('div');
  root.id = 'app';
  document.body.appendChild(root);
  const { config, errors } = loadModuleConfig(source);
  initApp({ root, config, configErrors: errors });
  return { root, config };
}

export function getButton(root, selector) {
  const element = root.querySelector(selector);
  if (!element) throw new Error(`No se encontró el elemento: ${selector}`);
  return element;
}

export function click(root, selector) {
  const element = getButton(root, selector);
  element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  return element;
}

export function getForm(root, type) {
  const form = root.querySelector(`form[data-form="${type}"]`);
  if (!form) throw new Error(`No se encontró el formulario: ${type}`);
  return form;
}

export function fillForm(form, values) {
  for (const [name, value] of Object.entries(values)) {
    const field = form.elements.namedItem(name);
    if (field) field.value = String(value);
  }
}

export function submit(form) {
  form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
}

export function createClient(root, data) {
  click(root, '[data-nav="clients"]');
  click(root, '[data-action="new-client"]');
  const form = getForm(root, 'client');
  fillForm(form, data);
  submit(form);
}

export function createEmployee(root, data) {
  click(root, '[data-nav="employees"]');
  click(root, '[data-action="new-employee"]');
  const form = getForm(root, 'employee');
  fillForm(form, data);
  submit(form);
}
