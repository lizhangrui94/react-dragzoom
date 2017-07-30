
module.exports = function (env) {
    if(env.prod) {
        return require('./webpack.config.prod.js')(env);
    } else {
        return require('./webpack.config.dev.js')(env);
    }
};
