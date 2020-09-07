const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const expressValidator = require('express-validator');
const bodyParser = require('body-parser');
const path = require('path');
const fileUpload = require('express-fileupload');
const passport = require('passport');
const app = express();
require('./config/passport')(passport);
const adminPage = require('./routes/admin_pages');
const adminCategory = require('./routes/admin_categories');
const adminProduct = require('./routes/admin_products');
const pages = require('./routes/pages');
const products = require('./routes/products');
const cart = require('./routes/cart');
const users = require('./routes/users');

mongoose
  .connect('mongodb://localhost/shopping-cart', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to the mongodb');
  })
  .catch((err) => {
    console.log('Error...', err);
  });

// register ejs
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// middleware and static files
app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'public')));
app.locals.errors = null;

// Get Page Model
const Page = require('./models/page');
const Category = require('./models/category');

// Get all pages to pass to header.ejs
async function passPage() {
  const pages = await Page.find({}).sort({ sorting: 1 });
  app.locals.pages = pages;
}

passPage();

async function passCategory() {
  const categories = await Category.find({});
  app.locals.categories = categories;
}

passCategory();

app.use(fileUpload());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());
app.use(
  session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    // cookie: { secure: true },
  })
);

app.use(
  expressValidator({
    errorFormatter: function (param, msg, value) {
      var namespace = param.split('.');
      var root = namespace.shift();
      var formParam = root;

      while (namespace.length) {
        formParam += '[' + namespace.shift() + ']';
      }
      return {
        param: formParam,
        msg: msg,
        value: value,
      };
    },
    customValidators: {
      isImage: function (value, filename) {
        var extension = path.extname(filename).toLowerCase();
        switch (extension) {
          case '.jpg':
            return '.jpg';
          case '.jpeg':
            return '.jpeg';
          case '.png':
            return '.png';
          case '':
            return '.jpg';
          default:
            return false;
        }
      },
    },
  })
);

app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

app.use(passport.initialize());
app.use(passport.session());

app.get('*', (req, res, next) => {
  res.locals.cart = req.session.cart;
  res.locals.user = req.user || null;
  next();
});

app.use('/admin/pages', adminPage);
app.use('/admin/categories', adminCategory);
app.use('/admin/products', adminProduct);
app.use('/products', products);
app.use('/cart', cart);
app.use('/users', users);
app.use('/', pages);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`${port} port listened...`);
});
