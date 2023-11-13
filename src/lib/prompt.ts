import * as prompts from '@clack/prompts'
import color from 'picocolors'

import { pathCase } from './utils'

import type { ConfigVariables } from './config'
import type { ConfirmOptions, PromptGroup, SelectOptions } from '@clack/prompts'

export class PromptError extends Error {
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

    throw new PromptError('Canceled')
  }

  static async select(
    opts: SelectOptions<{ value: string; label: string }[], string>,
  ): Promise<string> {
    const val = await prompts.select(opts)
    if (!prompts.isCancel(val))
      return val

    throw new PromptError('Canceled')
  }

  static async intro() {
    prompts.intro()
    prompts.log.info(`${color.bgCyan(color.black(' Project generator '))}`)
  }

  static async done() {
    prompts.log.success(`${color.bgGreen(color.black(' Done '))}`)
    prompts.outro()
  }

  static async promptTemplate<T extends string>(strings: T[]): Promise<T> {
    return this.select({
      message: 'Choose template:',
      options: strings.map(template => ({
        label: pathCase(template),
        value: template,
      })),
      initialValue: strings[0],
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

        throw new PromptError('Canceled')
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
