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
router.route('/dashboard').get(userController.getDahboard);
router.route('/getMyBills').get(userController.getBillsUserB);
router.route('/getCalculateBills').get(userController.getCalculateBills);

router.route('/getAllBills').get(billController.getAllBills);
router.route('/deleteAllBills').get(billController.deteleAllBills);
router.route('/deteleAllProducts').get(billController.deteleAllProducts);

router.route('/getAllProducts').get(billController.getAllProducts);
router.route('/getProductsByID').get(billController.getProductsByID);

module.exports = router
