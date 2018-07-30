module.exports = {
	async index(ctx, next) {
		await ctx.render('about', {
			title: '关于',
			desc: 'node koa js'
		})
	}
}