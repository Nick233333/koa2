const CommentsModel = require('../models/comments');
let validator = require('validator');

module.exports = {
    async create(ctx, next) {
        let { content, postId } = ctx.request.body;
        if (validator.trim(content) === '') {
            ctx.flash = { warning: '评论内容不能为空' }
            return ctx.redirect('back')
        }
        content = validator.escape(content)
        const comment = Object.assign({ content, postId }, {
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