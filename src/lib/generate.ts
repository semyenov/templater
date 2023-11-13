import * as fs from 'node:fs'
import path from 'node:path'

import lt from 'lodash.template'

import * as constants from './constants'
import { PromptManager } from './prompt'
import * as utils from './utils'

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
    constants.SRC_ROOT,
    utils.pathCase(params.template),
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
    const k = utils.constantCase(key)
    const v = value

    replaceMap[k] = v
    replaceMap[`${k}_dot`] = utils.dotCase(v)
    replaceMap[`${k}_camel`] = utils.camelCase(v)
    replaceMap[`${k}_pascal`] = utils.pascalCase(v)
    replaceMap[`${k}_capital`] = utils.capitalCase(v)
    replaceMap[`${k}_lower`] = utils.snakeCase(v)
    replaceMap[`${k}_upper`] = utils.constantCase(v)
  })

  return replaceMap
}
