const request = require('request');
module.exports = function errorHandler() {
    return async (ctx, next) => {
        try {
            await next()
        } catch (err) {
            request.post({
                url:`https://sc.ftqq.com/${process.env.SCKEY}.send`,
                form: {text: `${process.env.DOMAIN} 出现故障`, desp:`请求方法：${ctx.method}，请求地址：${ctx.url}， 错误信息：${err.message}`}
            })
            ctx.status = err.statusCode || err.status || 500
            await ctx.render('error', {
                title: ctx.status
            })
        }
    }
}
