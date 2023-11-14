import { globSync } from 'glob'

import { PromptManager, TEMPLATES_ROOT, generate, loadConfig } from './lib'

export async function run() {
  PromptManager.intro(' Project generator ')

  const templates = globSync('**/*.yml', {
    cwd: TEMPLATES_ROOT,
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

  PromptManager.done(' Done ')
}
