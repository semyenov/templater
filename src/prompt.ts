import * as p from '@clack/prompts'

import { formatTemplatePath } from './utils'

import type { ConfigVariables } from './config'

export class PromptError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PromptError'
  }
}

export class PromptManager {
  static promptConfirm = async (opts: p.ConfirmOptions): Promise<boolean> => {
    const val = await p.confirm(opts)
    if (!p.isCancel(val))
      return val

    throw new PromptError('Canceled')
  }

  static promptSelect = async (
    opts: p.SelectOptions<{ value: string; label: string }[], string>,
  ): Promise<string> => {
    const val = await p.select(opts)
    if (!p.isCancel(val))
      return val

    throw new PromptError('Canceled')
  }

  static async promptTemplate(templates: string[]): Promise<string> {
    return this.promptSelect({
      message: 'Choose template:',
      options: templates.map(template => ({
        label: formatTemplatePath(template),
        value: template,
      })),
      initialValue: 'server.models.yml',
    })
  }

  static async promptVariables(variables: ConfigVariables[]) {
    const variablesPromptsGroup: p.PromptGroup<Record<string, string>> = {}

    for (const variable of variables) {
      variablesPromptsGroup[variable.name] = async () => {
        const val = await p.text(variable)
        if (!p.isCancel(val))
          return val

        throw new PromptError('Canceled')
      }
    }

    return p.group(variablesPromptsGroup)
  }

  static async promptOverwrite(
    file: string,
  ) {
    return this.promptConfirm({
      message: `Overwrite ${file}?`,
      initialValue: false,
      active: 'yes',
      inactive: 'no',
    })
  }
}
