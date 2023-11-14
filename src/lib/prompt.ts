import * as prompts from '@clack/prompts'
import color from 'picocolors'

import { pathCase } from './utils'

import type { ConfigVariables } from './config'
import type { ConfirmOptions, PromptGroup, SelectOptions } from '@clack/prompts'

export class PromptManagerError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PromptError'
  }
}

export class PromptManager {
  static async confirm(opts: ConfirmOptions): Promise<boolean> {
    const val = await prompts.confirm(opts)
    if (!prompts.isCancel(val))
      return val

    throw new PromptManagerError('Canceled')
  }

  static async select(
    opts: SelectOptions<{ value: string; label: string }[], string>,
  ): Promise<string> {
    const val = await prompts.select(opts)
    if (!prompts.isCancel(val))
      return val

    throw new PromptManagerError('Canceled')
  }

  static async intro(str: string) {
    prompts.intro()
    prompts.log.info(`${color.bgCyan(color.black(str))}`)
  }

  static async done(str: string) {
    prompts.log.success(`${color.bgGreen(color.black(str))}`)
    prompts.outro()
  }

  static async promptTemplate<T extends string>(templates: T[]): Promise<T> {
    return this.select({
      message: 'Choose template:',
      options: templates.map(template => ({
        label: pathCase(template),
        value: template,
      })),
      initialValue: templates[0],
    }) as Promise<T>
  }

  static async promptVariables<K extends ConfigVariables, T extends K['name']>(
    variables: K[],
  ) {
    const variablesPromptsGroup = {} as PromptGroup<Record<T, string>>

    variables.forEach(async (variable) => {
      variablesPromptsGroup[variable.name as T] = async () => {
        const val = await prompts.text(variable)
        if (!prompts.isCancel(val))
          return val

        throw new PromptManagerError('Canceled')
      }
    })

    return prompts.group(variablesPromptsGroup)
  }

  static async promptOverwrite(file: string) {
    return this.confirm({
      message: `Overwrite ${file}?`,
      initialValue: false,
      active: 'yes',
      inactive: 'no',
    })
  }
}
