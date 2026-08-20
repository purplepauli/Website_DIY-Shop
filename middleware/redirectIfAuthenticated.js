const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
    const token = req.cookies?.token;

    if (!token) {
        console.log("User has no token");
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded;
        console.log("User already has valid token");
        res.redirect("/");
    } catch (err) {
        res.clearCookie("token");
        console.log("User had invalid token");
        return res.redirect("/auth/login");
    }
}

module.exports = authMiddleware;