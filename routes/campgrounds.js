var express = require('express');
var router = express.Router();
var Campground = require('../models/campground');
var Comment = require('../models/comment');
// var bodyParser = require('body-parser');
var middlewareObj = require('../middleware/index.js');
var NodeGeocoder = require('node-geocoder');

var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};
var geocoder = NodeGeocoder(options);


// ==========================================
// ---------- Campground ROUTES -------------
// ==========================================

// INDEX Route - List all campgrounds
router.get("/", function(req, res){
  //Get all campgrounds from DB
  Campground.find({}, function(err, allCampgrounds){
    if(err){
      req.flash("error", "Something went wrong");
      res.redirect("back");
    } else {
      res.render("campgrounds/index",
        {campgrounds:allCampgrounds, page: 'campgrounds'});
    }
  });
});

// NEW Route- show form to create new campground
router.get("/new", middlewareObj.isLoggedIn, function(req, res){
  res.render("campgrounds/new");
});

// CREATE Route - add new campground
router.post("/",
  middlewareObj.checkCampgroundForm,
  middlewareObj.isLoggedIn,
  function(req, res){
    // get data from form, add to campground Array
    var name = req.body.campground.name;
    var price = req.body.campground.price;
    var rate = req.body.campground.rate;
    var image = req.body.campground.image;
    var desc = req.body.campground.description;
    var author = {
      id: req.user._id,
      username: req.user.username
    };
    geocoder.geocode(req.body.campground.location, function(err, data){
      if(err || !data.length) {
        // console.log(err);
        req.flash("error", "Invalid Address");
        return res.redirect('/campgrounds');
      }
      var lat = data[0].latitude;
      var lng = data[0].longitude;
      var location = data[0].formattedAddress;
      var newCampground = {
        name: name,
        price: price,
        rate: rate,
        image: image,
        description: desc,
        author: author,
        location: location,
        lat: lat,
        lng: lng
      };
      // Create a new campground and save to db
      Campground.create(newCampground,
        function(err, newlyCreated){
          if(err){
            req.flash("error", "Something went wrong");
            return res.redirect("back");
          } else {
            //redirect back to campgrounds page
            req.flash("success", "Campground added successfully");
            res.redirect("/campgrounds");
          }
      });
    });
});

// SHOW Route - shows more info about one campground
router.get("/:id", function(req, res){
  //Find the campground with provided ID
  Campground.findById(req.params.id)
    .populate("comments")
    .exec(function(err, foundCampground){
      if(err || !foundCampground){
        req.flash("error", "Something went wrong");
         return res.redirect("back");
      } else {
        res.render("campgrounds/show", {campground: foundCampground});
      }
  });
});

// EDIT Route - Show edit form for one campground
router.get("/:id/edit", middlewareObj.checkCampgroundOwnership,
  function(req, res){
    Campground.findById(req.params.id, function(err, foundCampground){
      if(err || !foundCampground){
        req.flash("error", "Cannot find Campground");
        res.redirect("back");
      } else {
          res.render("campgrounds/edit", {campground: foundCampground});
      }
    });
});

// UPDATE Route - Update campground (PUT request from Edit form)
router.put("/:id",
  middlewareObj.checkCampgroundForm,
  middlewareObj.checkCampgroundOwnership,
  function(req, res){
    geocoder.geocode(req.body.campground.location, function(err, data) {
      if(err || !data.length) {
        console.log(err);
        req.flash("error", "Invalid Address");
        return res.redirect("back");
      }
      req.body.campground.lat = data[0].latitude;
      req.body.campground.lng = data[0].longitude;
      req.body.campground.location = data[0].formattedAddress;
      // find and update campgrounds
      Campground.findByIdAndUpdate(req.params.id, req.body.campground,
        function(err, updatedCampground){
          if(err || !updatedCampground){
            req.flash("error", "Something went wrong");
            res.redirect("/campgrounds");
          } else {
            req.flash("success", "Campground updated successfully");
            res.redirect("/campgrounds/" + req.params.id);
          }
      });
    });
});

// DESTROY Route - Delete campground then redirect
router.delete("/:id", middlewareObj.checkCampgroundOwnership,
  function(req, res){
    Campground.findByIdAndRemove(req.params.id,
      function(err, campgroundRemoved){
        if(err || !campgroundRemoved){
          req.flash("error", "Something went wrong");
          res.redirect("/campgrounds");
        } else {
          Comment.deleteMany({_id: { $in: campgroundRemoved.comments }},
            function(err){
              if(err) {
                req.flash("error", "Something went wrong");
                res.redirect("back");
              } else {
                req.flash("success", "Campground deleted successfully");
                res.redirect("/campgrounds");
              }
            });
        }
    });
});

module.exports = router;
