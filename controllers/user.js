const UserModel = require('../models/user')

module.exports = {
	async signup (ctx, next) {
		const user = {
			name: 'nick',
			email: 'nick_php@163.com',
			password: 'nick'
		}
		const result = await UserModel.create(user)
		ctx.body = result
	},
}
