import express from "express";
const route = express.Router();
import passport from "passport";
import "../modules/fbPassport"
route.get('/facebook',
  passport.authenticate('facebook', { scope: ['email','profile'] }));

  route.get('/facebook/callback', 
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });
export default route;
