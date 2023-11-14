import { readFileSync } from 'node:fs'

import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import resolve from '@rollup/plugin-node-resolve'
import { defineConfig } from 'rollup'
import dts from 'rollup-plugin-dts'
import esbuild from 'rollup-plugin-esbuild'

import type { RollupCommonJSOptions } from '@rollup/plugin-commonjs'
import type { RollupJsonOptions } from '@rollup/plugin-json'
import type { RollupNodeResolveOptions } from '@rollup/plugin-node-resolve'
import type { Options as RollupDtsOptions } from 'rollup-plugin-dts'
import type { Options as RollupEsbuildOptions } from 'rollup-plugin-esbuild'

const pkgFile = readFileSync('./package.json', { encoding: 'utf-8' })
const pkgData: typeof import('./package.json') = JSON.parse(pkgFile)

const input = './src/index.ts'
const tsconfig = './tsconfig.build.json'
const moduleName = pkgData.name.replace(/^@.*\//, '')
const external = Object.keys(pkgData.dependencies)

const author = pkgData.author
const banner = `/**
  * @license
  * author: ${author}
  * ${moduleName} v${pkgData.version}
  * Released under the ${pkgData.license} license.
  */`

const jsonConfig: RollupJsonOptions = {
  preferConst: true,
  indent: '  ',
}

const resolveConfig: RollupNodeResolveOptions = {
  preferBuiltins: true,
}

const commonjsConfig: RollupCommonJSOptions = {
  exclude: external,
}

const esbuildConfig: RollupEsbuildOptions = {
  exclude: external,
  minify: true,
  tsconfig,
}

const dtsConfig: RollupDtsOptions = {
  respectExternal: true,
  tsconfig,
}

export default defineConfig([
  {
    input,
    external,
    output: [
      {
        file: pkgData.main,
        sourcemap: true,
        format: 'cjs',
        banner,
      },
      {
        file: pkgData.module,
        sourcemap: true,
        format: 'esm',
        banner,
      },
    ],
    plugins: [
      json(jsonConfig),
      resolve(resolveConfig),
      commonjs(commonjsConfig),
      esbuild(esbuildConfig),
    ],
  },
  {
    input,
    external,
    output: [
      {
        file: pkgData.types,
        sourcemap: true,
        format: 'esm',
        banner,
      },
    ],
    plugins: [
      json(jsonConfig),
      resolve(resolveConfig),
      dts(dtsConfig),
    ],
  },
])
