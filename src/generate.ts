import * as fs from 'node:fs'
import * as path from 'node:path'

import template from 'lodash.template'

import * as utils from './utils'
import { SRC_ROOT } from './constants'
import { PromptManager } from './prompt'

export interface Params {
  template: string
  name: string
  content: string
  variables: Record<string, string>
}

export async function generate(
  params: Params,
): Promise<void> {
  const replaceMap = formatParams(params.variables)

  const nameTemplater = template(params.name)
  const contentTemplater = template(params.content)

  const outPath = path.join(
    SRC_ROOT,
    utils.pathCase(params.template),
    nameTemplater(replaceMap),
  )

  if (fs.existsSync(outPath)) {
    const overwrite = await PromptManager.promptOverwrite(outPath)
    if (!overwrite)
      return
  }

  fs.mkdirSync(path.dirname(outPath), { recursive: true })
  fs.writeFileSync(outPath, contentTemplater(params.variables))
}

function formatParams<T extends Record<string, string>>(
  params: T,
): Record<string, string> {
  const replaceMap: Record<string, string> = {}

  Object.entries(params).forEach(([key, value]) => {
    const k = utils.constantCase(key)
    const v = value

    replaceMap[k] = v
    replaceMap[`${k}-dot`] = utils.dotCase(v)
    replaceMap[`${k}-kebab`] = utils.paramCase(v)
    replaceMap[`${k}-camel`] = utils.camelCase(v)
    replaceMap[`${k}-pascal`] = utils.pascalCase(v)
    replaceMap[`${k}-capital`] = utils.capitalCase(v)
    replaceMap[`${k}-lower`] = utils.snakeCase(v)
    replaceMap[`${k}-upper`] = utils.constantCase(v)
  })

  return replaceMap
}
