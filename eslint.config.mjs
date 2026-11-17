import js from '@eslint/js';
import globals from 'globals';

export default [
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      'coverage/**',
      'tests/integration/archive-integrity.test.js',
      'tests/integration/client-detail.test.js',
      'tests/integration/clients.test.js',
      'tests/integration/dashboard.test.js',
      'tests/integration/employees.test.js',
      'tests/integration/interactions.test.js',
      'tests/integration/module-config.test.js',
      'tests/integration/opportunities.test.js',
      'tests/integration/relabeling.test.js',
      'tests/integration/search.test.js',
      'tests/integration/workspace-shell.test.js',
      'tests/unit/dashboard.test.js',
      'tests/unit/integrity.test.js',
      'tests/unit/interaction.test.js',
      'tests/unit/module-config.test.js',
      'tests/unit/opportunity.test.js',
      'tests/unit/storage.test.js'
    ]
  },
  js.configs.recommended,
  {
    files: ['**/*.js', '**/*.mjs'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }]
    }
  }
];
