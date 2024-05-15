import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';

// rollup.config.mjs
export default {
  input: 'index.js',
  output: [
    {
      file: 'dist/bundle.js',
      format: 'es',
    },
    {
      file: 'dist/bundle.min.js',
      format: 'es',
      name: 'version',
      plugins: [terser()],
    },
  ],
  plugins: [nodeResolve()],
  external: ['handlebars', 'prettier', 'inquirer'],
};
