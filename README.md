## 运行环境

```
Node v7.6+
Redis v4.0+
MongoDB v3.4+
```

## 安装

```
git clone https://github.com/Nick233333/koa2.git
cd koa2 
npm install
npm run dev 
or 
npm run production
cp .env.example .env
```
修改 Redis 和 MongoDB 的配置 以及 QQ 邮箱的授权码 SMTP 支持
开通方式：http://service.mail.qq.com/cgi-bin/help?subtype=1&id=28&no=166

## .env 参考配置

```
PORT=3000                  运行端口
SESSION_KEY=xxxx           session key
APP_KEY=xxx                加密 key

REDIS_DB_CACHE=2           缓存数据库
REDIS_DB_SESSION=1         session 数据库
REDIS_PASSWORD=xxx         redis密码，没有设置为空即可

MONGODB=mongodb://username:password@localhost:27017/koa2  mongodb 连接

EMAIL_USER=xxx@qq.com            开通发送邮件的 qq 邮箱
EMAIL_PASSWORD=xxx               SMTP 码，不是 qq 密码，也不是邮件密码
DOMAIN=http://127.0.0.1:3000     域名
```