'use strict'

const billModel = require('../models/Bill')
const productModel = require('../models/Product')
const jwt = require('jsonwebtoken')
const moment = require('moment')
const crypto = require('crypto')
const tools = require('../config/utils/tools')


function newBill(billJson, userID, req, res){
	var response = true;

	//me falta validar que ya existe
	//revisar cuando vienen varios
	var detailProducts = billJson.FacturaElectronica.DetalleServicio.LineaDetalle

		//me falta hacer un loop
		//console.log(detailProducts)
		const productItemToSave = new Array();
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
						message: 'Se ha guardado exitosamente'
					})
				}).catch(function (err) {
					console.log(err);
					res.status(400).json({
						message: 'Error al guardarlo2'
					})
				})
			}).catch(function (err) {
				console.log(err);
				res.status(400).json({
					message: 'Error al guardarlo1'
				})
			})

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
	billModel.find({'user_id': userID},function (err, bills) {
        res.send(bills);
    });
}

function deteleAllProducts (req, res) {
	 productModel.deleteMany({},function(err) {
      if(err) { return handleError(res, err); }
      return res.sendStatus(200);
    });
}

module.exports = {
	newBill,
	getAllBills,
	deteleAllBills,
	getAllProducts,
	getBillsUser,
	deteleAllProducts
}