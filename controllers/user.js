const bcrypt = require('bcryptjs')
let validator = require('validator');
const UsersModel = require('../models/users')
const helpers = require('../functions/helpers')
const config = require('../config/config')
const redis = require("redis");
const redisClient = redis.createClient({db: process.env.REDIS_DB_CACHE, auth_pass: config.redis_password});
const { promisify } = require('util');
const getAsync = promisify(redisClient.get).bind(redisClient);
const PostsModel = require('../models/posts');
let moment = require('moment');
moment.locale('zh-cn');

module.exports = {
    async index(ctx, next) {
        let id = ctx.params.id;
        let user = await UsersModel.findById(id, 'name email meta avatar github');
        user.date = moment(user.meta.createAt).format('LL');
        const pageSize = 15
        const currentPage = parseInt(ctx.query.page) || 1;
        let query = {'author': id};
        const allPostsCount = await PostsModel.find(query).countDocuments()
        const pageCount = Math.ceil(allPostsCount / pageSize)
        const pageStart = currentPage - 2 > 0 ? currentPage - 2 : 1
        const pageEnd = pageStart + 4 >= pageCount ? pageCount : pageStart + 4
        const posts = await PostsModel.find(query).sort({'_id': -1}).skip((currentPage - 1) * pageSize).limit(pageSize)
                            .populate([
                                { path: 'category', select: ['name'] }
                            ]);
        const baseUrl = `${ctx.path}?page=`;
        for (const post of posts) {
            post.meta.date = moment(post.meta.createdAt).startOf('hour').fromNow()
        }
        await ctx.render('user_index', {
            title: '个人中心',
            user,
            posts,
            pageSize,
            currentPage,
            allPostsCount,
            pageCount,
            pageStart,
            pageEnd,
            baseUrl,
        })
    },
	async signup(ctx, next) {
		if (ctx.method === 'GET') {
			await ctx.render('signup', {
				title: '用户注册'
			})
			return;
		}
		// 生成salt
		const salt = await bcrypt.genSalt(10);
		let { name, email, password, repassword } = ctx.request.body;
		
		if (validator.isEmpty(name) === true) {
			ctx.flash = { warning: '用户名不能为空' };
			return ctx.redirect('back');
		}
    	if (validator.isEmail(email) === false) {
			ctx.flash = { warning: '邮箱格式不正确' };
			return ctx.redirect('back');
		}
		if (validator.isLength(password, {min:6}) === false) {
			ctx.flash = { warning: '密码长度不符合，至少6位' };
			return ctx.redirect('back');
		}
		if (validator.equals(password, repassword) === false) {
			ctx.flash = { warning: '密码不一致' };
			return ctx.redirect('back');
		}
		
    	// 对密码进行加密
    	password = await bcrypt.hash(password, salt)
		const user = {
			name,
			email,
			password
		};
		try {
            const result = await UsersModel.create(user);
            let code = Math.floor(new Date()) + Math.random();
            redisClient.set(code, email);
            helpers.sendEmail(email, code, 'signin');
            ctx.flash = { success: '注册成功，请前往邮箱激活账号' };
            ctx.redirect('/');
			
		} catch (error) {
			ctx.flash = { warning: '用户名或邮箱已存在，请更换' };
			return ctx.redirect('back');
		}
    },
    async activate(ctx, next) {
        let code = ctx.params.code;
        await redisClient.get(code, async (err, res) => {
            if (res !== null) {
                await UsersModel.findOneAndUpdate({ email: res }, {
                    isActive: true,
                });
                redisClient.del(code) 
            } 
        });
        ctx.flash = { success: '激活成功' }; 
        ctx.redirect('/');
    },
	async signin(ctx, next) {
		if (ctx.session.user) {
			ctx.flash = { warning: '已登录' };
			ctx.redirect('back');
			return;
		}
		if (ctx.method === 'GET') {
			await ctx.render('signin', {
				title: '用户登录'
			})
		  	return;
		}
		const { name, password } = ctx.request.body;
		if (validator.isEmpty(name) === true) {
			ctx.flash = { warning: '用户名不能为空' };
			return ctx.redirect('back');
		}
		if (validator.isEmpty(password) === true) {
			ctx.flash = { warning: '密码不能为空' };
			return ctx.redirect('back');
		}
        const user = await UsersModel.findOne({ name });
        
		if (user && await bcrypt.compare(password, user.password)) {
            if (user.isActive === false) {
                ctx.flash = { warning: '邮箱未激活，请先激活邮箱' };
                return ctx.redirect('back');
            }
            if (user.isAuth === false) {
                ctx.flash = { warning: '账号权限异常，请联系管理员' };
                return ctx.redirect('back');
            }
            helpers.userInfo(user, ctx);
            ctx.flash = { success: '登录成功' };
            if (ctx.session['flash_url']) {
                ctx.redirect(ctx.session['flash_url'])
                return ctx.session['flash_url'] = null
            }
		  	ctx.redirect('/')
		} else {
			ctx.flash = { warning: '用户名或密码错误' };
			return ctx.redirect('back');
		}
	},
	async signout(ctx, next) {
		ctx.session.user = null;
		ctx.flash = { warning: '退出登录' };
		await ctx.redirect('/');
    },
    async email(ctx, next) {
        if (ctx.method === 'GET') {
			await ctx.render('email', {
				title: '找回密码'
			})
		  	return;
        }
        const { email } = ctx.request.body;
        if (validator.isEmail(email) === false) {
			ctx.flash = { warning: '邮箱格式不正确' };
			return ctx.redirect('back');
        }
        let user = await UsersModel.findOne({ email: email });
        if (!user) {
            ctx.flash = { warning: '邮箱存在' };
			return ctx.redirect('back');
        }
        let code = Math.floor(new Date()) + Math.random();
        await redisClient.set(code, email, 'EX', 60 * 60 *24);
        await helpers.sendEmail(email, code);
        ctx.flash = { success: '邮件已发送' };
        return ctx.redirect('back');
    },
    async reset(ctx, next) {
        if (ctx.method === 'GET') {
            let email = '';
            let code = ctx.params.code;
            const res = await getAsync(code);
            if (res !== null) {
                email = res;
                return ctx.render('reset', {
                    title: '设置密码',
                    email: email,
                    code: code
                })
            } else {
                ctx.flash = {warning: '邮件已过期'};
                return ctx.redirect('/');
            }
        }
        const { password, repassword, email } = ctx.request.body;
        if (validator.isLength(password, {min:6}) === false) {
			ctx.flash = { warning: '密码长度不符合，至少6位' };
			return ctx.redirect('back');
		}
		if (validator.equals(password, repassword) === false) {
			ctx.flash = { warning: '密码不一致' };
			return ctx.redirect('back');
        }
        await redisClient.del(ctx.params.code)
        const salt = await bcrypt.genSalt(10);
    	// 对密码进行加密
        let newPassword = await bcrypt.hash(password, salt);
        await UsersModel.findOneAndUpdate({ email: email }, {
            password: newPassword
        })
        ctx.flash = { success: '密码重置成功' };
		return ctx.redirect('/');
    }
}
