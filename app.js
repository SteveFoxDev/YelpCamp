if(process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const path = require('path');  // provides utilities for working with file and directory paths
const mongoose = require('mongoose');
const methodOverride = require('method-override');  // Allows use of PUT, PATCH, DELETE
const session = require('express-session');  // Session Cookies
const MongoStore = require('connect-mongo'); // Session Store
const flash = require('connect-flash'); // Flash Messages
const ejsMate = require('ejs-mate');  // Allows Partial EJS Templates
const ExpressError = require('./utilities/ExpressError');  // Extends Express Error Class
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');
const passport = require('passport'); // login functionality
const LocalStrategy = require('passport-local'); // local login
const User = require('./models/user'); // User Model
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');


// ========== Mongoose Connection ==========
// =========================================
const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/newYelp";
mongoose.connect(dbUrl).catch((error) => console.log(error))
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

app.use(express.urlencoded({extended: true}));  //  parses form data
app.use(methodOverride('_method'));  // Overrides POST method to use put/patch/delete
app.use(express.static(path.join(__dirname, 'public')));  // Serve a public folder
app.use(mongoSanitize());

// Save session store to MongoDB
const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: process.env.SECRET
    }
});

const sessionConfig = {
    name: 'camp_sid',
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,  // for production, only allow https secure
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7 ,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));  // sets up session cookies
app.use(flash()); // use flash for messages
app.use(helmet()); // 

const scriptSrcUrls = [
    'https://cdn.jsdelivr.net/',
    'https://api.mapbox.com/'
];

const styleSrcUrls = [
    'https://cdn.jsdelivr.net/',
    'https://api.mapbox.com/',
];

const connectSrcUrls = [
    'https://api.mapbox.com/',
    'https://events.mapbox.com'
];

const fontSrcUrls = [];

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dvxdkiqz8/",
                "https://images.unslplash.com/"
            ],
            fontSrc: ["'self'", ...fontSrcUrls]
        },
    })
);


app.use(passport.initialize()); // tells app to use passport
app.use(passport.session()); // REMINDER: Use AFTER session
passport.use(new LocalStrategy(User.authenticate())); // tells passport to use local strategy AND that the auth method is located on the user model
passport.serializeUser(User.serializeUser());  // tells passport how to store on session
passport.deserializeUser(User.deserializeUser()); // tells passport how to unstore on session

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});


// ========== ROUTES ==========
// ============================
// HOME
app.get('/',  (req, res, next) => {
    res.render('home');
});
// <<< -------------------- Campground Routes ----------------------- >>>
app.use('/campgrounds', campgroundRoutes)
// <<< -------------------- Review Routes ----------------------- >>>
app.use('/campgrounds/:id/reviews', reviewRoutes)
// <<< --------------------- USER ROUTES --------------------------- >>>
app.use('/', userRoutes);

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
const port = process.env.PORT || 3000;
app.listen(port, ()=> {
    console.log('Serving on port 3000');
});