import js from '@eslint/js'
import { defineConfig } from 'eslint/config'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import reactHooks from 'eslint-plugin-react-hooks'
import globals from 'globals'
import tseslint from 'typescript-eslint'

const restrictImports = (...patterns) => ['error', { patterns }]

const forbid = (groups, message) => ({ group: groups, message })

export default defineConfig(
  { ignores: ['dist', 'android', 'node_modules', 'coverage', 'playwright-report', 'test-results'] },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, tseslint.configs.strict],
    languageOptions: {
      ecmaVersion: 2023,
      globals: { ...globals.browser },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': 'error',
      'no-restricted-exports': [
        'error',
        {
          restrictDefaultExports: {
            direct: true,
            named: true,
            defaultFrom: true,
            namedFrom: true,
            namespaceFrom: true,
          },
        },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector: 'TSEnumDeclaration',
          message: 'Use a union of literals or an `as const` object instead of enum.',
        },
        {
          selector: 'TSUnknownKeyword',
          message: 'Avoid `unknown`; model the type or validate with Zod.',
        },
      ],
      'max-lines': ['warn', { max: 200, skipBlankLines: true, skipComments: true }],
    },
  },
  {
    files: ['src/ui/**/*.{ts,tsx}', 'src/app/**/*.{ts,tsx}'],
    plugins: { 'react-hooks': reactHooks },
    rules: reactHooks.configs.recommended.rules,
  },
  {
    files: ['src/ui/**/*.tsx'],
    plugins: { 'jsx-a11y': jsxA11y },
    rules: jsxA11y.configs.recommended.rules,
  },
  {
    files: ['src/core/**/*.ts'],
    rules: {
      'no-restricted-imports': restrictImports(
        forbid(
          ['react', 'react-*', '@capacitor/*', 'zustand', '@app/*', '@services/*', '@ui/*'],
          'core must stay pure: no React, Capacitor, or other layers.',
        ),
      ),
      'no-restricted-properties': [
        'error',
        {
          object: 'Math',
          property: 'random',
          message: 'Inject an Rng instead of Math.random in core.',
        },
        { object: 'Date', property: 'now', message: 'Inject time instead of Date.now in core.' },
      ],
      'no-restricted-globals': ['error', 'window', 'document', 'localStorage', 'navigator'],
    },
  },
  {
    files: ['src/services/**/*.ts'],
    rules: {
      'no-restricted-imports': restrictImports(
        forbid(['react', 'react-*', '@app/*', '@ui/*'], 'services may only import core.'),
      ),
    },
  },
  {
    files: ['src/app/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': restrictImports(
        forbid(['@ui/*', '@capacitor/*'], 'app must not import ui or Capacitor; use services.'),
      ),
    },
  },
  {
    files: ['src/ui/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': restrictImports(
        forbid(['@services/*', '@capacitor/*'], 'ui must go through the app layer.'),
        {
          group: ['@core/*'],
          allowTypeImports: true,
          message: 'ui may only import types from core; expose logic through app selectors.',
        },
      ),
    },
  },
  {
    files: ['**/*.test.{ts,tsx}', 'src/test/**', 'e2e/**', 'scripts/**'],
    rules: {
      'max-lines': 'off',
      'no-restricted-imports': 'off',
    },
  },
  {
    files: ['*.config.{js,ts}'],
    languageOptions: { globals: { ...globals.node } },
    rules: { 'no-restricted-exports': 'off' },
  },
  {
    files: ['scripts/**/*.ts', 'e2e/**/*.ts'],
    languageOptions: { globals: { ...globals.node } },
    rules: { 'no-console': 'off' },
  },
)
