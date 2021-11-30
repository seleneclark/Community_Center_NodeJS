// const sgMail = require('@sendgrid/mail');
const Product = require('../models/product');
const Order = require('../models/order');
const User = require('../models/user');
require('dotenv').config();

const ITEMS_PER_PAGE = 3;

// const SG_EMAIL = process.env.SG_EMAIL;
 
 
//start getProducts Middleware
// exports.getProducts = (req, res, next) => {
//   Product.find()
//     .then(products => {
//       console.log(products);
//       res.render('shop/product-list', {
//         prods: products,
//         pageTitle: 'All Products',
//         path: '/products'
//       });
//     })
//     .catch(err => {
//       console.log(err);
//       const error = new Error(err);
    
//       error.httpStatusCode = 500;
//       return next(error);
//   });
// };//end getProducts Middleware
 
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

// exports.getIndex = (req, res, next) => {
//   Product.find()
//     .then(products => {
//       res.render('shop/index', {
//         prods: products,
//         pageTitle: 'Shop',
//         path: '/'
//       });
//     })
//     .catch(err => {
//       const error = new Error(err);
//       error.httpStatusCode = 500;
//       return next(error);
//     });
// }; 

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


    // console.log(products[3].productId)
      sortedArray = []
    //   productArray = []
     products.forEach(order => { 
      sortedArray.push(order.productId)
        });
        // productArray = productsBigArray1.flat();

              // console.log(productArray.date)

        // productArray.forEach(p => {
        //   // console.log(p.product.date);
        //   console.log(p.date);
        // })
        // var array = [{id: 1, date: '2021-11-12'}, {id: 2, date: '2021-11-2'}];

        sortedArray.sort(function(a,b){
          var c = new Date(a.date);
          var d = new Date(b.date);
          return c-d;
          });
          // console.log(productArray)

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
    //    return sgMail
    //       .send({
    //         to: req.body.email,
    //         from: SG_EMAIL,
    //         subject: 'Order',
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
        productsBigArray = []
        productArray = []
        orders.forEach(order => { 
            productsBigArray.push(order.products)
          });
          productArray = productsBigArray.flat();
          // productArray.forEach(p => {
          //   // console.log(p.product.date);
          //   // console.log(p);
          // })
          // var array = [{id: 1, date: '2021-11-12'}, {id: 2, date: '2021-11-2'}];

          productArray.sort(function(a,b){
            var c = new Date(a.product.date);
            var d = new Date(b.product.date);
            return c-d;
            });

          // console.log(productArray)
          
          //productsMedArray.push(productsBigArray[0])
          //console.log(productsBigArray[0])
          //console.log(productsBigArray[0][0].product.date)    
          // productsArray.push(order.products)
          //for (let i = 0; i < productsArray.length; i++) {
            //for (let n = 0; n < productsArray[i].length; i++) {
              //single.push(productsArray[i][n])
              //}
            //}                  
          //order.products.forEach(p => {         
            //}); 
          //});
          // console.log(single)
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
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
      // const orderss = orders.products
 
      // create a list of all the activities that people are signed up for
      products = [];
      activities = []
      singleActivities = []
      orders.forEach(o => {
      // products.push(o.products)
      // })
      // products.forEach(p => {
      //   p.forEach(smallest => {
      //     activities.push(smallest.product.title)
      //     if (String((singleActivities.includes (smallest.product.title))) === 'false') {
      //       singleActivities.push(smallest.product.title)
      //     }
      //   })
      // })

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
        pageTitle: 'Your Orders',
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