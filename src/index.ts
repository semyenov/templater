import consola from 'consola'

import { run } from './cli'

const logger = consola.withDefaults({ tag: 'templater' })
run().catch(logger.error)
