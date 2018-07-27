const Koa = require('koa');
const path = require('path');
const views = require('koa-views');
const serve = require('koa-static');
const session = require('koa-session');
const mongoose = require('mongoose');
const bodyParser = require('koa-bodyparser');
const marked = require('marked')
let redisStore = require('koa-redis');
const flash = require('./middlewares/flash')
const router = require('./routes');
const error = require('./middlewares/error_handler')
const CONFIG = require('./config/config');
mongoose.connect(CONFIG.mongodb, { useNewUrlParser: true });

marked.setOptions({
	renderer: new marked.Renderer(),
	gfm: true,
	tables: true,
	breaks: false,
	pedantic: false,
	sanitize: false,
	smartLists: true,
	smartypants: false
})
               
const app = new Koa();

app.keys = ['koa2'];

app.use(async (ctx, next) => {
	ctx.state.ctx = ctx
	ctx.state.marked = marked
	await next()
})
app.use(views(path.join(__dirname, 'views'), {
	map: { html: 'nunjucks' }
}));
app.use(serve(
	path.join(__dirname, 'public')
));
app.use(session({
	key: CONFIG.session.key,
    maxAge: CONFIG.session.maxAge,
    store: redisStore({
        auth_pass: CONFIG.redis_password,
        db: CONFIG.redis_db_session
    })
}, app));
app.use(bodyParser());
app.use(error())
app.use(flash());

router(app);

let server = app.listen(process.env.PORT, () => {
	console.log(`server is running at http://127.0.0.1:${process.env.PORT}`)
});
let io = require('socket.io')(server);
io.on('connection', function (socket) {
    socket.on('news', function (data) {
        socket.broadcast.emit('news_posts', { msg: `${ data.userName } 发布了新文章！`, userName: data.userName});
    });
});
