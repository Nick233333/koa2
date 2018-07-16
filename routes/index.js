const router = require('koa-router')()
const Home = require('../controllers/home')
const About = require('../controllers/about')
const User = require('../controllers/user')
const Posts = require('../controllers/posts')
const Comments = require('../controllers/comments')
const isLogin = require('../middlewares/is_login')

module.exports = (app) => {
  
    router.get('/', Home.index)
    router.get('/about', About.index)
    router.get('/signup', User.signup)
    router.post('/signup', User.signup)
    router.get('/signin', User.signin)
    router.post('/signin', User.signin)
    router.get('/signout', User.signout)
    router.get('/posts', Posts.index)
    router.get('/posts/new', isLogin, Posts.create)
    router.post('/posts/new', isLogin, Posts.create)
    router.get('/posts/:id', Posts.show)
    router.get('/posts/:id/edit',isLogin, Posts.edit)
    router.post('/posts/:id/edit',isLogin, Posts.edit)
    router.get('/posts/:id/delete',isLogin, Posts.destroy)
    router.post('/comments/new', isLogin, Comments.create)
    router.get('/comments/:id/delete', isLogin, Comments.destroy)
    
    app.use(router.routes());
    app.use(router.allowedMethods());
    //404 路由，必须放最后
    app.use(async (ctx, next) => {
        await ctx.render('404', {
            title: '404'
        })
    })
}
