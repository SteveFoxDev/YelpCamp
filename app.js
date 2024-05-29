const express = require('express');
const path = require('path');  // provides utilities for working with file and directory paths
const mongoose = require('mongoose');
const Campground = require('./models/campground');  // Campground Model 
const Review = require('./models/review'); // Review Model
const methodOverride = require('method-override');  // Allows use of PUT, PATCH, DELETE
const ejsMate = require('ejs-mate');  // Allows Partial EJS Templates
const { campgroundSchema, reviewSchema } = require('./joiSchemas');  // Joi validation Middleware
const catchAsync = require('./utilities/catchAsync');  // Error Catcher for Async Routes
const ExpressError = require('./utilities/ExpressError');  // Extends Express Error Class
const campgrounds = require('./routes/campgrounds');

// ========== Mongoose Connection ==========
// =========================================
mongoose.connect('mongodb://localhost:27017/newYelp')
    .catch(error => console.log(error));

const db = mongoose.connection;

db.on('error', console.error.bind(console, "connection error:"));
db.once('open', () => {
    console.log('Database Connected');
});

// ========== App Setup ==========
// ===============================
const app = express();

app.engine('ejs', ejsMate); // parses ejs for partials
app.set('view engine', 'ejs'); // sets views engine to ejs
app.set('views', path.join(__dirname, 'views')); 

app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));

// ========== MIDDLEWARE ==========
// ================================


const validateReview = (req, res, next) => {
    const {error} = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}


// ========== ROUTES ==========
// ============================
// HOME
app.get('/',  (req, res, next) => {
    res.render('home');
});

// <<< -------------------- Campground Routes ----------------------- >>>
app.use('/campgrounds', campgrounds)

// <<< -------------------- Review Routes ----------------------- >>>
// Create Review
app.post('/campgrounds/:id/reviews', validateReview, catchAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}));

// Delete Review
app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync(async (req, res, next) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
}));

// ========== ERROR HANDLER ==========
// ===================================
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
});

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if(!err.message) err.message = 'Something Went Wrong';
    // res.status(statusCode).send(err.message);
    res.status(statusCode).render('error', { err });
});

// ========== SERVER ==========
// ============================
app.listen(3000, ()=> {
    console.log('Serving on port 3000');
});