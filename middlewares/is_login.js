module.exports = async (ctx, next) => {
    if (!ctx.session.user) {
        ctx.flash = { warning: '未登录, 请先登录' }
        ctx.session['flash_url'] = ctx.url
        return ctx.redirect('/signin')
    }
    await next(ctx)
}
    
