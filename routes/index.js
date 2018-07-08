const router = require('koa-router')()
const Home = require('../controllers/home')
const About = require('../controllers/about')
const User = require('../controllers/user')


module.exports = (app) => {
  router.get('/', Home.index)
  router.get('/about', About.index)
  router.get('/signup', User.signup)
  router.post('/signup', User.signup)
  router.get('/signin', User.signin)
  router.post('/signin', User.signin)
  router.get('/signout', User.signout)

  app
    .use(router.routes())
    .use(router.allowedMethods())
}
