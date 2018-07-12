const path = require('path');
const webpack = require('webpack');

module.exports = {
  context: __dirname,
  mode: 'development',
  entry: './index.js',
  target: 'web',
  watch: true,
  plugins: [
    new webpack.ProvidePlugin({
      $: 'jquery'
    }),
    new webpack.optimize.LimitChunkCountPlugin({
      // loading chunks was giving some issue so 
      // we limit output chunk to 1 file for now
      maxChunks: 1,
    }),
  ],
  output: {
    filename: 'neuGFX.min.js',
    library: 'NeuGFX',
    libraryTarget: 'umd',
    umdNamedDefine:true,
    libraryExport: 'NeuGFX',
    path: __dirname + '/lib/',
    publicPath: '/lib/'
  },
  resolve: {
    modules: [
      'node_modules',
    ],
  },
  module: {
    rules: [

      {
        test: /sigma.*/,
        use: 'imports-loader?this=>window',
      },
      {
        test: /\.css$/,
        use: [ 'style-loader', 'css-loader' ]
      },
      {
        test: /\.js$/,
        loader: 'ify-loader'
    }
      //{ test: /\.js$/, use: 'babel-loader' },
    ]
  }
};
