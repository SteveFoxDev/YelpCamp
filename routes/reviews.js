const express = require('express'); 
const router = express.Router({mergeParams: true});
const catchAsync = require('../utilities/catchAsync');
const Campground = require('../models/campground');
const Review = require('../models/review');
const { validateReview } = require('../middleware');


// Create Review
router.post('/', validateReview, catchAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Created New Review');
    res.redirect(`/campgrounds/${campground._id}`);
}));

// Delete Review
router.delete('/:reviewId', catchAsync(async (req, res, next) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully Deleted Review');
    res.redirect(`/campgrounds/${id}`);
}));

module.exports = router;