var webpack = require('webpack');
var path = require('path');
var BundleTracker = require('webpack-bundle-tracker')
var autoprefixer = require('autoprefixer');

var ASSETS_DIR = path.resolve(__dirname, 'assets/');
var BUNDLE_DIR = ASSETS_DIR + '/bundles/';

var config = {
  entry: [
    'webpack-dev-server/client?http://localhost:3000',
    'webpack/hot/only-dev-server',
    ASSETS_DIR + '/js/index',
  ],
  output: {
    path: BUNDLE_DIR,
    filename: '[name]-[hash].js',
    publicPath: 'http://localhost:3000/assets/bundles/',
  },
  module: {
    context: __dirname,
    entry: ASSETS_DIR + 'js/index',
    loaders: [
      {
        test: /\.jsx?$/,
        include: ASSETS_DIR,
        exclude: /node_modules/,
        loaders: ['react-hot', 'babel?'+JSON.stringify({presets: ["es2016", "es2015", "stage-0", "react"]})]
      },
      {
        test: /(\.scss|\.sass| \.css)$/,
            loader: "style-loader!css-loader?sourceMap&importLoaders=1!postcss-loader!sass?sourceMap"
      },
      {
        test: /vendor\/.+\.(jsx|js)$/,
        loader: 'imports?jQuery=jquery,$=jquery,this=>window'
      }
    ]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new BundleTracker(
      {
        path: ASSETS_DIR,
        filename: '/webpack-stats.json'
      }
    ),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development')
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
