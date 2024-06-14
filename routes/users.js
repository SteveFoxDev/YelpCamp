const express = require('express');
const router = express.Router();
const catchAsync = require('../utilities/catchAsync');
const User = require('../models/user');

// User Register Form
router.get('/register',  (req, res, next) => {
    res.render('users/register')
});

// Create User
router.post('/register', catchAsync(async (req, res, next) => {
    const { email, username, password } = req.body;
    const existingEmail = await User.findOne({ email });
    if(!existingEmail) {
        try {  
            const user = new User({ email, username });
            const registeredUser = await User.register(user, password);
            req.flash('success', `Welcome to Yelp Camp ${username}!`);
            return res.redirect('/campgrounds');
        } catch(e) {
            req.flash('error', e.message);
            return res.redirect('/register')
        }
    } else {
        req.flash('error', 'Email already in Use');
        return res.redirect('/register');
    }
    
    
}));

module.exports = router;