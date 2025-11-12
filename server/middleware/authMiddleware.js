const jwt = require('jsonwebtoken');
const User = require('../Models/users');
const SECRET_KEY = process.env.SECRET_KEY;

const authenticateToken = async (req, res, next) => {
    const token = req.cookies.authToken;
    const publicRoutes = ['/', '/signin', '/login', '/logout', '/api/auth/status', '/character_page', '/character_results'];  
    const publicApiRoutePatterns = [
        /\/[^\/]+\/reviews$/ 
    ];

    let isAuthenticated = false;

   if (token) {
        try {
            const decoded = jwt.verify(token, SECRET_KEY);
            const user = await User.findOne({ username: decoded.username });

            if (user) {
                req.user = { id: user._id, username: user.username };
                isAuthenticated = true;
            } else {
                res.clearCookie('authToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'Lax', path: '/' });
            }
        } catch (error) {
            res.clearCookie('authToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'Lax', path: '/' });
        }
    }

    const isPublicStaticRoute = publicRoutes.includes(req.path);
    const isPublicApiRoute = publicApiRoutePatterns.some(pattern => pattern.test(req.path));

    if (isPublicStaticRoute || isPublicApiRoute) {
        return next();
    }
    if (!isAuthenticated) {
        const acceptsJson = req.headers.accept && req.headers.accept.indexOf('json') > -1;  
        if (req.xhr || acceptsJson) {
            return res.status(401).json({ error: 'Unauthorized - Please sign in.' });
        }
        return res.redirect('/signin');
    }
    next();
};

module.exports = authenticateToken;
