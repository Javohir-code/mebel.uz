const express = require('express');
const router = express.Router();
bcrypt = require('bcryptjs');
const passport = require('passport');
const User = require('../models/user');

router.get('/register', (req, res) => {
  res.render('register', {
    title: 'Register',
  });
});

router.post('/register', async (req, res) => {
  var name = req.body.name;
  var email = req.body.email;
  var username = req.body.username;
  var password = req.body.password;

  let user = await User.findOne({ username: username });
  if (user) {
    console.log('Username is already exist!');
    res.redirect('/users/register');
  }

  user = new User({
    name: name,
    email: email,
    username: username,
    password: password,
    admin: 0,
  });

  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash(user.password, salt);
  user.password = hashedPassword;

  await user.save();

  res.redirect('/users/login');
});

router.get('/login', (req, res) => {
  if (res.locals.user) res.redirect('/');

  res.render('login', {
    title: 'Log in',
  });
});

router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/users/login',
    failureMessage: true,
  })(req, res, next);
});

router.get('/logout', (req, res) => {
  req.logout();

  res.redirect('/users/login');
});

module.exports = router;
