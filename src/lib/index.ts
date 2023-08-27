import * as glob from 'glob'

import { TEMPLATES_ROOT } from './constants'
import { PromptManager } from './prompt'
import { loadConfig } from './config'
import { generate } from './generate'

export async function run() {
  PromptManager.intro()

  const templates = await glob.glob(`${TEMPLATES_ROOT}/**/*.yml`, {})
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
