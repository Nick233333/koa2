require('dotenv').config()
module.exports = {
	port: process.env.PORT || 3000,
	session: {
		key: process.env.SESSION_KEY,
		maxAge: 86400000
	},
    mongodb: process.env.MONGODB,
    redis_password: process.env.REDIS_PASSWORD || '',
    redis_db_session: process.env.REDIS_DB_SESSION || '',
    static_path: process.env.STATIC_PATH
}