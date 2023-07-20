import * as fs from 'node:fs'

import { z } from 'zod'
import { load } from 'js-yaml'

const ConfigVariableSchema = z.object({
  name: z.string(),
  message: z.string(),
  placeholder: z.string().optional(),
  initialValue: z.string().optional(),
  defaultValue: z.string().optional(),
})
export type ConfigVariables = z.infer<typeof ConfigVariableSchema>

export const ConfigFileSchema = z.object({
  name: z.string(),
  content: z.string(),
})
export type ConfigFile = z.infer<typeof ConfigFileSchema>

const ConfigSchema = z.object({
  variables: z.array(ConfigVariableSchema),
  files: z.array(ConfigFileSchema),
})
export type Config = z.infer<typeof ConfigSchema>

export function loadConfig(templatesPath: string) {
  const fileContent = fs.readFileSync(templatesPath, 'utf-8')
  const yamlData = load(fileContent)
  const parsedData = ConfigSchema.parse(yamlData)
  return parsedData
}
