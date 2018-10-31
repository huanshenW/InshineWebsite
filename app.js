var express                 = require("express"),
    app                     = express(),
    bodyParser              = require("body-parser"),
    mongoose                = require("mongoose"),
    seedDB                  = require("./seeds"),
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
    manageRoutes            = require("./routes/manage"),
    homeRoutes              = require("./routes/home")

mongoose.connect(process.env.DATABASEURL);

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use("/startbootstrap-agency", express.static(__dirname + "/startbootstrap-agency"));
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
app.use("/home", homeRoutes);
// app.use("/campgrounds/:id/comments", commentRoutes);

app.listen(process.env.PORT, process.env.IP, function(){
   console.log("Server Has Started.");
});

// seedDB(); //seed the database