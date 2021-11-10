const path = require('path');

const express = require('express');
const { check, body } = require('express-validator');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');
const isAdmin = require('../middleware/is-admin');
const router = express.Router();

    
// /admin/add-product => GET
router.get('/add-product', isAuth, isAdmin, adminController.getAddProduct);

// /admin/products => GET
router.get('/products', isAuth, isAdmin, adminController.getProducts);

// /admin/add-product => POST
router.post('/add-product',
    [
      body('title')
        .isString()
        .isLength({ min: 3 })
        .trim(),
      body('date')
        .isString()
        .isLength({min: 10})
        .trim(),
      body('time')
        .isString()
        .trim(),
      body('imageUrl')
        .isURL(),
      body('price')
        .isFloat(),
      body('description')
        .isString()
        .isLength({ min: 10, max: 500 })
        .trim()
    ],
    isAuth,
    isAdmin,
    adminController.postAddProduct
);

// /edit-product => GET
router.get('/edit-product/:productId', isAuth, isAdmin, adminController.getEditProduct);


// /edit-product => POST
router.post('/edit-product',
  [
    body('title')
      .isString()
      .isLength({ min: 3 })
      .trim(),
     body('date')
      .isDate(),
    body('imageUrl')
      .isURL(),
    body('price')
      .isFloat(),
    body('description')
      .isString()
      .isLength({ min: 10, max: 500 })
      .trim()
  ],
  isAuth,
  adminController.postEditProduct);

router.post('/delete-product', isAuth, isAdmin, adminController.postDeleteProduct);

module.exports = router;
