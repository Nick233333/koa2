const router = require('koa-router')()
const Home = require('../controllers/home')
const About = require('../controllers/about')
const User = require('../controllers/user')
const Posts = require('../controllers/posts')
const Comments = require('../controllers/comments')


async function isLoginUser(ctx, next) {
    if (!ctx.session.user) {
        ctx.flash = { warning: '未登录, 请先登录' }
        return ctx.redirect('/signin')
    }
    await next()
}

async function isAdmin(ctx, next) {
    if (!ctx.session.user) {
        ctx.flash = { warning: '未登录, 请先登录' }
        return ctx.redirect('/signin')
    }
    if (!ctx.session.user.isAdmin) {
        ctx.flash = { warning: '没有权限' }
        return ctx.redirect('back')
    }
    await next()
}
    
module.exports = (app) => {
  
    router.get('/', Home.index)
    router.get('/about', About.index)
    router.get('/signup', User.signup)
    router.post('/signup', User.signup)
    router.get('/signin', User.signin)
    router.post('/signin', User.signin)
    router.get('/signout', User.signout)
    router.get('/posts', Posts.index)
    router.get('/posts/new', isLoginUser, Posts.create)
    router.post('/posts/new', isLoginUser, Posts.create)
    router.get('/posts/:id', Posts.show)
    router.get('/posts/:id/edit',isLoginUser, Posts.edit)
    router.post('/posts/:id/edit',isLoginUser, Posts.edit)
    router.get('/posts/:id/delete',isLoginUser, Posts.destroy)
    router.post('/comments/new', isLoginUser, Comments.create)
    router.get('/comments/:id/delete', isLoginUser, Comments.destroy)

    app.use(router.routes());
    app.use(router.allowedMethods());
}
