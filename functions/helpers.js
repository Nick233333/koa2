module.exports = {
	userInfo: function(user, ctx) {
        ctx.session.user = {
            _id: user._id,
            name: user.name,
            isAdmin: user.isAdmin,
            email: user.email
        }
    }
}


