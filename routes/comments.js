var express = require('express');
var router = express.Router({mergeParams: true});
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var bodyParser    = require('body-parser');
var middlewareObj = require('../middleware/index.js');


// ==========================================
// COMMENTS ROUTES
// ==========================================

// Comments New Route
router.get("/new", middlewareObj.isLoggedIn, function(req, res){
  //find campground by id
  Campground.findById(req.params.id, function(err, campground){
    if (err || !campground){
      req.flash("error", "Something went wrong");
      res.redirect("back");
    } else {
      res.render("comments/new", {campground: campground});
    }
  })
});

 // Comments Create Route
router.post("/", middlewareObj.checkCommentForm, middlewareObj.isLoggedIn, function(req, res){
  //lookup campground by id
  Campground.findById(req.params.id, function(err, campground){
    if(err || !campground){
      req.flash("error", "Something Went Wrong");
      res.redirect("/campgrounds");
    } else {
      //create new comment in db
      Comment.create(req.body.comment, function(err, comment){
        if (err){
          req.flash("error", "Something went wrong");
          res.redirect("back");
        } else {
          //add username and id to comment
          comment.author.id = req.user._id;
          comment.author.username = req.user.username;
          //save comment
          comment.save();
            //connect new comment to campground
          campground.comments.push(comment);
          campground.save();
          //redirect campground to show page
          req.flash("success", "Successfully Added Comment");
          res.redirect("/campgrounds/" + campground._id);
        }
      });
    }
  });
});

// EDIT Route - Display edit comment form
router.get("/:comment_id/edit", middlewareObj.checkCommentOwnership,
  function(req, res){
    Comment.findById(req.params.comment_id, function(err, foundComment){
      if(err || !foundComment){
        req.flash("error", "Something went wrong");
        res.redirect("back");
      } else {
        Campground.findById(req.params.id, function(err, foundCampground){
          if(err || !foundCampground){
            req.flash("error", "Something went wrong");
            res.redirect("back");
          } else {
            res.render("comments/edit", {
              campground_id: req.params.id,
              comment: foundComment,
              campground: foundCampground
            });
          }
        });
      }
    });
});

// UPDATE Route - Update comment then redirect
router.put("/:comment_id", middlewareObj.checkCommentForm, middlewareObj.checkCommentOwnership,
  function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment,
      function(err, updatedComment){
        if(err || !updatedComment){
          req.flash("error", "Something went wrong");
          return res.redirect("back");
        } else {
          req.flash("success", "Successfully edited comment");
          res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

//DESTROY Route - Delete this comment
router.delete("/:comment_id", middlewareObj.checkCommentOwnership,
  function(req, res){
    Comment.findByIdAndRemove(req.params.comment_id,
      function(err, commentRemoved){
        if(err || !commentRemoved){
          req.flash("error", "Something went wrong");
          res.redirect("back");
        }
        Campground.findByIdAndUpdate(req.params.id, {
          $pull: {comments: req.params.comment_id}
        },
          function(err, updatedCamp){
            if(err){
              req.flash("error", "Something went wrong");
              res.redirect("back");
            }
            req.flash("success", "Comment Deleted Successfully");
            res.redirect("/campgrounds/" + req.params.id);
          });
    });
});

module.exports = router;
