var webpack = require('webpack');
var ProgressPlugin = require('webpack/lib/ProgressPlugin')
var path = require('path');
var webpackDevServer = require('webpack-dev-server')
var config = require('./webpack.config.js')(true)

//路由首地址
var ROUTE_PATH = ''

config.entry.app = ["webpack-dev-server/client?http://localhost:8002/", "webpack/hot/dev-server"].concat(config.entry.app);
var compiler = webpack(config)

var server = new webpackDevServer(compiler,{
  stats: {
    colors: true,
    progress:true,
  },
  inline:true,
  historyApiFallback: true,
  hot: true,
  compress: true,
  filename: "bundle.min.js",
  contentBase: SRC_PATH,
  publicPath: ROUTE_PATH + '/',
  // port: 8002,
  host: host,
  disableHostCheck: true,
  proxy: {
    '/iot/*': {
      target: 'https://iotat.h3c.com',
      secure: false,
      onProxyReq: function(proxyReq, req, rsp) {
        proxyReq.setHeader('cookie', cookie);
      }
    }
  }
})
// server
// config.entry.app = ["webpack-dev-server/client?http://localhost:8002/", "webpack/hot/dev-server"].concat(config.entry.app);

server.listen(8002,'localhost',function(err){
  if(err){
    console.log(err)
  }
  console.log('Listening at localhost:3000...')
})