const Koa = require('koa');
const path = require('path');
const views = require('koa-views');
const serve = require('koa-static');
const session = require('koa-session');
const mongoose = require('mongoose');
const bodyParser = require('koa-bodyparser');
const flash = require('./middlewares/flash')
const router = require('./routes');
const CONFIG = require('./config/config');
mongoose.connect(CONFIG.mongodb);

const app = new Koa();
app.use(flash());
app.keys = ['koa2'];
app.use(bodyParser());

app.use(async (ctx, next) => {
	ctx.state.ctx = ctx
	await next()
});

app.use(views(path.join(__dirname, 'views'), {
	map: { html: 'nunjucks' }
}));
app.use(serve(
	path.join(__dirname, 'public')
));

app.use(session({
	key: CONFIG.session.key,
	maxAge: CONFIG.session.maxAge
}, app));


router(app);

app.listen(3000, () => {
	console.log('server is running at http://localhost:3000')
});