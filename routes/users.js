const express = require('express');
const router = express.Router();
const catchAsync = require('../utilities/catchAsync');
const passport = require('passport');
const { setReturnTo } = require('../middleware');
const users = require('../controllers/users');

// User Register Form
router.get('/register', users.renderRegisterForm);

// Create User
router.post('/register', setReturnTo, catchAsync(users.createUser));

// User Login Form
router.get('/login', users.renderLoginForm);
// User Login
router.post('/login', setReturnTo, 
    passport.authenticate('local', 
        { failureFlash: true, failureRedirect: '/login'}), 
        users.login);
// User Logout
router.get('/logout', users.logout);

module.exports = router;