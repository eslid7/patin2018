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
		const productsToSave = new productModel({
				row : detailProducts.NumeroLinea,
				code: detailProducts.Codigo.Codigo,
				detail : detailProducts.Detalle,
				quantity: detailProducts.Cantidad,
				priceunit: detailProducts.PrecioUnitario,
				totalrow: detailProducts.MontoTotal
		})



			//se devuelve el usuaurio
			productsToSave.save().then(function (productsSave) {

				const billsToSave = new billModel({
					user_id :userID,
					consecutive : billJson.FacturaElectronica.NumeroConsecutivo,
					date: billJson.FacturaElectronica.FechaEmision,

					nameissuing: billJson.FacturaElectronica.Emisor.Nombre,
					idissuing : billJson.FacturaElectronica.Emisor.Identificacion.Numero,
					typeidissuing : billJson.FacturaElectronica.Emisor.Identificacion.Tipo,
					addressissuing : billJson.FacturaElectronica.Emisor.Ubicacion.OtrasSenas,
					phonesissuing :billJson.FacturaElectronica.Emisor.Telefono.NumTelefono,
					emailsissuing :billJson.FacturaElectronica.Emisor.CorreoElectronico,


					namereceiver: billJson.FacturaElectronica.Receptor.Nombre,
					idreceiver : billJson.FacturaElectronica.Receptor.Identificacion.Numero,
					typeidreceiver : billJson.FacturaElectronica.Receptor.Identificacion.Tipo,
					addressreceiver : billJson.FacturaElectronica.Receptor.Ubicacion.OtrasSenas,
					phonesreceiver : billJson.FacturaElectronica.Receptor.Telefono.NumTelefono,
					emailsreceiver : billJson.FacturaElectronica.Receptor.CorreoElectronico,

					Products :[productsSave],
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
					res.status(400).json({
						message: 'Error al guardarlo'
					})
				})
			}).catch(function (err) {
				res.status(400).json({
					message: 'Error al guardarlo'
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