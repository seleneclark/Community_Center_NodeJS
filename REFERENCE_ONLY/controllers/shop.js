//const nodemailer = require('nodemailer');
//const sendgridTransport = require('nodemailer-sendgrid-transport');
const Product = require('../models/product');
const Order = require('../models/order');
const User = require('../models/user');
require('dotenv').config();

// const api_key = process.env.SG_API_KEY;
// const transporter = nodemailer.createTransport(sendgridTransport({
// auth: {
//   api_key: process.env.SG_API_KEY
// }
// }));

// const SG_EMAIL = process.env.SG_EMAIL;


//start getProducts Middleware
exports.getProducts = (req, res, next) => {
  Product.find()
    .then(products => {
      //console.log(products);
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All Products',
        path: '/products'
      });
    })
  .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};//end getProducts Middleware


//Start getProduct middleware
exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products'
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
//End getProduct middleware


//Start getIndex Middleware
exports.getIndex = (req, res, next) => {
  Product.find()
    .then(products => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/'
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
}; //End getIndex middleware


//Start getCart middleware
exports.getCart = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .then(user => {
      const products = user.cart.items;
      let total = 0;
      products.forEach(p => {
        total += p.quantity * p.productId.price;
        console.log(total);
        return total;
      })
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: products,
        totalSum: total
      });
    })
   .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
}; //End getCart middleware


//Start postCart middleware
exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then(product => {
      return req.user.addToCart(product);
    })
    .then(result => {
      //console.log(result);
      res.redirect('/cart');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
}; //End postCart middleware


//Start postCartDeleteProduct middleware
exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .removeFromCart(prodId)
    .then(result => {
      res.redirect('/cart');
    })
  .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};//End postCartDeleteProduct middleware


//start getCheckout middleware
// exports.getCheckout = (req, res, next) => {
//   req.user
//     .populate('cart.items.productId')
//     .then(user => {
//       const products = user.cart.items;
//       let total = 0;
//       products.forEach(p => {
//         total += p.quantity * p.productId.price;
//       })
//       res.render('shop/checkout', {
//         path: '/checkout',
//         pageTitle: 'Checkout',
//         products: products,
//         totalSum: total
//       });
//     })
//    .catch(err => {
//       const error = new Error(err);
//       error.httpStatusCode = 500;
//       return next(error);
//     //  console.log(err);
//     });
// }; //End getCheckout middleware


//Start postOrder Middleware
exports.postOrder = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .then(user => {
      const products = user.cart.items.map(i => {
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });   
      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user
        },
        products: products
      });
      return order.save();
    })
    .then(result => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect('/orders');
    })
    // .then(() => {
    //   return transporter.sendMail({
    //     to: req.user.email,
    //     from: SG_EMAIL,
    //     subject: 'Order',
    //     html: `<p>Dear ' + ${req.user.name}, <br>You order was successfully placed. We hope you enjoy your books.</p>`
    //   });
    // })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
}; //End postOrder middleware


//Start getOrders middleware
exports.getOrders = (req, res, next) => {
  Order.find({ 'user.userId': req.user._id })
    .then(orders => {
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
}; //End getOrder middleware
