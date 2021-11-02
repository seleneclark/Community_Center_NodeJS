const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
require('dotenv').config();

const errorController = require('./controllers/error');
const User = require('./models/user');

const PORT = process.env.PORT || 5000;

const MONGODB_URI = process.env.MONGODB_URI;

// console.log(process.env);
const app = express();

const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions'
});

//cross-site scripting token protection
const csrfProtect = csrf();

app.set('view engine', 'ejs');
app.set('views', 'views');

//start route connections
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

//session creation
app.use(session({
  secret: 'secretsession',
  resave: false,
  saveUninitialized: false,
  store: store
  })
);

app.use(csrfProtect);
app.use(flash());

//setup local variables
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

//get user
app.use((req, res, next) => {
  // throw new Error('Sync Dummy');
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch(err => {
      next(new Error(err));
    });
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

//heroku setup
const corsOptions = {
    origin: "https://fathomless-coast-59274.herokuapp.com/",
    optionsSuccessStatus: 200
};

//error pages handling
app.get('/500', errorController.get500);
app.use(errorController.get404);

app.use((error, req, res, next) => {
  // res.status(error.httpStatusCode).render(...);
  // res.redirect('/500');
  res.status(500).render('500', {
    pageTitle: 'Error!',
    path: '/500',
    isAuthenticated: req.session.isLoggedIn
  });
});

app.use(cors(corsOptions));

const options = {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    //useCreateIndex: true, //deprecated
    //useFindAndModify: false, //deprecated
    family: 4
};

//connect to mongoose database
mongoose
  .connect(
    MONGODB_URI, options
  )
.then(result => {
    //app start listening
    app.listen(PORT, () => console.log(`Listening on ${PORT}`));
  })
  .catch(err => {
    console.log(err);
});


