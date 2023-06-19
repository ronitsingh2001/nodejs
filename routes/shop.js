const express = require('express')
// const path = require('path')

// const rootDir = require('../utils/path')
// const adminData = require('./admin');

const shopController = require('../controllers/shop')


const router = express.Router()
router.get('/', shopController.getIndex);
router.get('/cart', shopController.getCart);
router.post('/cart', shopController.postCart);
router.post('/cart-delete-item', shopController.postCartDeleteProduct);
router.post('/create-order', shopController.postOrders);
router.get('/orders', shopController.getOrders);
router.get('/products', shopController.getProducts);
router.get('/products/:productId', shopController.getProduct);
// router.get('/checkout', shopController.getCheckout);


module.exports = router;