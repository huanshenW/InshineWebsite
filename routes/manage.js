var express = require("express");
var router = express.Router();
var middleware = require("../middleware/");

router.get("/", middleware.checkIsAdmin, function(req, res){
    console.log("Hit manage");
    console.log(__dirname);
    res.render("manage/index");
});

module.exports = router;
