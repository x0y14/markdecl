import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    target: 'es2021',
    sourcemap: true,
    minify: false,
    lib: {
      entry: 'index.ts',
      formats: ['es'],
      fileName: () => 'index.js',
    },
    rollupOptions: {
      external: ['markdown-it', /^markdown-it\//],
    },
  },
  plugins: [
    dts({
      tsconfigPath: './tsconfig.json',
      outDir: 'dist',
    }),
  ],
});
