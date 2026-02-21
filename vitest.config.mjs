import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    setupFiles: ['spec/support/vitest.setup.ts'],
    include: ['src/**/*.test.ts', 'spec/**/*.test.ts'],
  },
});
