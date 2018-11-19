'use strict'

const userModel = require('../models/User')
const billController = require('../controllers/Bill_Controller')
const jwt = require('jsonwebtoken')
const moment = require('moment')
const crypto = require('crypto')
const tools = require('../config/utils/tools')
const MailServices = require('../config/utils/mailServices')
const mailTemplates = require('../config/utils/emailTemplates')
const fs = require('fs')
const path = require('path')
const xmlReader = require('read-xml')
const multer = require('multer');
const pify = require('pify');
const parser = require('xml2json');

var sess;

function updateUser(req, res) {
	console.log('here')
	userModel.update(
		{ _id: "59cebae00016b06026ce9eb4" },
		{ $set: {
			token:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU5Y2ViYWUwMDAxNmIwNjAyNmNlOWViNCJ9.ZJVI_d4c4gC4JTd-Teiswx--4sWAa-TjYTwMKxwdM7Y"
		}}
	);
}

function getUser(req, res) {
	// body...
	userModel.find({},function (err, users) {
        res.send(users);
    });
}


function login (req, res) {
	return userModel.findOne({'email': req.body.email, password: encrypt(req.body.password)}).then(function (userData) {
		if (userData) {
			if(userData.verifiedAccount!=1){
				return res.status(400).json({ message: "El usuario no ha validado la cuenta." });
			}
			else{
				console.log('coseguido' +req.session);
				sess = req.session;
  				sess.email=req.body.email;
  				sess.user_id=userData.id;
				res.status(200).json({
					id: userData.id,
					token: userData.token,
					username: userData.username,
					name: userData.name,
					lastName: userData.lastName,
					secondLastName: userData.secondLastName,
					createdAt: userData.createdAt,
					updateAt: userData.updateAt,
					email: userData.email,
					facebook: userData.facebook,
					google: userData.google,
					phone: userData.phone,
					password: userData.password,
					status: userData.status,
					verifiedAccount: userData.verifiedAccount,
					avatar: userData.avatar,
					gender: userData.gender
				})
			}
		}
		else{
			return res.status(400).json({ message: "El usuario o contraseña invalida." });
		}
	});
}

function deteleUsers (req, res) {
	 userModel.deleteMany({},function(err) {
      if(err) { return handleError(res, err); }
      return res.sendStatus(200);
    });
}

function signup (req, res) {

	 // se busca primero para ver si no existe
	return userModel.findOne({'email': req.body.email}).then(function (userData) {
		if (userData) {
			console.log('coseguido: usuarui' );
			//return userData
			return res.status(400).json({ message: "El usuario que intenta registrar ya existe." });
		}
		else{
			console.log('guardando: ' + req.body.email);
			const dataToSave = new userModel({
				username: req.body.email,
				name: req.body.name,
				lastName: req.body.lastName,
				secondLastName: req.body.secondLastName,
				createdAt: moment(new Date()).format('DD-MMM-YYYY'),
				updateAt: moment(new Date()).format('DD-MMM-YYYY'),
				email: req.body.email,
				phone: req.body.phone,
				password: encrypt(req.body.password),
				status: 0,
				verifiedAccount: 0,
			});
			//se devuelve el usuaurio
			return dataToSave.save().then(function (userSaved) {

				var linkCode = new Date().getTime();
				MailServices.sendMail( {
					subject: "Confirmación de Correo Electrónico",
					to: userSaved.email,
					isText: false,
					msn: mailTemplates.accountConfirmation({
						name: userSaved.name,
						lastName: userSaved.lastName,
						encryptData: tools.encryptData(userSaved.id, 'aes256', "b33dd00", "el link de confirmación de correo.")
					})
				}, function (resp) {
					res.status(200).json({
						message: "Se ha enviado un correo."
					})
				});
				return userSaved
			})
		}
	}).catch(function (err) {
		// en caso de error se devuelve el error
		console.log('error: ' + err);
		return err
	})

}

function encrypt(password) {
	const shasum = crypto.createHash('sha256')
	shasum.update(password)
	return shasum.digest('hex')
}

function validateAccount(req, res) {

	if (!req.params.token) {
		return res.render('accountConfirmation', {
			isValid: false,
			type: 1
		});
	}

	const dataDecrypted = tools.decryptData(req.params.token, "aes256", "b33dd00", "el link de reinicio de contraseña"),
		// dataToArray = dataDecrypted.split('_'),
		// linkCode = dataToArray[0] || "",
		userID = dataDecrypted;

	userModel.findById(userID).then(function (userData) {
		if (!userData) {
			throw ({
				type: 2
			})
		} else if (userData.status === 1) {
			throw ({
				type: 3
			})
		}
		return userData
	}).then(function (userData) {
		const findBy = {
			_id: userData._id
		}
		const tempUserData = {
			status: 1,
			verifiedAccount : 1
		}
		return userModel.update(findBy, tempUserData).then(function (userUpdated) {
			if (userUpdated.ok !== 1) {
				throw ({
					type: 4
				})
			}
			userData.status = 1;
			userData.verifiedAccount = 1;
			return userData
		})
	}).then(function (userData) {
		return res.render('accountConfirmation', {
			isValid: true
		});
	}).catch(function (err) {
		// en caso de error se devuelve el error
		console.log('ERROR: ' + err.type)
		return res.render('accountConfirmation', {
			isValid: false,
			type: err.type
		});
	})
}

function resendMail(req, res) {
	// se busca primero para ver si no existe
	return userModel.findById(req.body.id).then(function (userData) {
		if (!userData) {
			throw ('El usuario que intenta buscar no existe.')
		}
		return userData
	}).then(function (userData) {
		var linkCode = new Date().getTime();
		MailServices.sendMail( {
			subject: "Confirmación de Correo Electrónico",
			to: userData.email,
			isText: false,
			msn: mailTemplates.accountConfirmation({
				name: userData.name,
				lastName: userData.lastName,
				encryptData: tools.encryptData(`${linkCode}_${userData._id}`, 'aes256', "b33dd00", "el link de confirmación de correo.")
			})
		}, function (resp) {
			if (resp.code === 200) {
				res.status(200).json({ message: "Se envió un email al correo indicado, favor verificarlo para continuar!" });
			} else {
				res.status(500).json({ message: "No se pudo enviar el email, favor verificar el email si es el correcto!" });
			}
		});
	}).catch(function (err) {
		// en caso de error se devuelve el error
		console.log('ERROR: ' + err)
		res.status(500).json({
			error: err
		})
	})
}

function createAccount(req, res){
	return res.render('createAccount')
}

function index(req, res){
	return res.render('index')
}

function sign(req, res){
	return res.render('sign')
}

function loadFiles(req, res){
	if (typeof sess !== 'undefined' && sess.email!=''){
		return res.render('loadFilesXML')
	}
	else{
		res.redirect('/users/index');
	}
}

function getDahboard(req, res){
	if (typeof sess !== 'undefined' && sess.email!=''){
		return res.render('getDahsboard')
	}
	else{
		res.redirect('/users/index');
	}
}



async function loadFile (req,res){
   	const storage = multer.diskStorage({
      destination: 'server/public/filesUpload/',
      filename(req, file, cb) {
        cb(null, file.originalname)
      },
    });
   	const upload = pify(multer({ storage }).single('newFile'))
   	const appDir = path.dirname(require.main.filename);

   	await upload(req, res)

	var newpath = appDir+'/server/public/filesUpload/'+req.file.originalname
	xmlReader.readXML(fs.readFileSync(newpath), function(err, data) {
	  	if (err) {
	    	console.error("erro3 ",err);
	    	res.status(500).json({
				error: err
			})
	  	}
	  	console.log("lllegegee1111");
	  	//tengo que serialzarlo y procesarlo.
	  	var newJson = JSON.parse(parser.toJson(data.content));
	  	console.log("to json -> %s", newJson.FacturaElectronica.NumeroConsecutivo);
	  	var response = billController.newBill(newJson, sess.user_id,req, res);
	});
}

function logout(req,res){
	if (typeof sess !== 'undefined' && sess.email!=''){
		sess.email = '';
	}
	req.logout()
  	res.redirect('/users/index');
}

function getBillsUserB(req,res){
	billController.getBillsUser(sess.user_id, req, res);
}

function getCalculateBills(req, res){
	if (typeof sess !== 'undefined' && sess.email!=''){
		billController.getCalculateBills(sess.user_id, req, res)
	}
	else{
		res.redirect('/users/index');
	}
}

module.exports = {
	login,
	signup,
	updateUser,
	validateAccount,
	resendMail,
	createAccount,
	getUser,
	deteleUsers,
	index,
	sign,
	loadFiles,
	loadFile,
	logout,
	getBillsUserB,
	getDahboard,
	getCalculateBills
}