import * as e from '@antfu/eslint-config'

const r = e.antfu({
  rules: {
    'antfu/if-newline': ['error'],
    'import/order': [
      'error',
      {
        'newlines-between': 'always',
        'distinctGroup': !0,
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
          { pattern: '@/**', group: 'internal', position: 'after' },
          { pattern: '~/**', group: 'internal', position: 'after' },
        ],
        'alphabetize': {
          order: 'asc',
          orderImportKind: 'asc',
          caseInsensitive: !1,
        },
      },
    ],
  },
})
export { r as default }
