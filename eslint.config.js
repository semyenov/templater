import * as e from '@antfu/eslint-config'
const r = e.antfu({ rules: { 'antfu/generic-spacing': ['error'], 'antfu/if-newline': ['error'], 'style/max-statements-per-line': ['off'], 'eol-last': ['error', 'always'], 'import/order': ['error', { 'newlines-between': 'always', 'distinctGroup': !0, 'groups': ['builtin', 'external', 'object', 'parent', 'internal', 'sibling', 'index', 'type'], 'pathGroups': [{ pattern: '@/**', group: 'internal', position: 'after' }, { pattern: '~/**', group: 'internal', position: 'after' }], 'alphabetize': { order: 'asc', orderImportKind: 'asc', caseInsensitive: !1 } }] } }); export { r as default }
// # sourceMappingURL=eslint.config.js.map
