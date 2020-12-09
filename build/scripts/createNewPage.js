const fs = require('fs')
const prompts = require('prompts');
const copydir = require('copy-dir')
const chalk = require('chalk')
const { pagesPath, readFileSync, readDirSync, tryMakeDirSync, join } = require("../utils")

async function createNewPage () {
  console.clear()
  const { page = '' } = await prompts({
    type: 'text',
    name: 'page',
    message: 'What is the new page\'s name?',
    validate: value => {
      return value.split('/')
        .every((partial) => {
          return /^[0-9a-zA-Z-_]+$/.test(partial)
        })
    }
  })

  if (page === '') {
    console.error(chalk.redBright(`The page name is empty`))
    return
  }

  const splitted = page.split('/')

  if (splitted.length > 1 && splitted.includes('index')) {
    console.error(chalk.redBright(`The page name 'index' is only allowed for top level page`))
    return
  }

  const newPagePath = join(pagesPath, splitted.join('/pages/'))
  tryMakeDirSync(newPagePath)

  if (readDirSync(newPagePath).length > 0) {
    console.error(chalk.redBright(`The folder '${newPagePath}' is not empty`))
    return
  }

  copydir.sync(join(__dirname, '../structureTemplate'), newPagePath)
  const scssPath = join(newPagePath, './scss/index.scss')
  fs.writeFileSync(scssPath, readFileSync(scssPath).replace('%PAGE%', page.split('/').slice(-1)[0]))
  const ejsPath = join(newPagePath, './templates/index.ejs')
  fs.writeFileSync(ejsPath, readFileSync(ejsPath).replace('%PAGE%', page.split('/').slice(-1)[0]))
  console.log(`New page '${page}' created`)
}

createNewPage()
