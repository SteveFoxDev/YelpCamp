var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../models/user');
var bodyParser    = require('body-parser');
var Campground = require('../models/campground');

// router.use(bodyParser.urlencoded({extended: true}));


// =========================================
// ---------- Landing Page -----------------
// =========================================
// Root Route
router.get("/", function(req, res){
  res.render("landing");
});

// ==========================================
// ------------- Auth ROUTES ----------------
// ==========================================

// ============= Register ===================
// Register Form GET and render form page (/register)
router.get("/register", function(req, res){
  res.render("register", {page: 'register'});
});

// Signup logic
router.post("/register", function(req, res){
  var newUser = new User({
    username: req.body.username,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    avatar: req.body.avatar
  });
  User.register(newUser, req.body.password, function(err, user ){
    if(err){
      // res.redirect("back");
      console.log(err);
      return res.render("register", {error: err.message});
      // req.flash("error", err.message);
      // res.redirect("back");
    }
    passport.authenticate("local")(req, res, function(){
      req.flash("success", "Welcome to YelpCamp " + user.username);
      res.redirect("/campgrounds");
    });
  });
});

// ============ LogIn =======================
// LogIn Form GET and render form page (/login)
router.get("/login", function(req, res){
  res.render("login", {page: 'login'});
});

// LogIn logic
router.post("/login", passport.authenticate("local",
  {
    successRedirect: "/campgrounds",
    failureRedirect: "/login"
  }), function(req, res){
});

// ============ LogOUT =======================
router.get("/logout", function(req, res){
  req.logout();
  req.flash("success", "Logged out successfully");
  res.redirect("/campgrounds");
});

module.exports = router;
