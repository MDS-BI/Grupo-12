import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    fileParallelism: false,
    setupFiles: ['tests/setup/test-setup.js'],
    include: ['tests/**/*.test.js'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      'tests/integration/archive-integrity.test.js',
      'tests/integration/client-detail.test.js',
      'tests/integration/clients.test.js',
      'tests/integration/dashboard.test.js',
      'tests/integration/employees.test.js',
      'tests/integration/interactions.test.js',
      // 'tests/integration/module-config.test.js', // habilitado para T120 (FR-071)
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
  }
});
