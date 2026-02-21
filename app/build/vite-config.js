const root = 'app'
const publicDir = 'public'
const output = 'assets'
const stylesDir = 'css'
const stylesTheme = 'theme.css'
const scriptsDir = 'js'
const scriptsCritical = 'theme-critical.js'
const scriptsTheme = 'theme.js'
const modulesDir = 'modules'

const rootPath = `./${root}`
const publicPath = `./${root}/${publicDir}`
const outputPath = `./${output}`
const stylesPath = `./${root}/${stylesDir}`
const scriptsPath = `./${root}/${scriptsDir}`
const modulesPath = `./${root}/${modulesDir}`

const themeStyles = `${stylesPath}/${stylesTheme}`
const criticalScripts = `${scriptsPath}/${scriptsCritical}`
const themeScripts = `${scriptsPath}/${scriptsTheme}`

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
    styles: themeStyles,
    critical: criticalScripts,
    theme: themeScripts,
  },
  aliases: {
    '@': rootPath,
    '@css': stylesPath,
    '@js': scriptsPath,
    '@components': `${scriptsPath}/components`,
    '@core': `${scriptsPath}/core`,
    '@lib': `${scriptsPath}/lib`,
    '@stores': `${scriptsPath}/stores`
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