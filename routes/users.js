const express = require('express');
const router = express.Router();
const catchAsync = require('../utilities/catchAsync');
const User = require('../models/user');
const passport = require('passport');
const { setReturnTo } = require('../middleware');

// User Register Form
router.get('/register',  (req, res, next) => {
    res.render('users/register')
});

// Create User
router.post('/register', setReturnTo, catchAsync(async (req, res, next) => {
    const { email, username, password } = req.body;
    const existingEmail = await User.findOne({ email });
    if(!existingEmail) {
        try {  
            const user = new User({ email, username });
            const registeredUser = await User.register(user, password);
            const redirectUrl = res.locals.returnTo || '/campgrounds';
            req.login(registeredUser, err => {
                if(err) return next(err);
                req.flash('success', `Welcome to Yelp Camp ${username}!`);
                return res.redirect(redirectUrl);
            });           
        } catch(e) {
            req.flash('error', e.message);
            return res.redirect('/register')
        }
    } else {
        req.flash('error', 'Email already in Use');
        return res.redirect('/register');
    }
}));

// User Login Form
router.get('/login',  (req, res, next) => {
    res.render('users/login');
});
// User Login
router.post('/login', setReturnTo, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login'}), async (req, res, next) => {
    const { username } = req.body;
    const redirectUrl = res.locals.returnTo || '/campgrounds';
    req.flash('success', `Welcome Back ${username}`);
    res.redirect(redirectUrl);
});
// User Logout
router.get('/logout',  (req, res, next) => {
    req.logout(function (err){
        if(err) {
            return next(err);
        }
        req.flash('success', 'See You Later');
        res.redirect('/campgrounds');
    });
});

module.exports = router;