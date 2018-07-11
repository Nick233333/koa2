const CommentsModel = require('../models/comments');

module.exports = {
    async create(ctx, next) {
        const comment = Object.assign(ctx.request.body, {
            from: ctx.session.user._id
        });
        await CommentsModel.create(comment);
        ctx.flash = { success: '留言成功' };
        ctx.redirect('back');
    },
    async destroy(ctx, next) {
        const comment = await CommentsModel.findById(ctx.params.id)
        if (!comment) {
            throw new Error('留言不存在')
            ctx.flash = { success: '成功删除留言' }
        ctx.redirect('back')
        }
        if (comment.from.toString() !== ctx.session.user._id.toString()) {
            throw new Error('没有权限')
            ctx.flash = { success: '成功删除留言' }
            ctx.redirect('back')
        }
        await CommentsModel.findByIdAndRemove(ctx.params.id)
        ctx.flash = { success: '成功删除留言' }
        ctx.redirect('back')
    }
  }