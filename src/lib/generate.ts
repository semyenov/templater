import * as fs from 'node:fs'
import path from 'node:path'

import lt from 'lodash.template'

import { SRC_ROOT } from './constants'
import { PromptManager } from './prompt'
import { camelCase, capitalCase, constantCase, dotCase, pascalCase, pathCase, snakeCase } from './utils'

export interface Params {
  template: string
  name: string
  content: string
  variables: Record<string, string>
}

export async function generate(params: Params): Promise<void> {
  const nameTemplater = lt(params.name)
  const contentTemplater = lt(params.content)

  const replaceMap = formatParams(params.variables)

  const name = path.join(
    SRC_ROOT,
    pathCase(params.template),
    nameTemplater(replaceMap),
  )

  if (fs.existsSync(name)) {
    const overwrite = await PromptManager.promptOverwrite(name)
    if (!overwrite)
      return
  }

  const content = contentTemplater(replaceMap)

  if (!fs.existsSync(path.dirname(name)))
    fs.mkdirSync(path.dirname(name), { recursive: true })

  fs.writeFileSync(name, content)
}

function formatParams<T extends Record<string, string>>(
  params: T,
): Record<string, string> {
  const replaceMap: Record<string, string> = {}

  Object.entries(params).forEach(([key, value]) => {
    const k = constantCase(key)
    const v = value

    replaceMap[k] = v
    replaceMap[`${k}_dot`] = dotCase(v)
    replaceMap[`${k}_camel`] = camelCase(v)
    replaceMap[`${k}_pascal`] = pascalCase(v)
    replaceMap[`${k}_capital`] = capitalCase(v)
    replaceMap[`${k}_lower`] = snakeCase(v)
    replaceMap[`${k}_upper`] = constantCase(v)
  })

  return replaceMap
}
