const router = require('koa-router')()
const Home = require('../controllers/home')
const About = require('../controllers/about')
const User = require('../controllers/user')
const Posts = require('../controllers/posts')

module.exports = (app) => {
  router.get('/', Home.index)
  router.get('/about', About.index)
  router.get('/signup', User.signup)
  router.post('/signup', User.signup)
  router.get('/signin', User.signin)
  router.post('/signin', User.signin)
  router.get('/signout', User.signout)
  router.get('/posts', Posts.index)
  router.get('/posts/new', Posts.create)
  router.post('/posts/new', Posts.create)
  router.get('/posts/:id', Posts.show)
  router.get('/posts/:id/edit', Posts.edit)
  router.post('/posts/:id/edit', Posts.edit)
  router.get('/posts/:id/delete', Posts.destroy)

  app
    .use(router.routes())
    .use(router.allowedMethods())
}
