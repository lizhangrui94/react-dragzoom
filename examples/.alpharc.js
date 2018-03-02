const config = {
  devServer:{
    proxy:{
    },
  },
  extraBabel:{
    plugins:[]
  },
  env:{
    development:{
    }
  },
  mockConfig:{
    basicResponse:{
      statusCode:{ name:'code', value:0},
      responseBody:{ name:'result', value:'success'}
    }
  }
}

module.exports = config