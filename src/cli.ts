import path from 'node:path'
import process from 'node:process'

import { glob } from 'glob'

import { PromptManager, TEMPLATES_ROOT, generate, loadConfig } from './lib'

export async function run() {
  PromptManager.intro()

  const templates = await glob(`**/*.{yml,yaml}`, {
    root: path.resolve(process.cwd(), TEMPLATES_ROOT),
  })
  const template = await PromptManager.promptTemplate(templates)

  const config = loadConfig(template)
  const variables = await PromptManager.promptVariables(config.variables)

  for (const file of config.files) {
    await generate({
      ...file,
      template,
      variables,
    })
  }

  PromptManager.done()
}
