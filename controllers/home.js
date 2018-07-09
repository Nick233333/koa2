const PostsModel = require('../models/posts');
module.exports = {
	async index(ctx, next) {
		const posts = await PostsModel.find({})
		await ctx.render('index', {
			title: 'Koa2',
			desc: 'koa2 NodeJS Web 开发框架',
			posts
		})
	}
}