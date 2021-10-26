const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
// const cors = require('cors');
// const session = require('express-session');
// const csrf = require('csurf');
require('dotenv').config();

// const errorController = require('./controllers/error');
// const User = require('./models/user');

const PORT = process.env.PORT || 5000;

const app = express();


app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));


//listening port 5000
app.listen(PORT, () => console.log(`Listening on ${PORT}`));