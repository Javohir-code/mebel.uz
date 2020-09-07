const express = require('express');
const router = express.Router();
const Category = require('../models/category');
const auth = require('../config/auth');
var isAdmin = auth.isAdmin;


router.get('/', isAdmin, async (req, res) => {
  const categories = await Category.find({});
  res.render('admin/categories', {
    categories: categories,
  });
});

router.get('/add-category',isAdmin, (req, res) => {
  var title = '';
  res.render('admin/add_category', {
    title: title,
  });
});

router.post('/add-category', async (req, res) => {
  var slug = req.body.title;
  let category = new Category({
    title: req.body.title,
    slug: slug,
  });
  await category.save();

  const categories = await Category.find({});
  req.app.locals.categories = categories;
  res.redirect('/admin/categories');
});

router.get('/edit-category/:id', isAdmin, async (req, res) => {
  const category = await Category.findById(req.params.id);
  res.render('admin/edit_category', {
    title: category.title,
    id: category._id,
  });
});

router.post('/edit-category/:id', async (req, res) => {
  var title = req.body.title;
  var slug = req.body.title;
  let category = await Category.findById(req.params.id);
  category.title = title;
  category.slug = slug;
  await category.save();

  const categories = await Category.find({});
  req.app.locals.categories = categories;
  res.redirect('/admin/categories');
});

router.get('/delete-category/:id', isAdmin, async (req, res) => {
  const category = await Category.findByIdAndRemove(req.params.id);

  const categories = await Category.find({});
  req.app.locals.categories = categories;
  res.redirect('/admin/categories');
})

module.exports = router;
