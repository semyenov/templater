import consola from 'consola'

import * as lib from './lib'

const logger = consola.withDefaults({ tag: 'templater' })
lib.run().catch(logger.error)
