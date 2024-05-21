import presetEnv from '@babel/preset-env';
import babelRegister from '@babel/register';

babelRegister.default({
  presets: [presetEnv.default],
});

export default {
  moduleFileExtensions: ['js', 'json', 'jsx', 'node'],
  coverageReporters: ['json', 'text', 'lcov', 'clover'],
  coveragePathIgnorePatterns: ['/node_modules/'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  coverageDirectory: 'coverage',
  moduleDirectories: ['node_modules'],
  watchman: true,
  testEnvironment: 'node',
  runner: 'jest-runner',
  notify: true,
  testMatch: ['**/tests/**/*.spec.js'],
  collectCoverage: true,
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  experimentalEsmLoader: true,
};
