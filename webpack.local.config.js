var webpack = require('webpack')
var path = require('path')
var BundleTracker = require('webpack-bundle-tracker')

var config = require('./webpack.base.config.js')

var ASSETS_DIR = path.resolve(__dirname, 'assets/');
var BUNDLE_DIR = ASSETS_DIR + '/bundles/';

config.devtool = 'source-map'

config.entry = [
  'webpack-dev-server/client?http://localhost:3000',
  'webpack/hot/only-dev-server',
  ASSETS_DIR + '/js/index',
]

config.output.publicPath = 'http://localhost:3000/assets/bundles/'

config.plugins = config.plugins.concat([
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new BundleTracker({
      path: ASSETS_DIR,
      filename: '/webpack-stats.json'
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development')
    })
])

config.module.loaders.push({
  test: /\.jsx?$/,
  include: ASSETS_DIR,
  exclude: /node_modules/,
  loaders: ['react-hot', 'babel?'+JSON.stringify({presets: ["es2016", "es2015", "stage-0", "react"]})]
})

module.exports = config
