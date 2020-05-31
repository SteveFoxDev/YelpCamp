var Campground = require('../models/campground');
var Comment = require('../models/comment');
// All middleware goes here
var middlewareObj = {};

middlewareObj.checkCampgroundOwnership = function(req, res, next) {
  // is user logged in
  if(req.isAuthenticated()){
    Campground.findById(req.params.id, function(err, foundCampground){
      if(err || !foundCampground){
        req.flash("error", "Campground Not Found");
        res.redirect("back");
      } else {
        // does user own the campground
        if((foundCampground.author.id.equals(req.user._id)) || (req.user.isAdmin === true)){
            return next();
        } else {
          req.flash("error", "You don't have permission to do that");
          // if not, redirect & msg
          res.redirect("back");
        }
      }
    });
  } else {
    req.flash("error", "You need to be logged in to do that!");
    res.redirect("back");
  }
}

middlewareObj.checkCommentOwnership = function(req, res, next){
  if(req.isAuthenticated()){
    Comment.findById(req.params.comment_id, function(err, foundComment){
      if(err || !foundComment){
        req.flash("error", "Something went wrong");
        res.redirect("back");
      } else {
        if((foundComment.author.id.equals(req.user._id))  || (req.user.isAdmin === true)){
          next();
        } else {
          req.flash("error", "You don't have permission to do that");
          res.redirect("back");
        }
      }
    });
  } else {
    req.flash("error", "You need to be logged in to do that!");
    res.redirect("/login");
  }
}

middlewareObj.isLoggedIn = function(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }
  req.flash("error", "You need to be logged in to do that!");
  res.redirect("/login");
}

middlewareObj.checkCommentForm = function(req, res, next){
  if(req.body.comment.text.length > 1){
    return next();
  }
  req.flash("error", "Comment cannot be empty");
  res.redirect("back");
}

middlewareObj.checkCampgroundForm = function(req, res, next){
  var name = req.body.campground.name.length;
  var image = req.body.campground.image.length;
  var desc = req.body.campground.description.length;
  if(name > 1 && image > 1 && desc > 1){
    return next();
  }
  req.flash("error", "All input fields are required");
  res.redirect("back");
}

module.exports = middlewareObj;
