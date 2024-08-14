const Campground = require("./models/campground");
const Review = require("./models/review");
const User = require("./models/user");
const { campgroundSchema, reviewSchema } = require("./joiSchemas");
const ExpressError = require("./utilities/ExpressError");

// <<< protects routes where user must be logged in
module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl; // Sets URL to return to after login
    req.flash("error", "You must be logged in first!");
    return res.redirect("/login");
  }
  next();
};

// <<< Set a URL to return to after login
module.exports.setReturnTo = (req, res, next) => {
  if (!req.isAuthenticated()) {
    if (req.session.returnTo) {
      res.locals.returnTo = req.session.returnTo;
    } else {
      req.session.returnTo = req.originalUrl;
    }
  }
  next();
};

// <<< check if campground author is same as currently logged in user
module.exports.isAuthor = async (req, res, next) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  if (!campground) {
    req.flash("error", "That Campground Does NOT exist!");
    return res.redirect("/campgrounds");
  }
  if (!campground.author.equals(req.user._id)) {
    req.flash("error", "You do NOT have permission to do that!");
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
};

// <<< check if review author is same as currently logged in user
module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if(!review){
    req.flash('error', "Oops, something went wrong!");
    return res.redirect('/campgrounds');
  }
  if (!review.author.equals(req.user._id)) {
    req.flash("error", "You do NOT have permission to do that!");
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
};

// Validates campground edit and create form data
module.exports.validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

// validates review form data
module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};
