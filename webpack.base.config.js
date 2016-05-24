var webpack = require('webpack');
var path = require('path');
var BundleTracker = require('webpack-bundle-tracker')
var autoprefixer = require('autoprefixer');

var ASSETS_DIR = path.resolve(__dirname, 'assets/');
var BUNDLE_DIR = ASSETS_DIR + '/bundles/';

var config = {
  entry: './assets/js/index',
  output: {
    path: BUNDLE_DIR,
    filename: '[name]-[hash].js',
  },
  module: {
    context: __dirname,
    entry: ASSETS_DIR + 'js/index',
    loaders: [
      {
        test: /(\.scss|\.sass|\.css)$/,
            loader: "style-loader!css-loader?sourceMap&importLoaders=1!postcss-loader!sass?sourceMap"
      },
      {
        test: /vendor\/.+\.(jsx|js)$/,
        loader: 'imports?jQuery=jquery,$=jquery,this=>window'
      },
    ]
  },
  plugins: [
    new webpack.ProvidePlugin({
      Tether: 'tether',
      'window.Tether': 'tether'
    })
  ],
  postcss: [autoprefixer],
  resolve: {
    modulesDirectories: ['node_modules'],
    alias: {
      'react': path.join(__dirname, 'node_modules', 'react')
    },
    extensions: ['', '.js', '.jsx', '.sass', '.scss', '.css']
  }
};

module.exports = config;
