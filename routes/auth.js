var express = require('express');
var passport = require('passport');

var router = express.Router();

router.get('/login',
  function(req, res) {
    res.render('login');
  });

router.get('/login/federated/accounts.google.com',
  passport.authenticate('google', { prompt: 'login' }));

router.get('/oauth2/redirect/accounts.google.com', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

router.get('/logout',
  function(req, res) {
    req.logout();
    res.redirect('/');
  });

module.exports = router;
