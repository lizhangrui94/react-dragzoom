const webpack = require('webpack');
const path = require('path');

module.exports = function (env) {
  return {
    context: path.join(__dirname, '/'),
    entry: './src/index.js',
    output: {
      path: path.join(__dirname, 'lib'),
      filename: './react-dragScale.js',
      library: 'ReactDragZoom',
      libraryTarget: 'umd',
      umdNamedDefine: true,
    },
    devtool: 'source-map',
    // plugins: [
    //   new webpack.DefinePlugin({
    //     'process.env': {NODE_ENV:  JSON.stringify("production")}
    //   })
    // ],
    module: {
      rules: [{
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: ['babel-loader?cacheDirectory=true'],
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
