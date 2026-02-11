import { defineConfig } from 'vite'
import { resolve } from 'path'

import config from './app/build/get-config.js'
import getModules from './app/build/get-modules.js'

const dir = import.meta.dirname

const modules = getModules(dir, config.root, config.modules)
const coreJs = resolve(dir, config.core.scripts)

const input = {
  ...modules,
  'theme-core': coreJs
}

const aliases = Object.entries(config.aliases).reduce((acc, [key, value]) => {
  const path = resolve(dir, value)
  acc[key] = path
  return acc
}, {})

export default defineConfig({
  root: resolve(dir, config.paths.root),
  base: '',
  publicDir: resolve(dir, config.paths.public),
  resolve: {
    alias: aliases,
  },
  build: {
    outDir: resolve(dir, config.build.outDir),
    assetsDir: '',
    emptyOutDir: false,
    sourcemap: true,
    minify: true,
    cssMinify: true,
    rollupOptions: {
      preserveEntrySignatures: 'strict',
      input,
      output: config.build.output,
      external: [],
    },
  },
  plugins: [],
})