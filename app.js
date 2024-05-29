const express = require('express');
const path = require('path');  // provides utilities for working with file and directory paths
const mongoose = require('mongoose');
const methodOverride = require('method-override');  // Allows use of PUT, PATCH, DELETE
const ejsMate = require('ejs-mate');  // Allows Partial EJS Templates
const ExpressError = require('./utilities/ExpressError');  // Extends Express Error Class
const campgrounds = require('./routes/campgrounds');
const reviews = require('./routes/reviews');

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

// ========== ROUTES ==========
// ============================
// HOME
app.get('/',  (req, res, next) => {
    res.render('home');
});
// <<< -------------------- Campground Routes ----------------------- >>>
app.use('/campgrounds', campgrounds)
// <<< -------------------- Review Routes ----------------------- >>>
app.use('/campgrounds/:id/reviews', reviews)

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