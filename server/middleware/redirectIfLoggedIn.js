const redirectIfLoggedIn = (req, res, next) => {
    if (req.user) {
        return res.redirect('/');
    }
    next();
};

module.exports = redirectIfLoggedIn;