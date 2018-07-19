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
    async edit(ctx, next) {
        if (ctx.method === 'GET') {
            const category = await CategoryModel.findById(ctx.params.id)
            if (!category) {
                throw new Error('分类不存在')
                ctx.flash = { warning: '分类不存在' };
			    return ctx.redirect('back');
            }     
            await ctx.render('edit_category', {
                title: '编辑分类',
                category
            })
            return
        }
        const { title, name, desc } = ctx.request.body
        if (!title || !name || !desc) {
            ctx.flash = { warning: '标题、名称、分类不得为空' };
			return ctx.redirect('back');
        }
        await CategoryModel.findByIdAndUpdate(ctx.params.id, {
            title,
            name,
            desc
        })
        ctx.flash = { success: '更新成功' }
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