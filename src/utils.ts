import * as path from 'node:path'

import * as changeCase from 'change-case'

export function pathCase(template: string): string {
  return changeCase.pathCase(path.parse(template).name)
}
export function paramCase(value: string) {
  return changeCase.paramCase(value)
}
export function camelCase(value: string) {
  return changeCase.camelCase(value)
}
export function pascalCase(value: string) {
  return changeCase.pascalCase(value)
}
export function capitalCase(value: string) {
  return changeCase.capitalCase(value, { delimiter: '' })
}
export function snakeCase(value: string) {
  return changeCase.snakeCase(value)
}
export function constantCase(value: string) {
  return changeCase.constantCase(value)
}
export function dotCase(value: string) {
  return changeCase.dotCase(value)
}
