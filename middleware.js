module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl; // Sets URL to return to after login
        req.flash('error', 'You must be logged in first!');
        return res.redirect('/login');
    }
    next();
};

// <<< Set a URL to return to after login
module.exports.setReturnTo = (req, res, next) => {
    if(!req.isAuthenticated()) {
        if(req.session.returnTo) {
            res.locals.returnTo = req.session.returnTo;
        } else {
            req.session.returnTo = req.originalUrl;
        }
    }
    next();
};