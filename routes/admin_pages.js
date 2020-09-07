const express = require('express');
const router = express.Router();
const Page = require('../models/page');
const auth = require('../config/auth');
var isAdmin = auth.isAdmin;


router.get('/', isAdmin, async (req, res) => {
  const pages = await Page.find({}).sort({ sorting: 1 });
  res.render('admin/pages', { pages: pages });
});

router.get('/add-page', isAdmin, (req, res) => {
  var title = '';
  var slug = '';
  var content = '';

  res.render('admin/add_page', {
    title: title,
    slug: slug,
    content: content,
  });
});

router.post('/add-page', async (req, res) => {

 

 

  let page = new Page({
    title: req.body.title,
    slug: req.body.slug.toLowerCase(),
    content: req.body.content,
    sorting: 100,
  });
   

  await page.save();

  const pages = await Page.find({}).sort({ sorting: 1 });
  req.app.locals.pages = pages;
  res.redirect('/admin/pages');
});

async function sortPages(ids, callback) {
  var count = 0;
  for (var i = 0; i < ids.length; i++) {
    var id = ids[i];
    count++;

    var page = await Page.findById(id);
    page.sorting = count;
    await page.save();
    ++count;
    if (count >= ids.length) {
      callback();
    }
  }
}

router.post('/reorder-pages', async (req, res) => {
  var ids = req.body['id[]'];

  sortPages(ids, function () {
    Page.find({})
      .sort({ sorting: 1 })
      .exec(function (err, pages) {
        if (err) {
          console.log(err);
        } else {
          req.app.locals.pages = pages;
        }
      });
  });
});

router.get('/edit-page/:id', isAdmin, async (req, res) => {
  let page = await Page.findById(req.params.id);
  res.render('admin/edit_page', {
    title: page.title,
    slug: page.slug,
    content: page.content,
    id: page._id,
  });
});

router.post('/edit-page/:id', async (req, res) => {
  var title = req.body.title;
  var slug = req.body.slug;
  var content = req.body.content;
  let page = await Page.findById(req.params.id);
  page.title = title;
  page.slug = slug;
  page.content = content;

  await page.save();

  const pages = await Page.find({}).sort({ sorting: 1 });
  req.app.locals.pages = pages;
  res.redirect('/admin/pages');
});

router.get('/delete-page/:id', isAdmin, async (req, res) => {
  const page = await Page.findByIdAndRemove(req.params.id);

  const pages = await Page.find({}).sort({ sorting: 1 });
  req.app.locals.pages = pages;
  res.redirect('/admin/pages');
});

module.exports = router;
