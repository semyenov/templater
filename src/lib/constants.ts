import * as fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

import dotenv from 'dotenv'

const environment = process.env.NODE_ENV || 'development'
const configFile = `${environment}.env`

if (fs.existsSync(configFile)) {
  const result = dotenv.config({ path: `${environment}.env` })
  if (result.error)
    throw result.error
}

export const SRC_ROOT = path.resolve(process.env.TEMPLATER_SRC_ROOT || './src')
export const TEMPLATES_ROOT = path.resolve(
  process.env.TEMPLATER_TEMPLATES_ROOT || './templates',
)
