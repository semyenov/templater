import * as fs from 'node:fs'
import * as path from 'node:path'

import * as glob from 'glob'
import * as changeCase from 'change-case'
import t from 'handlebars'

import { SRC_ROOT, TEMPLATES_ROOT } from './constants'
import { PromptError, PromptManager } from './prompt'
import { loadConfig } from './config'
import { formatTemplatePath } from './utils'

import type { Params } from './types'

t.registerHelper('dotCase', (value: string) => changeCase.dotCase(value))
t.registerHelper('paramCase', (value: string) => changeCase.paramCase(value))
t.registerHelper('camelCase', (value: string) => changeCase.camelCase(value))
t.registerHelper('pascalCase', (value: string) => changeCase.pascalCase(value))
t.registerHelper('capitalCase', (value: string) => changeCase.capitalCase(value, { delimiter: '' }))
t.registerHelper('snakeCase', (value: string) => changeCase.snakeCase(value))
t.registerHelper('constantCase', (value: string) => changeCase.constantCase(value))

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
  const nameTemplater = t.compile(params.name)
  const contentTemplater = t.compile(params.content)
  const outPath = path.join(
    SRC_ROOT,
    formatTemplatePath(params.template),
    nameTemplater(params.variables),
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
