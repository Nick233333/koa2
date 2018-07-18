const PostsModel = require('../models/posts');
let moment = require('moment');
moment.locale('zh-cn');
module.exports = {
	async index(ctx, next) {
        const query = {}
        const pageSize = 15
        const currentPage = parseInt(ctx.query.page) || 1
        const allPostsCount = await PostsModel.find(query).count()
        const pageCount = Math.ceil(allPostsCount / pageSize) 
        const posts = await PostsModel.find(query).skip((currentPage - 1) * pageSize).limit(pageSize)
        .populate([
            { path: 'category', select: ['name'] }
        ]);
        for (const post of posts) {
            post.meta.date = moment(post.meta.createdAt).startOf('hour').fromNow()
        }
        const baseUrl = `${ctx.path}?page=`
		await ctx.render('index', {
            title: 'koa2 + mongodb - 博客系统',
            posts,
            currentPage,
            pageCount,
		})
	}
}