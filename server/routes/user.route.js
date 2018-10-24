'use strict'

const express = require('express')
const userController = require('../controllers/Users_Controller')
const billController = require('../controllers/Bill_Controller')
const router = express.Router()

router.route('/user')
	.get(userController.getUser);

router.route('/account').get(userController.createAccount);
router.route('/index').get(userController.index);
router.route('/sign').get(userController.sign);
router.route('/delete').get(userController.deteleUsers);
router.route('/loadFiles').get(userController.loadFiles);
router.route('/loadFile').post(userController.loadFile);

router.route('/getMyBills').get(billController.getBillsUser);


router.route('/getAllBills').get(billController.getAllBills);
router.route('/deleteAllBills').get(billController.deteleAllBills);
router.route('/getAllProducts').get(billController.getAllProducts);
module.exports = router
