import { readFileSync } from 'node:fs'

import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import resolve from '@rollup/plugin-node-resolve'
import { defineConfig } from 'rollup'
import dts from 'rollup-plugin-dts'
import esbuild from 'rollup-plugin-esbuild'

import type { RollupCommonJSOptions } from '@rollup/plugin-commonjs'
import type { RollupNodeResolveOptions } from '@rollup/plugin-node-resolve'
import type { Options as RollupDtsOptions } from 'rollup-plugin-dts'
import type { Options as RollupEsbuildOptions } from 'rollup-plugin-esbuild'

const pkgFile = readFileSync('./package.json', { encoding: 'utf-8' })
const pkgJson: typeof import('./package.json') = JSON.parse(pkgFile)

const input = 'src/index.ts'
const tsconfig = './tsconfig.build.json'
const moduleName = pkgJson.name.replace(/^@.*\//, '')
const external = Object.keys(pkgJson.dependencies)
const author = pkgJson.author
const banner = `/**
  * @license
  * author: ${author}
  * ${moduleName} v${pkgJson.version}
  * Released under the ${pkgJson.license} license.
  */`

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
        file: pkgJson.main,
        sourcemap: true,
        format: 'cjs',
        banner,
      },
      {
        file: pkgJson.module,
        sourcemap: true,
        format: 'esm',
        banner,
      },
    ],
    plugins: [
      json(),
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
        file: pkgJson.types,
        sourcemap: true,
        format: 'esm',
        banner,
      },
    ],
    plugins: [
      resolve(resolveConfig),
      dts(dtsConfig),
    ],
  },
])
