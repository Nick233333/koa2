const config = require('../config/config')
const redis = require("redis");
const redis_client = redis.createClient({db: 3, auth_pass: config.redis_password});
module.exports = async (ctx, next) => {
    
    let key = ctx.host + ctx.url;
    redis_client.get(key, function(err, res) {
        let limit_num = 0;
        if (res === null) {
            limit_num = 1;
        } else {
            limit_num = parseInt(res) + 1;
        }
        redis_client.set(key, limit_num, 'EX', 60, function(err, res) {
            if (res === 'OK') {
                if (limit_num >= 5) {
                    ctx.flash = { warning: '发布次数太频繁，稍后再试' }
                    return ctx.redirect('/')
                } 
            }   
        })
    })
    
    await next()
}
   