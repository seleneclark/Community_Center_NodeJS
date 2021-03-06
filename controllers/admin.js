const mongoose = require('mongoose');
const { validationResult } = require('express-validator');
const Product = require('../models/product');
// get users so we can delete a product from all user carts if that product is deleted from database
const User = require('../models/user')
// get orders so we can delete a product from all orders if that product is deleted from database
const Order = require('../models/order')

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
      // sort so that oldest events are at top
        products.sort(function(a,b){
          var c = new Date(a.date);
          var d = new Date(b.date);
          return c-d;
          });

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

  // get all orders from database so we can loop through them and remove the deleted product from all orders
  Order.find()
  .then(orders => {
      // loop through each individual order
      orders.forEach(order => {
        const products = order.products;
        const user = order.user;
          // go through each order and check to see if deleted product exists in the order
          for (let i = 0; i < products.length; i++) {
            var deletedProductId = String(prodId);
            var currentProductId = String(products[i].product._id);
            if (currentProductId == deletedProductId) {
              // if deleted product does exist in the order then use splice to remove the deleted product
              products.splice(i, 1);
          }
        }
        // find order to update information
          Order.findById(order._id)
          // update values, the only change is the order will no longer contain deleted product
          .then(order => {
            order.products = products;
            order.user = user;
            return order.save()
        })
        })
        });

  // get all users from database to loop through each user to check if deleted product exists 
  // in that user's cart, and remove it (the cart breaks if it tries to call a deleted product) 
  // all users
  User.find()
    .then(users => {
      // loop through each individual user
      users.forEach(user => {
      const name = user.name;
      const email = user.email;
      const password = user.password;
      const cart = user.cart;
        // go through each user's cart and check to see if deleted product exists in their cart
        for (let i = 0; i < cart.items.length; i++) {
          if (cart.items[i].productId == prodId) {
            // if deleted product does exist in their cart, then use splice to remove the deleted product
            cart.items.splice(i, 1);
        }
      }
      // find user to update information
        User.findById(user._id)
        // update values, the only change is the cart will no longer contain deleted product
        .then(user => {
          user.name = name;
          user.email = email;
          user.password = password;
          user.cart = cart;
          return user.save()
      })
      })
      });

  Product.deleteOne({ _id: prodId })
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
