
module.exports = function (env) {
  if (env.prod) {
    return require('./webpack.config.prod.js')(env);
  }
  return require('./webpack.config.dev.js')(env);
};
