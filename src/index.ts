import consola from 'consola'

import { run } from './cli'

export * from './lib'

const logger = consola.withDefaults({ tag: 'templater' })
run().catch(logger.error)
