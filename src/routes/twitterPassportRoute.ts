import express from "express";
const route = express.Router();
import passport from "passport";
import "../modules/twitterPasport"
route.get('/twitter',
  passport.authenticate('twitter', { scope: ['email','profile'] }));

  route.get('/twitter/callback', 
  passport.authenticate('twitter', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });
export default route;
