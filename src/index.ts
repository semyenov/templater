import consola from 'consola'

import { run } from './run'

const logger = consola.withDefaults({ tag: 'templater' })
run().catch(logger.error)
