const router = require('koa-router')()
const Home = require('../controllers/home')
const About = require('../controllers/about')
const User = require('../controllers/user')


module.exports = (app) => {
  router.get('/', Home.index)
  router.get('/about', About.index)
  router.get('/signup', User.signup)

  app
    .use(router.routes())
    .use(router.allowedMethods())
}
