require('dotenv').config(); // for google maps api key
var express       = require('express'),
    app           = express(),               // Route Handler
    flash         = require('connect-flash'),
    bodyParser    = require('body-parser'),  // extract data from form
    Campground    = require('./models/campground'),
    Comment       = require('./models/comment'),
    passport      = require('passport'),
    LocalStrategy = require('passport-local'),
    seedDB        = require('./seeds'),
    User          = require('./models/user'),
    methodOverride = require('method-override'),
    mongoose      = require('mongoose');     // Database API

var commentRoutes     = require("./routes/comments"),
    userRoutes        = require("./routes/user"),
    forgotRoutes      = require("./routes/forgot"),
    campgroundRoutes  = require("./routes/campgrounds"),
    authRoutes        = require("./routes/index");

// "mongodb://localhost/yelp_camp_v13"

mongoose.connect("mongodb+srv://steveFoxDev:2602NBBC0517@yelpcamp-am5b2.mongodb.net/test?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
  })
  .then(() => console.log('DB Connected!'))
  .catch(err =>{
    console.log(`DB Connection Error: ${err.message}`);
  });

  app.use(bodyParser.urlencoded({extended: true}));
  app.set("view engine", "ejs"); // Set views default to .ejs
  app.use(express.static(__dirname + "/public")); // Serve CSS file (static)
  app.use(methodOverride("_method"));  // Overrides post method to put
  app.use(flash());
  // seedDB();

app.use(require('express-session')({
  secret: "I THINK THIS IS USED TO ENCRYPT DATA?",
  resave: false,
  saveUninitialized: false
}));
app.locals.moment = require('moment');
// =========================================
// Passport Configuration
// =========================================
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
  res.locals.currentUser = req.user;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});
app.use(forgotRoutes);
app.use(userRoutes);
app.use(authRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);


// ===========================================
// ------------- Listen ----------------------
// ===========================================
app.listen(3000, function() {
  console.log("Yelp Camp App Server Started!");
});
