const webpack = require('webpack');
const path = require('path');
const ROOT_PATH = path.resolve(__dirname, '../');

module.exports = {
  resolve: {
    symlinks: false,
    extensions: ['.js', '.jsx', 'json'],
    alias: {
      'react-dragzoom': path.resolve(ROOT_PATH, 'src'),
    },
  },
}
