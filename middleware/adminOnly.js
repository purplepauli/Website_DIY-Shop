
function middleware(req, res, next) {
    if(!req.user) return res.redirect("/");
    if(!req.user.isAdmin) return res.redirect("/");
    next();
}

module.exports = middleware;