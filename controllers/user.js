const bcrypt = require('bcryptjs')
let validator = require('validator');
const UsersModel = require('../models/users')
const helpers = require('../functions/helpers')

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
            ctx.flash = { success: '注册成功' };
            helpers.userInfo(result, ctx);
			ctx.redirect('/');
			
		} catch (error) {
            
			ctx.flash = { warning: '用户名或邮箱已存在，请更换' };
			return ctx.redirect('back');
		}
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
			helpers.userInfo(user, ctx);
			ctx.flash = { success: '登录成功' };
		  	ctx.redirect('/')
		} else {
			ctx.flash = { warning: '用户名或密码错误' };
			return ctx.redirect('back');
		}
	},
	signout(ctx, next) {
		ctx.session.user = null;
		ctx.flash = { warning: '退出登录' };
		ctx.redirect('/');
	}

}
