import * as antfu from '@antfu/eslint-config'

const config = antfu.antfu({
  /* settings: {
    'import/resolver': {
      typescript: true,
      node: true,
    },
  }, */

  rules: {
    'antfu/if-newline': ['error'],

    'import/order': [
      'error',
      {
        'newlines-between': 'always',
        'distinctGroup': true,

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

        'alphabetize': {
          order: 'asc',
          orderImportKind: 'asc',
          caseInsensitive: false,
        },
      },
    ],
  },
})

export default config
