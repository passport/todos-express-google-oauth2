var express = require('express');
var passport = require('passport');
var TwitStrat = require('passport-twitter');
var db = require('../db');

const twitterID = "my-twitter-client-id";
const twitterSecret = "my-twitter-client-secret";

// Configure the Twitter strategy
passport.use(new TwitStrat({
  clientID: twitterID,
  clientSecret: twitterSecret,
  callbackURL: '/oauth2/redirect/twitter'
},
function(accessToken, refreshToken, profile, cb) {
  db.get('SELECT * FROM federated_credentials WHERE provider = ? AND subject = ?', [
    'https://twitter.com',
    profile.id
  ], function(err, row) {
    if (err) { return cb(err); }
    if (!row) {
      db.run('INSERT INTO users (name) VALUES (?)', [
        profile.displayName
      ], function(err) {
        if (err) { return cb(err); }
        var id = this.lastID;
        db.run('INSERT INTO federated_credentials (user_id, provider, subject) VALUES (?, ?, ?)', [
          id,
          'https://twitter.com',
          profile.id
        ], function(err) {
          if (err) { return cb(err); }
          var user = {
            id: id,
            name: profile.displayName
          };
          return cb(null, user);
        });
      });
    } else {
      db.get('SELECT rowid AS id, * FROM users WHERE rowid = ?', [ row.user_id ], function(err, row) {
        if (err) { return cb(err); }
        if (!row) { return cb(null, false); }
        return cb(null, row);
      });
    }
  });
}));

router.get('/login/federated/twitter', passport.authenticate('twitter'));

router.get('/oauth2/redirect/twitter', passport.authenticate('twitter', {
  successReturnToOrRedirect: '/',
  failureRedirect: '/login'
}));

module.exports = router;
