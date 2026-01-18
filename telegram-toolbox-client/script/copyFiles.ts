import fs from 'node:fs'
import path from 'node:path'
import consola from 'consola'
import packageJson from '../package.json'

delete packageJson.devDependencies
delete packageJson.scripts

const cwd = process.cwd()
fs.writeFileSync(path.resolve(cwd, 'dist/out/package.json'), JSON.stringify(packageJson, null, 2))

function copyVueDist() {
  const vueDistPath = path.resolve(cwd, '../telegram-toolbox-vue/dist')
  const targetPath = path.resolve(cwd, 'dist/out/web')
  fs.rmSync(targetPath, { recursive: true, force: true })
  fs.cpSync(vueDistPath, targetPath, { recursive: true })
  consola.log('Vue dist copied to', targetPath)
}
copyVueDist()
