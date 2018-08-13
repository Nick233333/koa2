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
const config = require('./config/config');
mongoose.connect(config.mongodb, { useNewUrlParser: true });
let figlet = require('figlet');

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

app.keys = [config.app_key];
let resources = require('./public/mix-manifest.json')

app.use(async (ctx, next) => {
	ctx.state.ctx = ctx
    ctx.state.marked = marked
    ctx.state.resources = resources
    ctx.state.domain = config.domain
	await next()
})
app.use(views(path.join(__dirname, 'views'), {
	map: { html: 'nunjucks' }
}));
app.use(serve(
	path.join(__dirname, 'public')
));
app.use(session({
	key: config.session.key,
    maxAge: config.session.maxAge,
    store: redisStore({
        auth_pass: config.redis_password,
        db: config.redis_db_session
    })
}, app));
app.use(bodyParser());
app.use(error())
app.use(flash());

router(app);
let server;
server = app.listen(process.env.PORT, async () => {
    await figlet('HELLO', (err, data) => {
        if (err) {
            console.log(err);
            return;
        }
        console.log(data);
        console.log(`server is running at http://127.0.0.1:${process.env.PORT}`)
    });
    
});
let onLineNum = 0;
let io = require('socket.io')(server);
io.on('connection', function (socket) {
    onLineNum++
    socket.broadcast.emit('open', {num: onLineNum})
    socket.on('disconnect', function() {
        onLineNum--
        socket.broadcast.emit('close', {num: onLineNum})
    });
    socket.on('get_num', function (data) {
        socket.emit('set_num', {num: onLineNum})
    });

    socket.on('news', function (data) {
        socket.broadcast.emit('news_posts', { msg: `${ data.userName } 发布了新文章！`, userName: data.userName});
    });
});
