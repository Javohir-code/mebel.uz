const express = require('express');
const router = express.Router();
const Page = require('../models/page');

router.get('/', async (req, res) => {
  let page = await Page.findOne({ slug: 'home' });
  res.render('index', {
    title: page.title,
    content: page.content,
  });
});

router.get('/:slug', (req, res) => {
  let page = Page.findOne({ slug: req.params.slug })
    .then((page) => {
      if (!page) {
        res.send('Not exist');
      } else {
        res.render('index', {
          title: page.title,
          content: page.content,
        });
      }
    })
    .catch((err) => {
      return res.status(400).send(err);
    });
});

module.exports = router;
