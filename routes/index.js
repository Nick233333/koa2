const router = require('koa-router')()

module.exports = (app) => {
	router.get('/', require('./home').index)
	router.get('/about', require('./about').index)
	router.get('/signup', require('./user').signup)

  app
    .use(router.routes())
    .use(router.allowedMethods())
}
