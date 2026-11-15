import './styles.css';
import { loadModuleConfig } from './module-config.js';
import { initApp } from './app.js';

const { config, errors } = loadModuleConfig();

initApp({
  root: document.getElementById('app'),
  config,
  configErrors: errors
});
