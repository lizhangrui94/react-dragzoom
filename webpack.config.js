var webpack = require('webpack')
var path = require('path')

module.exports = function(env){
  return {
    context:path.join(__dirname,'/')
    entry:{
      app:'./index.js',
      filename:'./dist/dragScale.js',
    },
    module:{
      rules:[{
        test:/\.jsx?$/,
        exclude:/node_modules/,
        use:['babel-loader?cacheDirectory=true']
      },{
        test:/\.less$/,
        use:["style-loader","css-loader"]
      }]
    }
  }
}