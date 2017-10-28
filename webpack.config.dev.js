const webpack = require('webpack');
const path = require('path');

module.exports = function (env) {
  return {
    context: path.join(__dirname, '/'),
    entry: './index-test.js',
    output: {
      path: path.join(__dirname, 'lib'),
      filename: './react-dragScale.js',
      library: 'ReactDragZoom',
      libraryTarget: 'umd',
      umdNamedDefine: true,
    },
    devtool: 'source-map',
    devServer: {
      historyApiFallback: true,
      hot: false,
      compress: true,
      filename: 'react-dragScale.js',
      contentBase: path.join(__dirname, '/'),
      publicPath: '/',
      port: 8002,
      host: '0.0.0.0',
      disableHostCheck: true,
    },
    module: {
      rules: [{
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: ['react-hot-loader', 'babel-loader?cacheDirectory=true'],
      }, {
        test: /\.less$/,
        use: ['style-loader', 'css-loader', 'less-loader'],
      }, {
        test: /\.css/,
        use: ['style-loader', 'css-loader'],
      }],
    },
  };
};
