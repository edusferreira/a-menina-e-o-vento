// Vitest: um único projeto "node" para o motor puro (src/engine) e a validação do conteúdo JSON.
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [{ test: { name: 'node', environment: 'node', include: ['tests/**/*.test.js'] } }],
  },
});
