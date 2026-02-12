const root = 'app'
const publicDir = 'public'
const output = 'assets'
const stylesDir = 'css'
const stylesCore = 'theme-core.css'
const scriptsDir = 'js'
const scriptsCore = 'theme-core.js'
const modulesDir = 'modules'

const rootPath = `./${root}`
const publicPath = `./${root}/${publicDir}`
const outputPath = `./${output}`
const stylesPath = `./${root}/${stylesDir}`
const scriptsPath = `./${root}/${scriptsDir}`
const modulesPath = `./${root}/${modulesDir}`

const coreStyles = `${stylesPath}/${stylesCore}`
const coreScripts = `${scriptsPath}/${scriptsCore}`

const config = {
  root,
  modules: modulesDir,
  paths: {
    root: rootPath,
    public: publicPath,
    output: outputPath,
    styles: stylesPath,
    scripts: scriptsPath,
    modules: modulesPath,
  },
  core: {
    styles: coreStyles,
    scripts: coreScripts,
  },
  aliases: {
    '@': rootPath,
    '@css': stylesPath,
    '@js': scriptsPath,
    '@core': `${scriptsPath}/core`,
    '@lib': `${scriptsPath}/lib`,
  },
  build: {
    outDir: outputPath,
    output: {
      format: 'es',
      entryFileNames: '[name].min.js',
      assetFileNames: '[name].min.[ext]',
      chunkFileNames: (chunkInfo) => `lib-${chunkInfo.name}.min.js`,
      minifyInternalExports: false,
      manualChunks: (id) => {
        if (id.includes('/utilities/')) return 'utilities'
        if (id.includes('/composables/')) return 'composables'
        if (id.includes('/services/')) return 'services'
        if (id.includes('/stores/')) return 'stores'
        return undefined
      },
    },
  },
}

export default config