const mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId;

const billSchema = Schema({
	user_id :'String',
	consecutive : 'Number',
	date: 'Date',

	nameissuing: 'String',
	idissuing :'String',
	typeidissuing :'String',
	addressissuing :'String',
	phonesissuing :'String',
	emailsissuing :'String',


	namereceiver: 'String',
	idreceiver :'String',
	typeidreceiver :'String',
	addressreceiver :'String',
	phonesreceiver :'String',
	emailsreceiver :'String',

	Products :  [{ type: ObjectId, ref: 'product' }],
	codemoney : 'String',
	totalwithtaxes :'Number',
	totalnotaxes :'Number',
	totalsales :'Number',
	totaltaxes :'Number'
});

const Bill = mongoose.model('bill', billSchema);

module.exports = Bill;