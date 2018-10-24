const mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId;

const productSchema = Schema({
	row : 'Number',
	code: 'String',
	detail : 'string',
	quantity: 'Number',
	priceunit: 'Number',
	totalrow: 'Number'
});

const Product = mongoose.model('product', productSchema);

module.exports = Product;