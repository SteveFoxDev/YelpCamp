const express = require('express');
const path = require('path');  // provides utilities for working with file and directory paths
const mongoose = require('mongoose');
const Campground = require('./models/campground');  // Campground Model 
const methodOverride = require('method-override');  // Allows use of PUT, PATCH, DELETE
const ejsMate = require('ejs-mate');  // Allows Partial EJS Templates
const { campgroundSchema } = require('./joiSchemas');  // Joi validation Middleware
const catchAsync = require('./utilities/catchAsync');  // Error Catcher for Async Routes
const ExpressError = require('./utilities/ExpressError');  // Extends Express Error Class

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
const validateCampground = (req, res, next) => {
    
    const {error} = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}


// ========== ROUTES ==========
// ============================
app.get('/',  (req, res, next) => {
    res.render('home');
});

// Index
app.get('/campgrounds', catchAsync(async (req, res, next) => {
    const campgrounds = await Campground.find();
    res.render('campgrounds/index', {campgrounds});
}));

// New
app.get('/campgrounds/new',  (req, res, next) => {
    res.render('campgrounds/new');
});

// Create
app.post('/campgrounds', validateCampground, catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}));

// Show
app.get('/campgrounds/:id', catchAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/show', {campground});
}));

// Edit
app.get('/campgrounds/:id/edit', catchAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', {campground});
}));

// Update
app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res, next) => {
    const { id } = req.params;
    await Campground.findByIdAndUpdate(id, {...req.body.campground});
    res.redirect(`/campgrounds/${id}`);
}));

// Delete Show
app.get('/campgrounds/:id/delete', catchAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/delete', {campground});
}));

// Delete
app.delete('/campgrounds/:id', catchAsync(async (req, res, next) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
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