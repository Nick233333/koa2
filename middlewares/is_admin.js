module.exports = async (ctx, next) => {
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
    
