import * as p from '@clack/prompts'
import color from 'picocolors'

import * as utils from './utils'

import type { ConfigVariables } from './config'

export class PromptError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PromptError'
  }
}

export class PromptManager {
  static async confirm(opts: p.ConfirmOptions): Promise<boolean> {
    const val = await p.confirm(opts)
    if (!p.isCancel(val))
      return val

    throw new PromptError('Canceled')
  }

  static async select(
    opts: p.SelectOptions<{ value: string; label: string }[], string>,
  ): Promise<string> {
    const val = await p.select(opts)
    if (!p.isCancel(val))
      return val

    throw new PromptError('Canceled')
  }

  static async intro() {
    p.intro()
    p.log.info(`${color.bgCyan(color.black(' Project generator '))}`)
  }

  static async done() {
    p.log.success(`${color.bgGreen(color.black(' Done '))}`)
    p.outro()
  }

  static async promptTemplate<T extends string>(strings: T[]): Promise<T> {
    return this.select({
      message: 'Choose template:',
      options: strings.map(template => ({
        label: utils.pathCase(template),
        value: template,
      })),
      initialValue: strings[0],
    }) as Promise<T>
  }

  static async promptVariables<K extends ConfigVariables, T extends K['name']>(
    variables: K[],
  ) {
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

  static async promptOverwrite(file: string) {
    return this.confirm({
      message: `Overwrite ${file}?`,
      initialValue: false,
      active: 'yes',
      inactive: 'no',
    })
  }
}
