const bcrypt = require('bcryptjs')
let validator = require('validator');
const UserModel = require('../models/user')

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
			ctx.body = {msg: '用户名不能为空'};
			return;
		}
    	if (validator.isEmail(email) === false) {
			ctx.body = {msg: '邮箱格式不正确'};
			return;
		}
		if (validator.isLength(password, {min:6}) === false) {
			ctx.body = {msg: '密码长度不符合，至少6位'};
			return;
		}
		if (validator.equals(password, repassword) === false) {
			ctx.body = {msg: '密码不一致'};
			return;
		}
    	// 对密码进行加密
    	password = await bcrypt.hash(password, salt)
		const user = {
			name,
			email,
			password
		};
		try {
			const result = await UserModel.create(user);
			ctx.body = result;
			
		} catch (error) {
			
			ctx.body = {msg: '用户名或邮箱已存在，请更换'};
		}
	},
	async signin(ctx, next) {
		if (ctx.method === 'GET') {
			await ctx.render('signin', {
				title: '用户登录'
			})
		  	return;
		}
		const { name, password } = ctx.request.body;
		const user = await UserModel.findOne({ name });
		if (user && await bcrypt.compare(password, user.password)) {
			ctx.session.user = {
				_id: user._id,
				name: user.name,
				isAdmin: user.isAdmin,
				email: user.email
			}
		  	ctx.redirect('/')
		} else {
			ctx.body = '用户名或密码错误'
		}
	},
	signout(ctx, next) {
		ctx.session = null;
		ctx.redirect('/');
	}

}
