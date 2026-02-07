import fs from 'fs'
import { resolve } from 'path'

const getModules = (rootDir, root, directory) => {
  const entries = {}
  const sourceFilesDir = resolve(rootDir, root, directory)

  function readDir(dir) {
    const files = fs.readdirSync(dir)

    files.forEach((file) => {
      const filePath = resolve(dir, file)

      if (/\.(js)$/.test(file)) {
        const fileName = file.replace(/\.[^.]+$/, '')
        entries[fileName] = filePath
      }
    })
  }

  readDir(sourceFilesDir)
  
  return entries
}

export default getModules