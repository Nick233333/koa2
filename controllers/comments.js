const CommentsModel = require('../models/comments');
let validator = require('validator');

module.exports = {
    async create(ctx, next) {
        let { content } = ctx.request.body
        if (!content) {
            ctx.flash = { warning: '评论内容不能为空' }
            ctx.redirect('back')
            return
        }
        ctx.request.body.content = validator.escape(content)
        const comment = Object.assign(ctx.request.body, {
            from: ctx.session.user._id,
        });
        
        await CommentsModel.create(comment);
        ctx.flash = { warning: '评论成功' };
        ctx.redirect('back');
    },
    async destroy(ctx, next) {
        const commentId = ctx.params.id
        if (commentId.length !== 24) {
            ctx.flash = { warning: '参数错误' }
            ctx.redirect('back')
            return;
        }
        const comment = await CommentsModel.findById(commentId)
        if (!comment) {
            ctx.flash = { warning: '评论不存在' }
            ctx.redirect('back')
            return;
        }
        await CommentsModel.findByIdAndRemove(ctx.params.id)
        ctx.flash = { success: '删除成功' }
        ctx.redirect('back')
    }
  }