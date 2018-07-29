const config = require('../config/config')
const redis = require("redis");
const redisClient = redis.createClient({db: process.env.REDIS_DB_CACHE, auth_pass: config.redis_password});
const { promisify } = require('util');
const getAsync = promisify(redisClient.get).bind(redisClient);
module.exports = async (ctx, next) => {
    
    let key = ctx.host + ctx.url;
    let limit_num = 0;
    const res = await getAsync(key);
    if (res === null) {
        limit_num = 1;
    } else {
        limit_num = parseInt(res) + 1;
    }
    if (limit_num > 5) {
        ctx.flash = { warning: '发布次数太频繁，稍后再试' }
        return ctx.redirect('back')
    } else {
        await redisClient.set(key, limit_num, 'EX', 60)
    }
    await next()
}
   