import { glob } from 'glob'

import { PromptManager, TEMPLATES_ROOT, generate, loadConfig } from './lib'

export async function run() {
  PromptManager.intro()

  const templates = await glob(`${TEMPLATES_ROOT}/**/*.yml`, {})
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
