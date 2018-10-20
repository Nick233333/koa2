const PostsModel = require('../models/posts');
let moment = require('moment');
moment.locale('zh-cn');
module.exports = {
	async index(ctx, next) {
        let imgUrl;
        let QRCode = require('qrcode');
        QRCode.toDataURL(`https://${ctx.host}${ctx.url}`, {width: 230} , (err, url) => {
            imgUrl = url
        })
        const query = {}
        const pageSize = 15
        const currentPage = parseInt(ctx.query.page) || 1
        const allPostsCount = await PostsModel.find(query).countDocuments()
        const pageCount = Math.ceil(allPostsCount / pageSize) 
        const posts = await PostsModel.find(query).sort({'_id': -1}).skip((currentPage - 1) * pageSize).limit(pageSize)
                            .populate([
                                { path: 'category', select: ['name'] }
                            ]);
        let topPosts = await PostsModel.find({}, 'title').sort({'pv': -1}).limit(5);                       
        let newPosts = await PostsModel.find({}, 'title').sort({'_id': -1}).limit(5);
        for (const post of posts) {
            post.meta.date = moment(post.meta.createdAt).fromNow()
        }
        
		await ctx.render('index', {
            title: 'koa2 + mongodb - 博客系统',
            posts,
            currentPage,
            pageCount,
            newPosts,
            topPosts,
            imgUrl
		})
    },
    async search(ctx, next) {
        let query = ctx.query.title ? {title: ctx.query.title} : {title: ''};
        const currentPage = parseInt(ctx.query.page) || 1;
        const pageSize = 15;
        const allPostsCount = await PostsModel.find(query).countDocuments()
        const pageCount = Math.ceil(allPostsCount / pageSize)
        const pageStart = currentPage - 2 > 0 ? currentPage - 2 : 1
        const pageEnd = pageStart + 4 >= pageCount ? pageCount : pageStart + 4
        const posts = await PostsModel.find(query).sort({'_id': -1}).skip((currentPage - 1) * pageSize).limit(pageSize)
                            .populate([
                                { path: 'category', select: ['name'] }
                            ]);
        const baseUrl = ctx.query.title ? `${ctx.path}?title=${ctx.query.title}&page=` : `${ctx.path}?page=`
       
        for (const post of posts) {
            post.meta.date = moment(post.meta.createdAt).startOf('hour').fromNow()
        }
        await ctx.render('search', {
            title: `搜索${ctx.query.title}`,
            posts,
            pageSize,
            currentPage,
            allPostsCount,
            pageCount,
            pageStart,
            pageEnd,
            baseUrl
		})
    }
}