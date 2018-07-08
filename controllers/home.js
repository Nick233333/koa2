module.exports = {
	async index (ctx, next) {
		await ctx.render('index', {
			title: 'index',
			desc: 'index页面'
		})
	}
}