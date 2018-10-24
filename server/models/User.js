const mongoose = require('mongoose'),
	Schema = mongoose.Schema;

const userSchema = Schema({
	token: 'String',
	username: 'String',
	name: 'String',
	lastName: 'String',
	secondLastName: '',
	createdAt: 'Date',
	updateAt: 'Date',
	email: 'String',
	phone: 'String',
	password: 'String',
	status: 'Number',
	verifiedAccount: 'Number'
});

const Users = mongoose.model('users', userSchema);

module.exports = Users;