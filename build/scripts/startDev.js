const nodemon = require('nodemon')
const slash = require('slash')
const chalk = require('chalk')

nodemon({
  watch: ["webpack.config.js", "tailwind.config.js"],
  exec: "npx webpack-dev-server --env.development"
})

nodemon.on('start', function () {
}).on('quit', function () {
  process.exit()
}).on('restart', function (files) {
  const names = files.map(f => chalk.blueBright(slash(f).split('/').slice(-1)[0]))
  console.clear()
  console.log(chalk.yellowBright('Restarting webpack-dev-server due to ' +  names.join(', ') + ' changed'))
})