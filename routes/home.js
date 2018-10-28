var express = require("express");
var router  = express.Router();
var Student = require("../models/student")
var middleware = require("../middleware/");

// INDEX - show all campgrounds
router.get("/:student_id", middleware.isLoggedIn, function(req, res){
    Student.findById(req.params.student_id, function(err, foundStudent){
        if (err) {
            req.flash("error", "Sorry, can't find your profile.");
            res.redirect("back");
        } else {
            res.render("home/profile", {student: foundStudent});
        }
    });
});

module.exports = router;