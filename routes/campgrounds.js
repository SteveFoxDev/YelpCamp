const express = require('express'); 
const router = express.Router();
const catchAsync = require('../utilities/catchAsync');
const ExpressError = require('../utilities/ExpressError');
const Campground = require('../models/campground');
const { campgroundSchema } = require('../joiSchemas');
const { isLoggedIn, setReturnTo } = require('../middleware');

// ========== MIDDLEWARE ==========
// ================================
const validateCampground = (req, res, next) => {
    
    const {error} = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

// Index
router.get('/', catchAsync(async (req, res, next) => {
    const campgrounds = await Campground.find();
    res.render('campgrounds/index', {campgrounds});
}));

// New
router.get('/new', isLoggedIn, (req, res, next) => {
    res.render('campgrounds/new');
});

// Create
router.post('/', isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id;
    await campground.save();
    req.flash('success', 'Successfully Made A New Campground');
    res.redirect(`/campgrounds/${campground._id}`);
}));

// Show
router.get('/:id', setReturnTo, catchAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id).populate('reviews').populate('author');
    if(!campground){
        req.flash('error', 'Cannot Find Campground');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', {campground});
}));

// Edit
router.get('/:id/edit', isLoggedIn, catchAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    if(!campground){
        req.flash('error', 'Cannot Find Campground');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', {campground});
}));

// Update
router.put('/:id', isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {
    const { id } = req.params;
    await Campground.findByIdAndUpdate(id, {...req.body.campground});
    req.flash('success', 'Successfully Updated Campground');
    res.redirect(`/campgrounds/${id}`);
}));

// Delete Show
router.get('/:id/delete', isLoggedIn, catchAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/delete', {campground});
}));

// Delete
router.delete('/:id', isLoggedIn, catchAsync(async (req, res, next) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully Deleted Campground');
    res.redirect('/campgrounds');
}));

module.exports = router;