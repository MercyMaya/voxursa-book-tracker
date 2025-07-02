/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  env: { browser: true, es2024: true, node: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended', // TS-specific rules
    'prettier', // disables rules Prettier will fix
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  ignorePatterns: ['dist/', 'node_modules/'],
  rules: {
    // put project-specific tweaks here, e.g.:
    // 'no-console': 'warn',
  },
};
