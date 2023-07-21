import * as fs from 'node:fs'
import * as path from 'node:path'

import * as glob from 'glob'
import * as changeCase from 'change-case'
import template from 'lodash.template'

import { SRC_ROOT, TEMPLATES_ROOT } from './constants'
import { PromptError, PromptManager } from './prompt'
import { loadConfig } from './config'
import { formatTemplatePath } from './utils'

import type { Params } from './types'

export async function run() {
  const templates = await glob.glob(`${TEMPLATES_ROOT}/**/*.yml`, {})
  const template = await PromptManager.promptTemplate(templates)

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
    formatTemplatePath(params.template),
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
    content: contentTemplater(replaceMap),
  }
}

function formatParams<T extends Record<string, string>>(
  params: T,
): Record<string, string> {
  const replaceMap: Record<string, string> = {}

  Object.entries(params).forEach(([key, value]) => {
    const k = changeCase.constantCase(key)
    const dotCaseValue = changeCase.dotCase(value)
    const paramCaseValue = changeCase.paramCase(value)
    const camelCaseValue = changeCase.camelCase(value)
    const pascalCaseValue = changeCase.pascalCase(value)
    const capitalCaseValue = changeCase.capitalCase(value, { delimiter: '' })
    const snakeCaseValue = changeCase.snakeCase(value)
    const constantCaseValue = changeCase.constantCase(value)

    replaceMap[k] = value
    replaceMap[`${k}_DOT`] = dotCaseValue
    replaceMap[`${k}_KEBAB`] = paramCaseValue
    replaceMap[`${k}_CAMEL`] = camelCaseValue
    replaceMap[`${k}_PASCAL`] = pascalCaseValue
    replaceMap[`${k}_CAPITAL`] = capitalCaseValue
    replaceMap[`${k}_LOWER`] = snakeCaseValue
    replaceMap[`${k}_UPPER`] = constantCaseValue
  })

  return replaceMap
}
