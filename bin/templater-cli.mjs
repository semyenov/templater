#!/usr/bin/env node

import * as p from '@clack/prompts'

import { run } from '../dist/esm/index.mjs'

import { consola } from 'consola'
import color from 'picocolors'

const logger = consola.withDefaults({
  tag: 'templater',
})

p.intro(color.bgCyan(color.black(' Project generator ')))
run()
  .then(() => p.outro(color.bgGreen(color.black(' Done '))))
  .catch(logger.error)
