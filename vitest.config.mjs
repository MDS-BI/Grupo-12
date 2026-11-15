import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    fileParallelism: false,
    setupFiles: ['tests/setup/test-setup.js'],
    include: ['tests/**/*.test.js']
  }
});
