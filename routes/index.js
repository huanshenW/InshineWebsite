var express = require("express");
var router  = express.Router();
var passport = require("passport");
var User = require("../models/user");

// Root route
router.get("/", function(req, res){
   res.render("landing"); 
});

// Home route
router.get("/home", function(req, res){
    res.render("home");
});


// ===============
// AUTH ROUTES
// ===============

// show register form
router.get("/register", function(req, res){
    res.render("register");  
});

// handling sign up logic
router.post("/register", function(req, res){
    // create a new user object
    var newUser = new User({username: req.body.username});
    if (req.body.secretcode === "axjy#1238#") {
        newUser.isAdmin = true;
    }
    // pass the info to model user and use passport-local-mongoose to handle the registration.
    User.register(newUser, req.body.password, function(err, user){
        if (err){
           req.flash("error", err.message);
           res.redirect("register");
        }
        passport.authenticate("local")(req, res, function(){
            req.flash("success", "Welcome to YelpCamp " + user.username);
            res.redirect("/home"); 
        });
    });
});

// show login form
router.get("/login", function(req, res){
    res.render("login"); 
});

// handling login logic
router.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/home",
        failureRedirect: "/login"
    }), function(req, res){
});

// logout logic
router.get("/logout", function(req, res) {
   req.logout();
   req.flash("success", "You have successfully logged out");
   res.redirect("/home");
});


module.exports = router;