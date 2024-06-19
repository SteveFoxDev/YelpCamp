const User = require('../models/user');

module.exports.renderRegisterForm = (req, res, next) => {
    res.render('users/register')
}

module.exports.createUser = async (req, res, next) => {
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
}

module.exports.renderLoginForm = (req, res, next) => {
    res.render('users/login');
}

module.exports.login = async (req, res, next) => {
    const { username } = req.body;
    const redirectUrl = res.locals.returnTo || '/campgrounds';
    req.flash('success', `Welcome Back ${username}`);
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res, next) => {
    req.logout(function (err){
        if(err) {
            return next(err);
        }
        req.flash('success', 'See You Later');
        res.redirect('/campgrounds');
    });
}