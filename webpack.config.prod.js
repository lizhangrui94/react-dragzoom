const webpack = require('webpack');
const path = require('path');

module.exports = function (env) {
  return {
    context: path.join(__dirname, '/'),
    entry: './index.js',
    output: {
      path: path.join(__dirname, 'dist'),
      filename: './react-dragScale.js',
    },
    devtool: 'source-map',
    module: {
      rules: [{
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: ['babel-loader?cacheDirectory=true'],
      }, {
        test: /\.less$/,
        use: ['style-loader', 'css-loader', 'less-loader'],
      }],
    },
  };
};
