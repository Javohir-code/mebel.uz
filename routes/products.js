const express = require('express');
const Product = require('../models/product');
const Category = require('../models/category');
const router = express.Router();
const fs = require('fs-extra');

router.get('/', async (req, res) => {
  const products = await Product.find({});
  res.render('all_products', {
    title: 'All Products',
    products: products,
  });
});

router.get('/:category', async (req, res) => {
  var categorySlug = req.params.category;

  const c = await Category.findOne({ slug: categorySlug });
  const products = await Product.find({ category: categorySlug });

  res.render('cat_products', {
    title: c.title,
    products: products,
  });
});

router.get('/:category/:product', async (req, res) => {
  var galleryImages = null;
  var loggedIn = (req.isAuthenticated()) ? true : false;

  const product = await Product.findOne({ slug: req.params.product });

  var galleryDir = 'public/product_images/' + product._id + '/gallery';
  fs.readdir(galleryDir, function (err, files) {
    if (err) {
      console.log(err);
    } else {
      galleryImages = files;

      res.render('product', {
        title: product.title,
        p: product,
        galleryImages: galleryImages,
        loggedIn: loggedIn,
      });
    }
  });
});

module.exports = router;
