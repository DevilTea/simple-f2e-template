const rm = require('rimraf')
const fs = require('fs')
const ejs = require('ejs')
const chokidar = require('chokidar')

const {
  srcPath,
  globalPath,
  pagesPath,
  tempPath,
  join,
  relative,
  delay,
  isFile,
  isDirectory,
  readFileSync,
  readDirSync,
  tryMakeDirSync,
  pageNameToPath
} = require('./utils')
const { publicPath } = require('../project.config')
const { exit } = require('process')
const chalk = require('chalk')

function validateRequiredStructure (target) {
  return [
    isDirectory(target),
    isDirectory(join(target, 'public')),
    isDirectory(join(target, 'scripts')),
    isFile(join(target, 'scripts', 'index.js')),
    isDirectory(join(target, 'scss')),
    isFile(join(target, 'scss', 'index.scss')),
    isDirectory(join(target, 'templates')),
    isFile(join(target, 'templates', 'index.ejs')),
    isFile(join(target, 'data.json')),
  ].every((b) => b)
}

function visitAllValidPages (startPath = pagesPath, url, cb) {
  readDirSync(startPath)
    .filter((n) => isDirectory(join(startPath, n)))
    .forEach((n) => {
      const p = join(startPath, n)
      const subUrl = join(url, n)
      if (validateRequiredStructure(p)) {
        cb(subUrl)
      }

      const subPagesPath = join(p, 'pages')
      if (isDirectory(subPagesPath)) {
        visitAllValidPages(subPagesPath, subUrl, cb)
      }
    })
}

function getValidPages () {
  const pages = []
  visitAllValidPages(undefined, '', (pn) => pages.push(pn))
  return pages
}

function getGlobalData () {
  return JSON.parse(readFileSync(join(srcPath, './global/data.json')))
}

function getPartialPageData (page) {
  return JSON.parse(readFileSync(join(srcPath, `./pages/${pageNameToPath(page)}/data.json`)))
}

async function render (page) {
  let html = ''
  try {
    const data = {
      ...getGlobalData(),
      ...getPartialPageData(page)
    }

    const partialPageTemplatePath = join(srcPath, `./pages/${pageNameToPath(page)}/templates/index.ejs`)
    const partialPageHtml = await ejs.renderFile(partialPageTemplatePath, { data })

    const globalTemplatePath = join(srcPath, `./global/templates/index.ejs`)
    html = await ejs.renderFile(globalTemplatePath, {
      publicPath,
      page,
      data,
      partialPageHtml
    })
  } catch (error) {
    const errorTemplatePath = join(__dirname, './templates/error.ejs')
    html = await ejs.renderFile(errorTemplatePath, { error })
  }
  return html
}

function getWebpackEntries (pages) {
  const entries = {}
  entries.global = [
    join(srcPath, 'global/scss/vendors.scss'),
    join(srcPath, 'global/scripts/index.js'),
    join(srcPath, 'global/scss/index.scss'),
  ]
  pages.forEach((page) => {
    entries[page] = [join(srcPath, `pages/${pageNameToPath(page)}/scripts/index.js`), join(srcPath, `pages/${pageNameToPath(page)}/scss/index.scss`)]
  })
  return entries
}

function getBuildFunctions (pages) {
  const obj = {}
  pages.forEach((page) => {
    obj[page] = async () => {
      const tp = page.split('/').slice(0, -1).join('/')
      try {
        fs.mkdirSync(join(tempPath, tp), { recursive: true })
      } catch (err) { }
      const html = await render(page)
      await fs.promises.writeFile(join(tempPath, `${page}.html`), html)
    }
  })
  return obj
}

class BuildTool {

  constructor() {
    this.currentPage = 'index'
    this.pages = getValidPages()
  }

  getWebpackEntries () {
    return getWebpackEntries(this.pages)
  }

  getBuildFunctions () {
    return getBuildFunctions(this.pages)
  }

  async buildAll (init = false) {
    if (init) {
      if (!validateRequiredStructure(globalPath)) {
        console.log('The \'global\' folder\'s structure is invalid')
        exit(1)
      }
      rm.sync(tempPath)
      tryMakeDirSync(tempPath)
    }
    for (const build of Object.values(this.getBuildFunctions())) {
      await build()
    }
  }

  registerTemplateWatcher () {
    const isEnabled = () => !!process.firstCompileDone

    const createWaitingPromise = () => {
      let resume
      const promise = new Promise((resolve) => {
        resume = resolve
      })
      return {
        promise,
        resume
      }
    }
    let waiting = createWaitingPromise()
    const queue = []
    const runQueue = async () => {
      while (true) {
        if (queue.length === 0) {
          waiting = createWaitingPromise()
          await waiting.promise
        } else {
          await delay(1000)
          const task = queue.shift()
          await (task === 'global' ? this.buildAll() : this.getBuildFunctions()[task]())
        }
      }
    }
    const pushQueue = (task) => {
      if (!isEnabled()) return
      if (task === queue.slice(-1)[0]) return
      if (task === 'global') queue.length = 0
      queue.push(task)
      waiting.resume()
    }

    runQueue()

    chokidar.watch([
      join(srcPath, '**/*.{ejs,json}')
    ])
      .on('all', (e, p) => {
        if (!isEnabled()) return

        const [type, ...pagePathPartial] = relative(srcPath, p).split('/')
          .filter((s, i, a) => i === 0 || s === 'pages' || a[i - 1] === 'pages')
        const page = pagePathPartial.filter(p => p !== 'pages').join('/')
        if (type === 'global') {
          pushQueue('global')
        } else if (type === 'pages') {
          if (this.pages.includes(page)) {
            pushQueue(page)
          } else {
            console.log(chalk.yellowBright(`The page '${page}' is not included in the compilation, please restart the dev-server`))
          }
        }
      })
  }
}

const buildTool = new BuildTool()

module.exports = buildTool