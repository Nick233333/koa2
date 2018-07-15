const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UsersSchema = new Schema({
	name: {
		type: String,
		required: true,
		unique: true
	},
	email: {
		type: String,
		required: true,
		unique: true
	},
	password: {
		type: 'string',
		required: true
	},
	isAdmin: {
		type: Boolean,
		default: false
    },
    isAuth: {
		type: Boolean,
		default: true
	},
	meta: {
		createAt: {
			type: Date,
			default: Date.now()
		}	
	}
})

module.exports = mongoose.model('User', UsersSchema);