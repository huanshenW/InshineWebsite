var express                 = require("express"),
    app                     = express(),
    bodyParser              = require("body-parser"),
    mongoose                = require("mongoose"),
    // Campground              = require("./models/campground"),
    seedDB                  = require("./seeds"),
    // Comment                 = require("./models/comment"),
    methodOverride          = require("method-override"),
    flash                   = require("connect-flash"),
    path                    = require("path")
// Authentication packages    
var
    User                    = require("./models/user"),
    passport                = require("passport"),
    LocalStrategy           = require("passport-local")
// Requring routes
var
    indexRoutes             = require("./routes/index"),
    manageRoutes            = require("./routes/manage")
    // homeRoutes              = require("./routes/home"),
    // commentRoutes           = require("./routes/comments");

mongoose.connect("mongodb://localhost:27017/anxin", { useNewUrlParser: true });
// mongoose.connect("mongodb://huanshen:wilson123@ds051833.mlab.com:51833/yelpcamp", { useNewUrlParser: true });

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());


// PASSPORT CONFIGURATION
app.use(require("express-session")({
   secret: "Daya is the cutest dog in the world",
   resave: false,
   saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");
   next();
});

app.use("/", indexRoutes);
app.use("/manage", manageRoutes);
// app.use("/home", homeRoutes)
// app.use("/campgrounds/:id/comments", commentRoutes);

app.listen(process.env.PORT, process.env.IP, function(){
   console.log("The YelpCamp Server Has Started.");
});

seedDB(); //seed the database