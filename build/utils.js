const fs = require('fs')
const path = require('path')
const slash = require('slash')

const join = (...paths) => slash(path.join(...paths.map(p => slash(p))))
const relative = (from, to) => slash(path.relative(slash(from), slash(to)))
const delay = (ms = 300) => new Promise(res => setTimeout(res, ms))
const isFile = (p) => fs.existsSync(p) && fs.statSync(p).isFile()
const isDirectory = (p) => fs.existsSync(p) && fs.statSync(p).isDirectory()
const readFileSync = (p) => fs.readFileSync(p).toString()
const readDirSync = (p) => fs.readdirSync(p)
const tryMakeDirSync = (p) => { try { fs.mkdirSync(p, { recursive: true }) } catch (err) { } }
const pageNameToPath = (pn) => pn.split('/').join('/pages/')

const srcPath = join(__dirname, '../src')
const globalPath = join(srcPath, 'global')
const pagesPath = join(srcPath, 'pages')
const tempPath = join(__dirname, './.temp')
const distPath = join(__dirname, '../dist')

module.exports = {
  srcPath,
  globalPath,
  pagesPath,
  tempPath,
  distPath,
  join,
  relative,
  delay,
  isFile,
  isDirectory,
  readFileSync,
  readDirSync,
  tryMakeDirSync,
  pageNameToPath
}