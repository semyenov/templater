import antfu from '@antfu/eslint-config'
import * as typescriptParser from '@typescript-eslint/parser'
import * as vueParser from 'vue-eslint-parser'

const config = antfu({
  linterOptions: {
    reportUnusedDisableDirectives: true,
  },
  ignores: ['**/dist', '**/node_modules', '**/*.config.ts'],
  languageOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    parser: vueParser,
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: typescriptParser,
      project: './tsconfig.eslint.json',
    },
  },
  settings: {
    'import/resolver': {
      typescript: true,
      node: true,
    },
  },
  rules: {
    'antfu/if-newline': ['error'],
    'import/namespace': ['error'],
    'import/default': ['error'],
    'import/export': ['error'],
    'import/named': ['error'],
    'import/order': [
      'error',
      {
        'newlines-between': 'always',
        'groups': [
          'builtin',
          'external',
          'object',
          'parent',
          'internal',
          'sibling',
          'index',
          'type',
        ],
        'pathGroups': [
          {
            pattern: '@/**',
            group: 'internal',
            position: 'after',
          },
          {
            pattern: '~/**',
            group: 'internal',
            position: 'after',
          },
        ],
        'distinctGroup': true,
        'alphabetize': {
          order: 'asc',
          orderImportKind: 'asc',
          caseInsensitive: true,
        },
      },
    ],
  },
})

export default config
