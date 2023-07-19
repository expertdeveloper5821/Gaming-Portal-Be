import express from "express";
const route = express.Router();
import passport from "passport";
import "../modules/passport"
route.get('/google',
  passport.authenticate('google', { scope: ['email','profile'] }));

  route.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });
export default route;
