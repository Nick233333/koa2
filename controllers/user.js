const bcrypt = require('bcryptjs')
let validator = require('validator');
const UsersModel = require('../models/users')
const helpers = require('../functions/helpers')
const config = require('../config/config')
const redis = require("redis");
const redis_client = redis.createClient({db: process.env.REDIS_DB_CACHE, auth_pass: config.redis_password});
module.exports = {
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
            redis_client.set(code, email);
            helpers.sendEmail(email, code);
            ctx.flash = { success: '注册成功，请前往邮箱激活账号' };
            ctx.redirect('/');
			
		} catch (error) {
			ctx.flash = { warning: '用户名或邮箱已存在，请更换' };
			return ctx.redirect('back');
		}
    },
    async activate(ctx, next) {
        let code = ctx.params.code;
        await redis_client.get(code, async (err, res) => {
            if (res !== null) {
                await UsersModel.findOneAndUpdate({ email: res }, {
                    isActive: true,
                });
                redis_client.del(code) 
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
    }
}
