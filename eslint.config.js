import globals from 'globals';
import pluginJs from '@eslint/js';
import jestPlugin from 'eslint-plugin-jest';

export default [
  {
    // General configuration
    languageOptions: {
      globals: globals.browser, // Assuming browser is the primary env for non-test code
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  },
  pluginJs.configs.recommended,
  {
    // Configuration for test files
    files: ['tests/**/*.js', '**/*.spec.js', '**/*.test.js'],
    languageOptions: {
      globals: {
        ...globals.jest,
        ...globals.node, // This will provide 'require' and other Node.js globals
      },
      // sourceType will be implicitly 'module' due to package.json or 'commonjs' if require is used.
      // Let ESLint and @eslint/js determine this based on file content / project type.
    },
  },
  jestPlugin.configs['flat/recommended'],
];
