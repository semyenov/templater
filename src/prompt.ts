import * as p from '@clack/prompts'

import * as utils from './utils'

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

  static async promptSelectString<T extends string>(strings: T[]): Promise<T> {
    return this.promptSelect({
      message: 'Choose template:',
      options: strings.map(template => ({
        label: utils.pathCase(template),
        value: template,
      })),
      initialValue: strings[0],
    }) as Promise<T>
  }

  static async promptVariables<K extends ConfigVariables, T extends K['name']>(variables: K[]) {
    const variablesPromptsGroup = {} as p.PromptGroup<Record<T, string>>

    variables.forEach(async (variable) => {
      variablesPromptsGroup[variable.name as T] = async () => {
        const val = await p.text(variable)
        if (!p.isCancel(val))
          return val

        throw new PromptError('Canceled')
      }
    })

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
