const PostsModel = require('../models/posts');
const CommentsModel = require('../models/comments');

module.exports = {
    async index(ctx, next) {
		const posts = await PostsModel.find({})
		await ctx.render('index', {
            title: 'Koa2',
            desc: 'koa2 NodeJS Web 开发框架',
            posts
		})
	},
    async create(ctx, next) {
        if (ctx.method === 'GET') {
            await ctx.render('create', {
                title: '新建文章'
            })
            return;
        }
        const post = Object.assign(ctx.request.body, {
            author: ctx.session.user._id
        })
        const res = await PostsModel.create(post);
        ctx.flash = { success: '发表文章成功' };
        ctx.redirect(`/posts/${res._id}`);
    },
    async show(ctx, next) {
        try {
            const post = await PostsModel.findById(ctx.params.id)
            .populate({ path: 'author', select: 'name' });
            const comments = await CommentsModel.find({ postId: ctx.params.id })
            .populate({ path: 'from', select: 'name' })
            await ctx.render('post', {
                title: post.title,
                post,
                comments
            })
        } catch (error) {
            console.log(error)
            ctx.flash = { warning: '文章不存在' };
			return ctx.redirect('back');
        }
    },
    async edit(ctx, next) {
        if (ctx.method === 'GET') {
            const post = await PostsModel.findById(ctx.params.id)
            if (!post) {
                throw new Error('文章不存在')
                ctx.flash = { warning: '文章不存在' };
			    return ctx.redirect('back');
            }
            if (post.author.toString() !== ctx.session.user._id) {
                throw new Error('没有权限')
                ctx.flash = { warning: '没有权限' };
			    return ctx.redirect('back');
            }
            await ctx.render('edit', {
                title: '更新文章',
                post
            })
            return
        }
        const { title, content } = ctx.request.body
        await PostsModel.findByIdAndUpdate(ctx.params.id, {
            title,
            content
        })
        ctx.flash = { success: '更新文章成功' }
        ctx.redirect(`/posts/${ctx.params.id}`)
    },
    async destroy(ctx, next) {
        const post = await PostsModel.findById(ctx.params.id)
        if (!post) {
            throw new Error('文章不存在')
        }
        
        if (post.author.toString() !== ctx.session.user._id) {
            throw new Error('没有权限')
        }
        await PostsModel.findByIdAndRemove(ctx.params.id)
        ctx.flash = { success: '删除文章成功' }
        ctx.redirect('/')
    }
}