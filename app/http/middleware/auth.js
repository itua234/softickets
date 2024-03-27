const jwt = require('jsonwebtoken');
const { models: { User } } = require('../../models');
const { TOKEN_SECRET } = process.env; 

module.exports = {
    authGuard: (req, res, next) => {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (token == null) return res.status(401).json({ error: true, message: "unauthenticated" });
        console.log(token);
        jwt.verify(token, TOKEN_SECRET, async(err, user) => {
            if (err) return res.status(401).json({ error: true, message: "unauthenticated" });
            const getUser = await User.findOne({
                where: {email: user.user.email}, raw: true
            });
            if(!getUser) throw 'Invalid Access Token Sent';
            req.user = getUser;
            next();
        });
    },

    auth: (req) => {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        const user = jwt.decode(
            token, 
            process.env.TOKEN_SECRET
        );
        return user.user;
    },

    createAccessToken: (user) => {
        return jwt.sign(
            {user: user},
            process.env.TOKEN_SECRET,
            {
                expiresIn: process.env.TOKEN_EXPIRE,
            }
        );
    },
    
    isSofcrypt: (req, res, next) => {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        //Check if the request contains authorization header
        if (!authHeader) return res.status(401).json({ error: true, message: "missing authorization header" });

        //Check if the authorization token is equal to the app token
        if (token != process.env.APP_TOKEN) return res.status(401).json({ error: true, message: "unauthenticated" });

        next();
    },

    isAdmin: (req, res, next) => {
        //If session exists proceed to the next middleware
        if (req.session && req.session.user) {
            next();
        }else{
            //If session does not exist, redirect to login page or another route
            return res.redirect("/login");
        }
        next();
    },

    isGuest: (req, res, next) => {
        //If session exists proceed to the dashboard
        if (req.session && req.session.user) {
            //If session exist, redirect to dashboard page or another route
            return res.redirect("/dashboard");
        } else {
            next();
        }
    },

    checkSession: (req, res, next) => {
        // Check if session exists
        if (req.session && req.session.user) {
            // Session exists, proceed to the next middleware or route handler
            next();
        } else {
            // Session doesn't exist, redirect to login page or handle unauthorized access
            return res.redirect('/login'); // Redirect to login page
        }
    }
}