module.exports = {
	port: process.env.PORT || 3000,
	session: {
		key: 'koa2',
		maxAge: 86400000
	},
	mongodb: 'mongodb://localhost:27017/koa2'
}