import * as fs from 'node:fs'
import * as path from 'node:path'

import * as glob from 'glob'
import template from 'lodash.template'

import { SRC_ROOT, TEMPLATES_ROOT } from './constants'
import { PromptError, PromptManager } from './prompt'
import { loadConfig } from './config'
import * as utils from './utils'

import type { Params } from './types'

export async function run() {
  const templates = await glob.glob(`${TEMPLATES_ROOT}/**/*.yml`, {})
  const template = await PromptManager.promptSelectString(templates)

  const config = loadConfig(template)
  const variables = await PromptManager.promptVariables(config.variables)

  for (const file of config.files) {
    try {
      const res = await generate({
        ...file,
        template,
        variables,
      })
      if (res)
        fs.writeFileSync(res.file, res.content)
    }
    catch (err) {
      if (!(err instanceof PromptError))
        throw err
    }
  }
}

async function generate(
  params: Params,
): Promise<{ file: string; content: string } | null> {
  const replaceMap = formatParams(params.variables)

  const nameTemplater = template(params.name)
  const contentTemplater = template(params.content)

  const outPath = path.join(
    SRC_ROOT,
    utils.pathCase(params.template),
    nameTemplater(replaceMap),
  )

  fs.mkdirSync(path.dirname(outPath), { recursive: true })

  if (fs.existsSync(outPath)) {
    const overwrite = await PromptManager.promptOverwrite(outPath)
    if (!overwrite)
      return null
  }

  return {
    file: outPath,
    content: contentTemplater(params.variables),
  }
}

function formatParams<T extends Record<string, string>>(
  params: T,
): Record<string, string> {
  const replaceMap: Record<string, string> = {}

  Object.entries(params).forEach(([key, value]) => {
    const k = utils.constantCase(key)
    const v = value

    replaceMap[k] = v
    replaceMap[`${k}_DOT`] = utils.dotCase(v)
    replaceMap[`${k}_KEBAB`] = utils.paramCase(v)
    replaceMap[`${k}_CAMEL`] = utils.camelCase(v)
    replaceMap[`${k}_PASCAL`] = utils.pascalCase(v)
    replaceMap[`${k}_CAPITAL`] = utils.capitalCase(v)
    replaceMap[`${k}_LOWER`] = utils.snakeCase(v)
    replaceMap[`${k}_UPPER`] = utils.constantCase(v)
  })

  return replaceMap
}
