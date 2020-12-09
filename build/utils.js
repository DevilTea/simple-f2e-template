const fs = require('fs')
const path = require('path')
const ejs = require('ejs')

const srcPath = path.join(__dirname, '../src')
const globalPath = path.join(srcPath, 'global')
const pagesPath = path.join(srcPath, 'pages')
const tempPath = path.join(__dirname, './.temp')
const distPath = path.join(__dirname, '../dist')

const delay = (ms = 300) => new Promise(res => setTimeout(res, ms))
const isFile = (p) => fs.existsSync(p) && fs.statSync(p).isFile()
const isDirectory = (p) => fs.existsSync(p) && fs.statSync(p).isDirectory()
const readFileSync = (p) => fs.readFileSync(p).toString()
const readDirSync = (p) => fs.readdirSync(p)
const tryMakeDirSync = (p) => { try { fs.mkdirSync(p, { recursive: true }) } catch (err) { } }
const pageNameToPath = (pn) => pn.split('/').join('/pages/')

module.exports = {
  srcPath,
  globalPath,
  pagesPath,
  tempPath,
  distPath,
  delay,
  isFile,
  isDirectory,
  readFileSync,
  readDirSync,
  tryMakeDirSync,
  pageNameToPath
}