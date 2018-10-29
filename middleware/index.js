var middlewareObj = {};

middlewareObj.isLoggedIn = function(req, res, next){
    if (req.isAuthenticated()){
        return next();
    }
    req.flash("error", "You need to be logged in to do that");
    res.redirect("/login");
}

middlewareObj.checkIsAdmin = function(req, res, next){
    if (req.isAuthenticated()){
        if (req.user.isAdmin) {
            next();
        } else {
            req.flash("error", "Permission denied. You are not an admin.");
            res.redirect("/home");
        }
    } else {
        req.flash("error", "You need to be logged in to do that.");
        res.redirect("/login");
    }
}

middlewareObj.checkIsSuperAdmin = function(req, res, next){
    if (req.isAuthenticated()){
        if (req.user.isSuperAdmin) {
            next();
        } else {
            req.flash("error", "Permission denied. You are not a super-admin.");
            res.redirect("back");
        }
    } else {
        req.flash("error", "You need to be logged in to do that.");
        res.redirect("/login");
    }
}

module.exports = middlewareObj;