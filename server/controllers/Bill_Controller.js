'use strict'
const jwt = require('jsonwebtoken')
const moment = require('moment')
const crypto = require('crypto')
const billModel = require('../models/Bill')
const productModel = require('../models/Product')
const tools = require('../config/utils/tools')

function newBill(billJson, userID, req, res){
	//me falta validar que ya existe
	//revisar cuando vienen varios
	existTheNumberBill(billJson.FacturaElectronica.NumeroConsecutivo, function(exist){
		if (exist){
			res.status(400).json({
				message: 'La factura ya existe en los registros.'
			})
		}
		else{
			let detailProducts = billJson.FacturaElectronica.DetalleServicio.LineaDetalle

			//me falta hacer un loop
			//console.log(detailProducts)
			let productItemToSave = new Array();
			if(Array.isArray(detailProducts)){
				for (var item in detailProducts) {
					console.log(detailProducts[item])
					productItemToSave.push({
						row : detailProducts[item].NumeroLinea,
						code: detailProducts[item].Codigo ? detailProducts[item].Codigo.Codigo || '' : '',
						detail : detailProducts[item].Detalle,
						quantity: detailProducts[item].Cantidad,
						priceunit: detailProducts[item].PrecioUnitario,
						totalrow: detailProducts[item].MontoTotal
					});
				}
			}
			else{
				productItemToSave.push({
					row : detailProducts.NumeroLinea,
					code: detailProducts.Codigo ? detailProducts.Codigo.Codigo || '' : '',
					detail : detailProducts.Detalle,
					quantity: detailProducts.Cantidad,
					priceunit: detailProducts.PrecioUnitario,
					totalrow: detailProducts.MontoTotal
				});
			}

			console.log(productItemToSave)
			//const productsToSave = productModel;

			//se devuelve el usuaurio
			productModel.insertMany(productItemToSave).then(function (productsSave) {
				const emisor = billJson.FacturaElectronica.Emisor

				const receptor = billJson.FacturaElectronica.Receptor

				const billsToSave = new billModel({
					user_id :userID,
					consecutive : billJson.FacturaElectronica.NumeroConsecutivo,
					date: billJson.FacturaElectronica.FechaEmision,

					nameissuing: emisor.Nombre,
					idissuing : emisor.Identificacion.Numero,
					typeidissuing : emisor.Identificacion.Tipo,
					addressissuing : emisor.Ubicacion.OtrasSenas || '',
					phonesissuing :emisor.Telefono ? emisor.NumTelefono || '' : '',
					emailsissuing :emisor.CorreoElectronico,


					namereceiver: receptor.Nombre,
					idreceiver : receptor.Identificacion.Numero,
					typeidreceiver : receptor.Identificacion.Tipo,

					addressreceiver : receptor.Ubicacion ? receptor.Ubicacion.OtrasSenas || '' : '',
					phonesreceiver : receptor.Telefono ? receptor.NumTelefono || '' : '',
					emailsreceiver : receptor.CorreoElectronico,

					Products :productsSave,
					codemoney : billJson.FacturaElectronica.ResumenFactura.CodigoMoneda,
					totalwithtaxes : billJson.FacturaElectronica.ResumenFactura.TotalServGravados,
					totalnotaxes :billJson.FacturaElectronica.ResumenFactura.TotalServExentos,
					totalsales : billJson.FacturaElectronica.ResumenFactura.TotalVenta,
					totaltaxes :billJson.FacturaElectronica.ResumenFactura.TotalImpuesto
					// me falta el codigo de venta y tipo de venta

				});
				// console.log("billsToSave ",billsToSave);
				billsToSave.save().then(function (billsSaved) {
					res.status(200).json({
						message: 'Se ha guardado exitosamente.'
					})
				}).catch(function (err) {
					console.log(err);
					res.status(400).json({
						message: 'Error al guardar la factura.'
					})
				})
			}).catch(function (err) {
				console.log(err);
				res.status(400).json({
					message: 'Error al guardar los productos de la factura.'
				})
			})
		}
	})
}

function existTheNumberBill(numberOfBill, callback){
	billModel.find({'consecutive': numberOfBill},function (err, bills) {
        if(bills.length >0){
			callback(true);
		}
		else{
			callback(false);
		}
    });
}

function getAllBills(req, res){
	billModel.find({},function (err, bills) {
        res.send(bills);
    });
}

function deteleAllBills (req, res) {
	 billModel.deleteMany({},function(err) {
      if(err) { return handleError(res, err); }
      return res.sendStatus(200);
    });
}

function getAllProducts (req, res) {
	 productModel.find({},function (err, products) {
        res.send(products);
    });
}

function getBillsUser(userID, req, res){
	// revisar el tema del filtrado si esta definido aplicarlo
	let search = {'user_id': userID}
	if(req.query.search != undefined && req.query.search.trim() != ""){
		if(isNaN(req.query.search)){
			search = {
				'user_id' : userID,
				$or : [
					{'nameissuing' : { $regex: new RegExp(req.query.search)}},
					{'namereceiver' : { $regex: new RegExp(req.query.search)}},
					{'codemoney' : { $regex: new RegExp(req.query.search)}},
					{'idissuing' : { $regex: new RegExp(req.query.search)}},
					{'idreceiver' : { $regex: new RegExp(req.query.search)}}
				]
			}

		}
		else{
			search = {
				'user_id' : userID,
				$or : [
					{'nameissuing' : { $regex: new RegExp(req.query.search)}},
					{'namereceiver' : { $regex: new RegExp(req.query.search)}},
					{'codemoney' : { $regex: new RegExp(req.query.search)}},
					{'idissuing' : { $regex: new RegExp(req.query.search)}},
					{'idreceiver' : { $regex: new RegExp(req.query.search)}},
					{"$where": `function() { return this.consecutive.toString().match(/${req.query.search}/) != null; }`},
					{"$where": `function() { return this.totaltaxes.toString().match(/${req.query.search}/) != null; }`},
					{"$where": `function() { return this.totalsales.toString().match(/${req.query.search}/) != null; }`}
				]
			}
		}

	}

	if(req.query.order && req.query.sort){
		let sortDirection = 1
		if(req.query.order == 'desc'){
			sortDirection = -1
		}

		billModel.find(search, null, {sort:{[req.query.sort]: sortDirection}}, function(err, bills) {
			if(err){
				console.log(err)
				res.status(400).json({
					message: 'Error obtener los datos de las facturas.'
				})
			}
			else{
				res.status(200).json({rows: bills, total:bills.length});
			}
		})
	}
	else{
		billModel.find(search, function (err, bills) {
			if(err){
				console.log(err)
				res.status(400).json({
					message: 'Error obtener los datos de las facturas.'
				})
			}
			else{
				res.status(200).json({rows: bills, total:bills.length});
			}
		})
	}

}

function deteleAllProducts (req, res) {
	 productModel.deleteMany({},function(err) {
      if(err) { return handleError(res, err); }
      return res.sendStatus(200);
    });
}

function getCalculateBills(userID, req, res){
	let from  = moment(req.query.form_date_range_from,'DD/mm/YYYY').format('YYYY-mm-DDT00:00:00');
	let to = moment(req.query.form_date_range_to,'DD/mm/YYYY').format('YYYY-mm-DDT00:00:00');

	billModel.find({'user_id': userID,'date' : {'$gte' : from , '$lte' : to }},function (err, bills) {
		if(err){
			console.log(err)
			res.status(400).json({
				message: 'Error obtener los datos de las facturas.'
			})
		}
		let quantityBills =0;
		let totalTaxes = 0;
		let totalBills = 0
		for (var item in bills) {
			quantityBills += 1;
			totalTaxes += bills[item].totaltaxes;
			totalBills += bills[item].totalsales;
		}
		res.status(200).json({quantityBills:quantityBills, totalTaxes:totalTaxes, totalBills: totalBills})
    });
}

function getProductsByID (req, res) {
	let idsProducts = req.query.ids.split(',');
	productModel.find({_id : idsProducts},function (err, products) {
		if(err){
			console.log(err)
			res.status(400).json({
				message: 'Error obtener los datos de las facturas.'
			})
		}
		else{
			res.send({rows: products, total:products.length});
		}

	});
}

module.exports = {
	newBill,
	getAllBills,
	deteleAllBills,
	getAllProducts,
	getBillsUser,
	deteleAllProducts,
	getCalculateBills,
	getProductsByID
}