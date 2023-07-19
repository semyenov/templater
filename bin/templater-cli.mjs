import color from 'picocolors'
import { consola } from 'consola'
import * as p from '@clack/prompts'

import { run } from '../dist/esm/index.mjs'

const logger = consola.withDefaults({
  tag: 'templater',
})

p.intro(color.bgCyan(color.black(' Project generator ')))
run()
  .catch(logger.error)
  .finally(() => p.outro(color.bgGreen(color.black(' Done '))))
