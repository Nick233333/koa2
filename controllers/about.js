module.exports = {
	async index(ctx, next) {
		await ctx.render('about', {
			title: 'about',
			desc: 'about页面'
		})
	}
}