const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const Category = require('../models/category');
const mkdirp = require('mkdirp');
const fs = require('fs-extra');
const resizeImg = require('resize-img');
const auth = require('../config/auth');
var isAdmin = auth.isAdmin;


router.get('/', isAdmin, async (req, res) => {
  var count;
  const c = await Product.countDocuments();
  count = c;

  const products = await Product.find({});
  res.render('admin/products', {
    products: products,
    count: count,
  });
});

router.get('/add-product', isAdmin, async (req, res) => {
  var title = '';
  var desc = '';
  var price = '';
  const categories = await Category.find({});
  res.render('admin/add_product', {
    title: title,
    desc: desc,
    price: price,
    categories: categories,
  });
});

router.post('/add-product', async (req, res) => {
  var imageFile =
    typeof req.files.image !== 'undefined' ? req.files.image.name : '';

  // var file = req.files.image;
  // var imageFile = file.name;
  var title = req.body.title;
  var slug = title.toLowerCase();
  var desc = req.body.desc;
  var price = parseFloat(req.body.price).toFixed(2);
  var category = req.body.category;
  let product = new Product({
    title: title,
    slug: slug,
    desc: desc,
    price: price,
    category: category,
    image: imageFile,
  });

  mkdirp('public/product_images/' + product._id, function (err) {
    return console.log(err);
  });

  mkdirp('public/product_images/' + product._id + '/gallery', function (err) {
    return console.log(err);
  });

  mkdirp('public/product_images/' + product._id + '/gallery/thumbs', function (
    err
  ) {
    return console.log(err);
  });

  if (imageFile !== '') {
    var productImage = req.files.image;
    var path = 'public/product_images/' + product._id + '/' + imageFile;

    productImage.mv(path, function (err) {
      console.log(err);
    });
  }

  await product.save();
  res.redirect('/admin/products');
});

router.get('/edit-product/:id', isAdmin, async (req, res) => {
  const categories = await Category.find({});
  const product = await Product.findById(req.params.id);
  var galleryDir = 'public/product_images/' + product._id + '/gallery';
  var galleryImages = null;

  fs.readdir(galleryDir, function (err, files) {
    if (err) {
      console.log(err);
    } else {
      galleryImages = files;

      res.render('admin/edit_product', {
        title: product.title,
        desc: product.desc,
        categories: categories,
        category: product.category,
        price: parseFloat(product.price).toFixed(2),
        image: product.image,
        galleryImages: galleryImages,
        id: product._id,
      });
    }
  });
});

router.post('/edit-product/:id', async (req, res) => {
  var imageFile =
    typeof req.files.image !== 'undefined' ? req.files.image.name : '';
  var title = req.body.title;
  var slug = title.toLowerCase();
  var desc = req.body.desc;
  var price = req.body.price;
  var category = req.body.category;
  var pimage = req.body.pimage;
  var id = req.params.id;

  let product = await Product.findById(id);
  product.title = title;
  product.slug = slug;
  product.desc = desc;
  product.price = parseFloat(price).toFixed(2);
  product.category = category;
  if (imageFile != '') {
    product.image = imageFile;
  }

  await product.save();

  if (imageFile != '') {
    if (pimage != '') {
      fs.remove('public/product_images/' + id + '/' + pimage, function (err) {
        console.log(err);
      });
    }
    var productImage = req.files.image;
    var path = 'public/product_images/' + id + '/' + imageFile;

    productImage.mv(path, function (err) {
      return console.log(err);
    });
  }

  res.redirect('/admin/products');
});

router.post('/product-gallery/:id', (req, res) => {
  var productImage = req.files.file;
  var id = req.params.id;
  var path = 'public/product_images/' + id + '/gallery/' + req.files.file.name;
  var thumbsPath =
    'public/product_images/' + id + '/gallery/thumbs/' + req.files.file.name;

  productImage.mv(path, (err) => {
    console.log(err);

    resizeImg(fs.readFileSync(path), { width: 100, height: 100 }).then(
      (buffer) => {
        fs.writeFileSync(thumbsPath, buffer);
      }
    );
  });
  res.sendStatus(200);
});

router.get('/delete-image/:image', isAdmin, (req, res) => {
  var originalImage =
    'public/product_images/' + req.query.id + '/gallery/' + req.params.image;
  var thumbImage =
    'public/product_images/' +
    req.query.id +
    '/gallery/thumbs/' +
    req.params.image;

  fs.remove(originalImage, (err) => {
    if (err) {
      console.log(err);
    } else {
      fs.remove(thumbImage, (err) => {
        if (err) {
          console.log(err);
        } else {
          res.redirect('/admin/products/edit-product/' + req.query.id);
        }
      });
    }
  });
});

router.get('/delete-product/:id', isAdmin, async (req, res) => {
  var path = 'public/product_images/' + req.params.id;
  fs.remove(path);

  await Product.findByIdAndRemove(req.params.id);
  res.redirect('/admin/products');
});

module.exports = router;
