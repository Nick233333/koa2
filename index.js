const Koa = require('koa')
const path = require('path')
const views = require('koa-views')
const router = require('./routes')
const serve = require('koa-static')

const app = new Koa()

app.use(views(path.join(__dirname, 'views'), {
	map: { html: 'nunjucks' }
}))
app.use(serve(
  path.join(__dirname, 'public')
))
router(app)

app.listen(3000, () => {
	console.log('server is running at http://localhost:3000')
})