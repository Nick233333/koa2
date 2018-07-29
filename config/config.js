require('dotenv').config()
module.exports = {
	port: process.env.PORT || 3000,
	session: {
		key: process.env.SESSION_KEY || '',
		maxAge: 86400000
	},
    mongodb: process.env.MONGODB,
    redis_password: process.env.REDIS_PASSWORD || '',
    redis_db_session: process.env.REDIS_DB_SESSION || '',
    redis_db_cache: process.env.REDIS_DB_CACHE || '',
    email_user: process.env.EMAIL_USER,
    email_password: process.env.EMAIL_PASSWORD,
    domain: process.env.DOMAIN,
    app_key: process.env.APP_KEY
}