const mongoose = require('mongoose');
const { validationResult } = require('express-validator');
const Product = require('../models/product');


//startgetAddProduct Middleware
exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Activity',
    path: '/admin/add-product',
    editing: false,
    hasError: false,
    errorMessage: null,
    validationErrors: []
  });
}; //end getAddProduct


//start postAddProduct Middleware
exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;  
  const date = req.body.date;
  const time = req.body.time;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors.array());
      return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Activity',
      path: '/admin/add-product',
      editing: false,
      hasError: true,
      product: {
        title: title,
        date: date,
        time: time,
        imageUrl: imageUrl,
        price: price,
        description: description
        },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    });
  }

  const product = new Product({
    title: title,
    date: date,
    time: time,
    imageUrl: imageUrl,
    price: price,
    description: description,
    userId: req.user
  });
  product
    .save()
    .then(result => {
      // console.log(result);
      console.log('Created Product');
      res.redirect('/admin/products');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
}; //end postAddProduct


//start getEditProduct Middleware
exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      if (!product) {
        return res.redirect('/');
      }
      res.render('admin/edit-product', {
        pageTitle: 'Edit Activity',
        path: '/admin/edit-product',
        //should this be add-product?
        editing: editMode,
        product: product,
        hasError: false,
        errorMessage: null,
        validationErrors: []
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};//end getEditProduct


//start postEditProduct Middleware
exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedDate = req.body.date;
  const updatedTime = req.body.time;
  const updatedImageUrl = req.body.imageUrl;
  const updatedPrice = req.body.price;
  const updatedDesc = req.body.description;
 
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Edit Activity',
      path: '/admin/edit-product',
      editing: true,
      hasError: true,
      product: {
        title: updatedTitle,
        date: updatedDate,
        time: updatedTime,
        imageUrl: updatedImageUrl,
        price: updatedPrice,
        description: updatedDesc,
        _id: prodId
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    });
  }

  Product.findById(prodId)
    .then(product => {
      product.title = updatedTitle;
      product.date = updatedDate;
      product.time = updatedTime;
      product.imageUrl = updatedImageUrl;
      product.price = updatedPrice;
      product.description = updatedDesc;
      return product.save()
        .then(result => {
          //console.log('UPDATED PRODUCT!');
          res.redirect('/admin/products');
        });
    })   
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
}; //end postEditProduct


//start getProducts Middleware
exports.getProducts = (req, res, next) => {
  //Product.find({ userId: req.user._id })
  Product.find({prodId: req._id})
    // .select('title price -_id')
    // .populate('userId', 'name')
    .then(products => {
      //console.log(products);
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Activities',
        path: '/admin/products'
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};//end getProducts


//start postDeleteProduct Middleware
exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.deleteOne({ _id: prodId, userId: req.user._id })
    .then(() => {
      console.log('DESTROYED PRODUCT');
      res.redirect('/admin/products');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};//end postDeleteProduct
