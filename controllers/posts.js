const PostsModel = require('../models/posts');
const CommentsModel = require('../models/comments');
const CategoryModel = require('../models/category')
let validator = require('validator');
let moment = require('moment');
moment.locale('zh-cn');

module.exports = {
    async index(ctx, next) {
        let imgUrl;
        let QRCode = require('qrcode');
        QRCode.toDataURL(`https://${ctx.host}${ctx.url}`, {width: 230} , (err, url) => {
            imgUrl = url
        })
        const c_name = ctx.query.name;
        const currentPage = parseInt(ctx.query.page) || 1;
        let c_id;
        let topPosts = await PostsModel.find({}, 'title').sort({'pv': -1}).limit(5);                       
        let newPosts = await PostsModel.find({}, 'title').sort({'_id': -1}).limit(5);
        if (c_name) {
            const cateogry = await CategoryModel.findOne({ name: c_name })
            if (cateogry) {
                c_id = cateogry._id
            } else {
                return ctx.render('posts_list', {
                    title: c_name,
                    topPosts,
                    newPosts,
                    imgUrl
                })    
            }
        }
        const pageSize = 15
        const query = c_id ? { category: c_id } : {}
        const allPostsCount = await PostsModel.find(query).countDocuments()
        const pageCount = Math.ceil(allPostsCount / pageSize)
        const pageStart = currentPage - 2 > 0 ? currentPage - 2 : 1
        const pageEnd = pageStart + 4 >= pageCount ? pageCount : pageStart + 4
        const posts = await PostsModel.find(query).sort({'_id': -1}).skip((currentPage - 1) * pageSize).limit(pageSize)
                            .populate([
                                { path: 'category', select: ['name'] }
                            ]);
        const baseUrl = c_name ? `${ctx.path}?name=${c_name}&page=` : `${ctx.path}?page=`
        for (const post of posts) {
            post.meta.date = moment(post.meta.createdAt).fromNow()
        }
        await ctx.render('posts_list', {
            title: c_name,
            posts,
            pageSize,
            currentPage,
            allPostsCount,
            pageCount,
            pageStart,
            pageEnd,
            baseUrl,
            topPosts,
            newPosts,
            imgUrl
		})
	},
    async create(ctx, next) {
        const categories = await CategoryModel.find({})
        if (ctx.method === 'GET') {
            await ctx.render('create', {
                title: '新建文章',
                categories
            })
            return;
        }
        if (validator.trim(ctx.request.body.title) === '') {
            ctx.flash = { warning: '文章标题不能为空' };
			return ctx.redirect('back');
        }
        if (validator.trim(ctx.request.body.content) === '') {
            ctx.flash = { warning: '文章内容不能为空' };
			return ctx.redirect('back');
        }
        const post = Object.assign(ctx.request.body, {
            author: ctx.session.user._id
        })
        
        const res = await PostsModel.create(post);
        ctx.flash = { success: '发表文章成功', userName: ctx.session.user.name };
        ctx.redirect(`/posts/${res._id}`);
    },
    async show(ctx, next) {
        try {
            const post = await PostsModel.findById(ctx.params.id)
            .populate([
                { path: 'author', select: 'name' },
                { path: 'category', select: ['title', 'name'] }
            ]);
            await PostsModel.findByIdAndUpdate(ctx.params.id, {
                pv: post.pv + 1
            })
            const comments = await CommentsModel.find({ postId: ctx.params.id })
            .populate({ path: 'from', select: 'name' })
            await ctx.render('post', {
                title: post.title,
                post,
                comments
            })
            
        } catch (error) {
            ctx.flash = { warning: '文章不存在' };
			return ctx.redirect('back');
        }
    },
    async edit(ctx, next) {
        if (ctx.method === 'GET') {
            const post = await PostsModel.findById(ctx.params.id)
            .populate([
                { path: 'category', select: ['title', 'name'] }
            ]);
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
            const categories = await CategoryModel.find({})
            await ctx.render('edit', {
                title: '更新文章',
                post,
                categories
            })
            return
        }
        const { title, content, category } = ctx.request.body
        if (!title || !content || !category) {
            ctx.flash = { warning: '标题、内容、分类不得为空' };
			return ctx.redirect('back');
        }
        await PostsModel.findByIdAndUpdate(ctx.params.id, {
            title,
            content,
            category
        })
        ctx.flash = { success: '更新文章成功' }
        ctx.redirect(`/posts/${ctx.params.id}`)
    },
    async destroy(ctx, next) {
        let id = ctx.params.id;
        const post = await PostsModel.findById(id)
        if (!post) {
            throw new Error('文章不存在')
        }
        
        if (post.author.toString() !== ctx.session.user._id) {
            throw new Error('没有权限')
        }
        await PostsModel.findByIdAndRemove(id)
        await CommentsModel.deleteMany({ postId: id })
        ctx.flash = { success: '删除文章成功' }
        ctx.redirect('/')
    }
}