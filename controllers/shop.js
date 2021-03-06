const sgMail = require('@sendgrid/mail');
const Product = require('../models/product');
const Order = require('../models/order');
const User = require('../models/user');
require('dotenv').config();

const ITEMS_PER_PAGE = 3;

sgMail.setApiKey(process.env.SG_API_KEY);
const SG_EMAIL = process.env.SG_EMAIL;
 
  
exports.getProducts = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;

  Product.find()
    .countDocuments()
    .then(numProducts => {
      totalItems = numProducts;
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then(products => {
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'Activities',
        path: '/products',
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

 
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
//with pagination
exports.getIndex = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;

  Product.find()
    .countDocuments()
    .then(numProducts => {
      totalItems = numProducts;
      return Product.find()
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE)
    })    
    .then(products => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Home',
        path: '/',
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
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
      sortedArray = []
     products.forEach(order => { 
      sortedArray.push(order.productId)
        });
        // sort so that soonest event is first
        sortedArray.sort(function(a,b){
          var c = new Date(a.date);
          var d = new Date(b.date);
          return c-d;
          });

      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: products,
        sortedArray: sortedArray,
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
    .then(result => {
      res.redirect('/orders');
    })
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
        productsBigArray = []
        productArray = []
        orders.forEach(order => { 
            productsBigArray.push(order.products)
          });
          productArray = productsBigArray.flat();
          // sort based on date so newest is first
          productArray.sort(function(a,b){
            var c = new Date(a.product.date);
            var d = new Date(b.product.date);
            return c-d;
            });

      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Enrolled',
        orders: orders,
        sortedActivities : productArray
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
}; //End getOrder middleware
 
//Start getAllOrders middleware
exports.getAllOrders = (req, res, next) => {
  Order.find()
    .then(orders => {
      // create a list of all the activities that people are signed up for
      products = [];
      activities = []
      singleActivities = []
      orders.forEach(o => {
      products.push(o.products)
      })
      products.forEach(p => {
        p.forEach(smallest => {
          activities.push(smallest.product.title)
          if (String((singleActivities.includes (smallest.product.title))) === 'false') {
            singleActivities.push(smallest.product.title)
          }
        })
      })

// use list of all activities and create 'occurrences' which stores the activity name & # of people signed up
// Example of what 'occurrences' looks like:
// {
//   'Ice Skating In The Gazebo': 7,
//   'Pottery Class': 4,
//   'Family game night': 3,
//   'Read-a-thon': 1
// }
      const occurrences = activities.reduce(function (acc, curr) {
        return acc[curr] ? ++acc[curr] : acc[curr] = 1, acc
      }, {});
 
      res.render('shop/all-orders', {
        path: '/all-orders',
        pageTitle: 'Enrolled',
        orders: orders,
        singleActivities: singleActivities,
        totalSignUps: occurrences
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
}; //End getAllOrder middleware

exports.getAbout = (req, res, next) => {
  res.render('about', {
    path: '/about',
    pageTitle: 'About Us',
    oldInput: {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    },
    validationErrors: []
  });
};