module.exports = {
  env: { browser: true, es2021: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:perfectionist/recommended-natural',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'perfectionist'],
  rules: {
    'perfectionist/sort-imports': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn',
  },
};