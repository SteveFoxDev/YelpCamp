var express = require('express');
var router = express.Router();
var User = require('../models/user');
var bodyParser    = require('body-parser');
var Campground = require('../models/campground');


// =========== User Profile ==================
router.get("/user/:id", function(req, res){
  User.findById(req.params.id, function(err, foundUser) {
    if(err || !foundUser){
      req.flash("error", "No user found");
      res.redirect("back");
    } else {
      Campground.find().where('author.id').equals(foundUser._id).exec(function(err, campgrounds){
        if(err || !campgrounds){
          req.flash("error", "Something went wrong");
          res.redirect("back");
        } else {
            res.render("user/show", {user: foundUser, campgrounds: campgrounds});
        }
      });
    }
  })
});


module.exports = router;
