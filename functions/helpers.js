module.exports = {
	userInfo: function(user, ctx) {
        ctx.session.user = {
            _id: user._id,
            name: user.name,
            isAdmin: user.isAdmin,
            email: user.email
        }
    },
    sendEmail: function(email, code, type = '') {
        const nodemailer = require('nodemailer');
        const config = require('../config/config')
        let transporter = nodemailer.createTransport({
            service: 'qq', 
            port: 25, 
            secureConnection: true, // 使用了 SSL
            auth: {
                user: config.email_user,
                // 这里不是邮箱密码，是你设置的smtp授权码
                pass: config.email_password,
            }
        });
        let htmlDom;
        if (type === 'signin') {
            htmlDom = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>注册确认链接</title>
                </head>
                <body>
                <h1>感谢您在 koa2.hellocode.name 网站进行注册！</h1>
                <p>
                    请点击下面的链接进行账号激活：
                    <a href="${config.domain}/activate/${code}">
                    ${config.domain}/activate/${code}
                    </a>
                </p>
                <p>如果这不是您本人的操作，请忽略此邮件。</p>
                </body>
                </html>
                `;
        }
        htmlDom = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>重置密码</title>
                </head>
                <body>
                <h3>这是一封密码重置邮件，如果是您本人操作，请点击下面链接继续：</h3>
                <button>
                    <a href="${config.domain}/reset/${code}">
                        重置密码
                    </a>
                </button>
                <p>如果您并没有执行此操作，您可以选择忽略此邮件。</p>
                </body>
                </html>
                `;
        let mailOptions = {
            from: `koa2 <${config.email_user}>`, // 发件人
            to: email, // 收件人
            subject: 'koa2.hellocode.name 账号激活', // 主题
            // 发送text或者html格式
            // text: 'Hello world?', 
            html: htmlDom 
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                return;
            }
        });
    }
}


