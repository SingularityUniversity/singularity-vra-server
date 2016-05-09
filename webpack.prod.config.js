var webpack = require('webpack')
var path = require('path')
var BundleTracker = require('webpack-bundle-tracker')

var config = require('./webpack.base.config.js')

var ASSETS_DIR = path.resolve(__dirname, 'assets/');
var BUNDLE_DIR = ASSETS_DIR + '/bundles/';

config.output.path = require('path').resolve('./assets/dist')

config.plugins = config.plugins.concat([
  new BundleTracker({
      path: ASSETS_DIR,
      filename: '/webpack-stats-prod.json'
  }),
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify('production')
  }),
  // keeps hashes consistent between compilations
  new webpack.optimize.OccurenceOrderPlugin(),
  // minifies the code
  new webpack.optimize.UglifyJsPlugin({
    compressor: {
      warnings: false
    }
  })
])

config.module.loaders.push({
  test: /\.jsx?$/,
  include: ASSETS_DIR,
  exclude: /node_modules/,
  loaders: ['babel?'+JSON.stringify({presets: ["es2016", "es2015", "stage-0", "react"]})]
})

module.exports = config
