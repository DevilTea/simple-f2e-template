const { normalize } = require('path')
const chalk = require('chalk')
const buildTool = require('./build/build-tool')
const { tempPath, distPath, srcPath, pageNameToPath, join } = require('./build/utils')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const { ESBuildPlugin, ESBuildMinifyPlugin } = require('esbuild-loader')
const WebpackMessages = require('webpack-messages');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const { publicPath } = require('./project.config')


module.exports = async (env) => {
  const isProduction = env.production
  const needAnalyzer = env.analyzer

  process.env.PURGE_TAILWINDCSS = isProduction

  await buildTool.buildAll(true)

  return {
    mode: isProduction ? 'production' : 'development',
    devtool: isProduction ? undefined : 'cheap-module-eval-source-map',
    entry: () => buildTool.getWebpackEntries(),
    output: {
      filename: `[name].[${isProduction ? 'contenthash' : 'hash'}].js`,
      path: normalize(distPath),
      publicPath
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          use: [
            'cache-loader',
            {
              loader: 'esbuild-loader',
              options: {
                target: 'es2015'
              }
            },
          ],
        },
        {
          test: /\.s[ac]ss$/i,
          use: [
            MiniCssExtractPlugin.loader,
            'cache-loader',
            'fast-css-loader',
            'postcss-loader',
            'sass-loader'
          ]
        },
      ],
    },
    plugins: [
      new CleanWebpackPlugin(),
      new CopyPlugin([
        {
          context: join(srcPath, 'global/'),
          from: 'public',
          ignore: ['.*']
        },
        ...buildTool.pages.map(page => ({
          context: join(srcPath, `pages/${pageNameToPath(page)}/`),
          from: 'public',
          ignore: ['.*']
        }))
      ]),
      new MiniCssExtractPlugin({ filename: '[name].[contenthash].css' }),
      new ESBuildPlugin(),
      new WebpackMessages({
        onComplete (name, stats) {
          const sec = (stats.endTime - stats.startTime) / 1e3
          if (!isProduction) {
            const baseUrl = 'http://' + process.env.devServerUrl + publicPath
            console.clear()
            console.log(
              `Pages:\n\n` +
              buildTool.pages.map(p => `    ${chalk.blueBright.underline(baseUrl + p + '.html')}`).join('\n') +
              '\n'
            )
            console.log(chalk.green(`Compiled${name} successfully in ${sec}s!`))
          } else {
            console.log(chalk.green(`Built${name} successfully in ${sec}s!`))
          }
        }
      }),
      ...buildTool.pages.map((page) => {
        return new HtmlWebpackPlugin({
          base: publicPath,
          template: join(tempPath, `${page}.html`),
          filename: `${page}.html`,
          chunks: ['global', page],
        })
      }),
      ...(needAnalyzer ? [new BundleAnalyzerPlugin()] : [])
    ],
    optimization: {
      moduleIds: 'hashed',
      runtimeChunk: 'single',
      splitChunks: {
        chunks: 'all',
      },
      minimize: true,
      minimizer: [
        new ESBuildMinifyPlugin({
          target: 'es2015' // Syntax to compile to (see options below for possible values)
        })
      ]
    },
    resolveLoader: {
      modules: [
        'node_modules'
      ]
    },
    stats: 'errors-warnings',
    devServer: isProduction ? undefined : {
      publicPath,
      contentBase: [
        normalize(tempPath),
        normalize(join(srcPath, 'global/public')),
        ...buildTool.pages.map(page => normalize(join(srcPath, `pages/${pageNameToPath(page)}/public`)))
      ],
      watchContentBase: true,
      hot: true,
      host: 'localhost',
      noInfo: true,
      overlay: true,
      compress: true,
      before (app, server, compiler) {
        process.firstCompileDone = false
        compiler.hooks.done.tap('FirstCompileDone', () => {
          if (!process.firstCompileDone) {
            process.firstCompileDone = true
          }
        })
        buildTool.registerTemplateWatcher()
      },
      onListening: function (server) {
        const { port } = server.listeningApp.address()
        process.env.devServerUrl = `localhost${port ? `:${port}` : ''}`
      }
    }
  }
}