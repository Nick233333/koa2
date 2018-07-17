const CategoryModel = require('../models/category')

module.exports = {
    async list(ctx, next) {
        const categories = await CategoryModel.find({})
        await ctx.render('category', {
            title: '分类管理',
            categories
        })
    },
    async create(ctx, next) {
        if (ctx.method === 'GET') {
            await ctx.render('create_category', {
                title: '新建分类'
            })
            return
        }
        await CategoryModel.create(ctx.request.body)
        ctx.redirect('/category')
    },
    async destroy(ctx, next) {
        let id = ctx.params.id;
        if (id.length !== 24) {
            ctx.flash = { warning: '参数错误' }
            return ctx.redirect('back')
        }
        await CategoryModel.findByIdAndRemove(id)
        ctx.flash = { success: '删除分类成功' }
        ctx.redirect('/category')
    }
}