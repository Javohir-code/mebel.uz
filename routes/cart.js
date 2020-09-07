const express = require('express');
const router = express.Router();
const Product = require('../models/product');

router.get('/add/:product', async (req, res) => {
  var slug = req.params.product;

  const p = await Product.findOne({ slug: slug });
  if (typeof req.session.cart == 'undefined') {
    req.session.cart = [];

    req.session.cart.push({
      title: slug,
      qty: 1,
      price: parseFloat(p.price).toFixed(2),
      image: '/product_images/' + p._id + '/' + p.image,
    });
  } else {
    var cart = req.session.cart;
    var newItem = true;

    for (let i = 0; i < cart.length; i++) {
      if (cart[i].title == slug) {
        cart[i].qty++;
        newItem = false;
        break;
      }
    }

    if (newItem) {
      cart.push({
        title: slug,
        qty: 1,
        price: parseFloat(p.price).toFixed(2),
        image: '/product_images/' + p._id + '/' + p.image,
      });
    }
  }
  console.log(req.session.cart);
  res.redirect('back');
});

router.get('/checkout', async (req, res) => {
  if (req.session.cart && req.session.cart.length == 0) {
    delete req.session.cart;
    res.redirect('/cart/checkout');
  } else {
    var cart = req.session.cart;

    res.render('checkout', {
      title: 'Checkout',
      cart: cart,
    });
  }
});

router.get('/update/:product', (req, res) => {
  var slug = req.params.product;
  var cart = req.session.cart;
  var action = req.query.action;

  for (var i = 0; i < cart.length; i++) {
    if (cart[i].title == slug) {
      switch (action) {
        case 'add':
          cart[i].qty++;
          break;
        case 'remove':
          cart[i].qty--;
          if (cart[i].qty < 1) cart.splice(i, 1);
          break;
        case 'clear':
          cart.splice(i, 1);
          if (cart.length == 0) delete req.session.cart;
          break;
        default:
          console.log('Update problem');
          break;
      }
      break;
    }
  }
  res.redirect('/cart/checkout');
});

router.get('/clear', (req, res) => {
  delete req.session.cart;
  res.redirect('/cart/checkout');
});

module.exports = router;
