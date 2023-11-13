import process from 'node:process'

import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import resolve from '@rollup/plugin-node-resolve'
import sucrase from '@rollup/plugin-sucrase'
import { defineConfig } from 'rollup'
import dts from 'rollup-plugin-dts'
import esbuild from 'rollup-plugin-esbuild'

import pkg from './package.json' assert { type: 'json' }

const input = 'src/index.ts'
const moduleName = pkg.name.replace(/^@.*\//, '')
const production = process.env.NODE_ENV === 'production'
const external = Object.keys(pkg.dependencies)
const author = pkg.author
const banner = `/**
  * @license
  * author: ${author}
  * ${moduleName} v${pkg.version}
  * Released under the ${pkg.license} license.
  */`

export default defineConfig([
  {
    input,
    external,
    output: [
      {
        file: pkg.main,
        sourcemap: true,
        format: 'cjs',
        banner,
      },
      {
        file: pkg.module,
        sourcemap: true,
        format: 'esm',
        banner,
      },
    ],
    plugins: [
      json(),
      resolve({
        preferBuiltins: true,
        rootDir: 'src',
        jail: 'src',
      }),
      commonjs({
        transformMixedEsModules: true,
      }),
      sucrase({
        include: ['src/**/*.{js,jsx,ts,tsx}'],
        exclude: ['node_modules/**'],
        transforms: ['typescript'],
        production,
      }),
      esbuild({
        tsconfig: './tsconfig.build.json',
        minify: true,
      }),
    ],
  },
  {
    input,
    external,
    output: [
      {
        file: pkg.types,
        sourcemap: true,
        format: 'esm',
      },
    ],
    plugins: [
      resolve({
        preferBuiltins: true,
        rootDir: 'src',
        jail: 'src',
      }),
      sucrase({
        include: ['src/**/*.{js,jsx,ts,tsx}'],
        exclude: ['node_modules/**'],
        transforms: ['typescript'],
        production,
      }),
      dts({
        tsconfig: './tsconfig.build.json',
        respectExternal: true,
      }),
    ],
  },
])
