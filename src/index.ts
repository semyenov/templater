import * as fs from 'node:fs'
import * as path from 'node:path'

import * as glob from 'glob'
import * as p from '@clack/prompts'
import * as changeCase from 'change-case'
import template from 'lodash.template'

import { SRC_ROOT, TEMPLATES_ROOT } from './constants'
import { PromptError } from './errors'
import { loadConfig } from './config'

import type { ConfigVariables } from './config'
import type { Params } from './types'

export async function run() {
  const templates = await glob.glob(`${TEMPLATES_ROOT}/**/*.yml`, { })
  const template = await p.select({
    message: 'Choose template:',
    options: templates.map(template => ({
      label: formatTemplatePath(template),
      value: template,
    })),
    initialValue: 'server.models.yml',
  })
  if (template === '' || p.isCancel(template))
    return

  const config = loadConfig(template)
  const variables = await promptVariables(config.variables)

  for (const { name, content } of config.files) {
    await generate({
      template,
      name,
      content,
      variables,
    })
      .then(({ file, content }) => fs.writeFileSync(file, content))
      .catch((err) => {
        if (err instanceof PromptError)
          return

        throw err
      })
  }
}

async function generate(
  params: Params,
): Promise<{ file: string; content: string }> {
  const replaceMap = formatParams(params.variables)
  const nameTemplater = template(params.name)
  const contentTemplater = template(params.content)
  const outPath = path.join(
    SRC_ROOT,
    formatTemplatePath(params.template),
    nameTemplater(replaceMap),
  )

  if (!fs.existsSync(path.dirname(outPath)))
    fs.mkdirSync(path.dirname(outPath), { recursive: true })

  if (fs.existsSync(outPath)) {
    const overwrite = await p.confirm({
      message: `Overwrite ${outPath}?`,
      initialValue: false,
      active: 'yes',
      inactive: 'no',
    })
    if (!overwrite || p.isCancel(overwrite))
      throw new PromptError('Canceled')
  }

  return {
    file: outPath,
    content: contentTemplater(replaceMap),
  }
}

export async function promptVariables(variables: ConfigVariables[]) {
  const variablesPromptsGroup: p.PromptGroup<Record<string, string>> = {}

  for (const variable of variables) {
    variablesPromptsGroup[variable.name] = async () => {
      const val = await p.text(variable)
      if (!p.isCancel(val))
        return val
    }
  }

  return p.group(variablesPromptsGroup)
}

function formatParams<T extends Record<string, string>>(
  params: T,
): Record<string, string> {
  const replaceMap: Record<string, string> = {}
  for (const [key, value] of Object.entries(params)) {
    const k = changeCase.constantCase(key)
    replaceMap[`${k}`] = value
    replaceMap[`${k}_DOT`] = changeCase.dotCase(value)
    replaceMap[`${k}_KEBAB`] = changeCase.paramCase(value)
    replaceMap[`${k}_CAMEL`] = changeCase.camelCase(value)
    replaceMap[`${k}_PASCAL`] = changeCase.pascalCase(value)
    replaceMap[`${k}_CAPITAL`] = changeCase.capitalCase(value, {
      delimiter: '',
    })
    replaceMap[`${k}_SNAKE`] = changeCase.snakeCase(value)
    replaceMap[`${k}_UPPER`] = changeCase.constantCase(value)
  }

  return replaceMap
}

function formatTemplatePath(template: string): string {
  return changeCase.pathCase(path.parse(template).name)
}
