module.exports = {
  root: true,
  parser: '@typescript-eslint/parser', // parse TS
  parserOptions: {
    ecmaVersion: 2025,
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  plugins: ['@typescript-eslint', 'react', 'react-hooks', 'react-refresh'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:react-refresh/recommended', // nếu bạn dùng react-refresh plugin
    'plugin:prettier/recommended', // ESLint + Prettier
  ],
  settings: {
    react: { version: 'detect' },
  },
  ignorePatterns: ['dist', 'node_modules'],
  rules: {
    'react/prop-types': 'off', // TS type check thay cho prop-types
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    'no-unused-vars': 'off',
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        '@typescript-eslint/no-unused-vars': 'off',
        'no-unused-vars': 'off',
      },
    },
  ],
};
