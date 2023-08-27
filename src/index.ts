import { glob as glob_1 } from 'glob'
import consola from 'consola'

import { PromptManager, TEMPLATES_ROOT, generate, loadConfig } from './lib'

const logger = consola.withDefaults({ tag: 'templater' })
run().catch(logger.error)

async function run() {
  PromptManager.intro()

  const templates = await glob_1(`${TEMPLATES_ROOT}/**/*.yml`, {})
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
