import * as path from 'node:path'

import * as changeCase from 'change-case'

export function formatTemplatePath(template: string): string {
  return changeCase.pathCase(path.parse(template).name)
}
