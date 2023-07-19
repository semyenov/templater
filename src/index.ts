import * as fs from 'node:fs'
import * as path from 'node:path'
import * as process from 'node:process'

import * as p from '@clack/prompts'
import * as changeCase from 'change-case'
import template from 'lodash.template'
import color from 'picocolors'
import { consola } from 'consola'

import { PromptError } from './errors'

import type { Params } from './types'

const SRC_ROOT = path.resolve(process.env.TEMPLATER_SRC_ROOT || './src')
const TEMPLATES_ROOT = path.resolve(process.env.TEMPLATER_TEMPLATES_ROOT || './templates')

const logger = consola.withDefaults({
  tag: 'templater',
})

p.intro(color.bgCyan(color.black(' Project generator ')))
main()
  .catch(logger.error)
  .finally(() => p.outro(color.bgGreen(color.black(' Done '))))

async function main() {
  const input = await p.group({
    path: () => p.text({
      message: 'Enter the path:',
      placeholder: 'server/models',
      initialValue: 'server/models',
      defaultValue: '',
    }),

    name: () => p.text({
      message: 'Enter the name:',
      placeholder: 'meta',
      initialValue: 'meta',
      defaultValue: '',
    }),
  })

  if (
    input.path === ''
    || input.name === ''
    || p.isCancel(input.path)
    || p.isCancel(input.name)
  )
    return

  for (const template of fs.readdirSync(path.join(TEMPLATES_ROOT, input.path))) {
    await generate({ ...input, template })
      .then(({ file, content }) => fs.writeFileSync(file, content))
      .catch((err) => {
        if (err instanceof PromptError)
          return

        throw err
      })
  }
}

async function generate(params: Params): Promise<{ file: string; content: string }> {
  const templateContent = fs.readFileSync(path.join(
    TEMPLATES_ROOT,
    params.path,
    params.template,
  ), 'utf-8')

  const outPath = path.join(
    SRC_ROOT,
    params.path,
    params.name,
    params.template
      .slice(0, params.template.lastIndexOf('.'))
      .replace(/\[name\]/g, params.name),
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
    if (
      !overwrite
      || p.isCancel(overwrite)
    )
      throw new PromptError('Canceled')
  }

  const replaceMap = createReplaceMap(params)
  const templater = template(templateContent)

  return {
    file: outPath,
    content: templater(replaceMap),
  }
}

function createReplaceMap(params: Params) {
  return {
    NAME: params.name,
    PATH: params.path,

    NAME_DOT: changeCase.dotCase(params.name),
    NAME_KEBAB: changeCase.paramCase(params.name),
    NAME_CAMEL: changeCase.camelCase(params.name),
    NAME_PASCAL: changeCase.pascalCase(params.name),
    NAME_CAPITAL: changeCase.capitalCase(params.name, { delimiter: '' }),
    NAME_UPPER: changeCase.constantCase(params.name),
    NAME_LOWER: changeCase.snakeCase(params.name),
  }
}
