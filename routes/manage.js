var express = require("express");
var router = express.Router();
var Student = require("../models/student");
var User = require("../models/user");
var Event = require("../models/event");
var Activity = require("../models/activity");
var moment = require("moment-timezone");
var mongoose = require("mongoose");
mongoose.Promise = require("bluebird");
var middleware = require("../middleware/");
var async = require("async");


router.get("/", middleware.checkIsAdmin, function(req, res){
    var queries = [];
    var numEvents = 0;
    var activities;
    queries.push(
        function(){
            return new Promise((resolve, reject) =>{
                Event.find({}, function(err, foundEvents){
                    if (err){
                        numEvents = 0;
                    } else {
                        numEvents = foundEvents.length;                        
                    }
                    resolve();
                })
            });
        }()
    );    
    
    Promise.all(queries).then(function(){
        Activity.find({}, function(err, foundActivities){
            if (err) {
                foundActivities = [];
            }
            res.render("manage/index", {numEvents:numEvents, activites: foundActivities});               
        });
    }).catch(function(err){
        console.log(err);
    });
});

// =======
// STUDENT ROUTES
// =======

//NEW - show the new student register page
router.get("/student/new", middleware.checkIsAdmin, function(req, res){
    res.render("manage/student/new");
});

//ADD - 
router.post("/student/", middleware.checkIsAdmin, function(req, res){
    var newUser = new User({username: req.body.student.username});
    User.register(newUser, req.body.student.password, function(err, user){
        if (err) {
            req.flash("error", err.message);
            res.redirect("/manage/student/new");
        } else {
            Student.create(req.body.student,  function(err, newStudent){
                if (err){
                    console.log(err);
                } else {
                    user.student.id = newStudent._id;
                    user.save();
                    newStudent.user.id = user._id;
                    newStudent.user.username = req.body.student.username;
                    newStudent.timeEnrolled = moment(new Date()).tz("Asia/Shanghai").format("YYYY-MM-DD ddd h:mm:ss a");
                    newStudent.save();
                    req.flash("success", "Registration success!");
                    res.redirect("/manage/student/new");
                }
            });            
        }
    });
});

//SHOW(INDEX) - show the student's enroll list
router.get("/student/index", middleware.checkIsAdmin, function(req, res){
    Student.find({}, function(err, students){
       if (err){
           req.flash("error", "Can't find any student.");
           res.redirect("manage/student/new");
       } else {
           res.render("manage/student/index", {students:students});
       }
    });
});

//SHOW(PROFILE) - show a student's profile
router.get("/student/:student_id", middleware.checkIsAdmin, function(req, res){
    Student.findById(req.params.student_id).populate("footprint").exec(function(err, foundStudent){
        if (err) {
            req.flash("error", "Student not found!");
            res.redirect("back");
        } else {
            res.render("manage/student/show", {student: foundStudent});
        }
    });
});

//show the edit page for a student
router.get("/student/:student_id/edit", middleware.checkIsAdmin, function(req, res){
    Student.findById(req.params.student_id).populate("footprint").exec(function(err, foundStudent){
        if (err) {
            req.flash("error", "Student not found!");
            res.redirect("back");
        } else {
            res.render("manage/student/edit", {student: foundStudent});
        }
    });
});

// edit a student's profile info.
router.put("/student/:student_id", middleware.checkIsAdmin, function(req, res){
    var isNoonCare = "";
    if (req.body.student.isNoonCare=="on"){
        isNoonCare = "Enrolled";
    } else {
        isNoonCare = "-";
    }
    var isAfternoonCare = "";
    if (req.body.student.isAfternoonCare=="on"){
        isAfternoonCare = "Enrolled";
    } else {
        isAfternoonCare = "-";
    }
    Student.findByIdAndUpdate(req.params.student_id, 
    {
        "$set": { 
            "name": req.body.student.name,
            "gender": req.body.student.gender,
            "age": req.body.student.age,
            "classNumber": req.body.student.classNumber,
            "contact1": req.body.student.contact1,
            "phone1": req.body.student.phone1,
            "contact2": req.body.student.contact2,
            "pheon2": req.body.student.phone2,
            "isNoonCare": isNoonCare,
            "isAfternoonCare": isAfternoonCare,
            "note": req.body.student.note
        }
    }
    ,
    function(err, updatedStudent){
        if (err) {
            req.flash("error", "Update failure");
        } else {
            res.redirect("/manage/student/" + req.params.student_id);
        }
    }) 
});

router.delete("/student/:student_id", middleware.checkIsSuperAdmin, function(req, res){
    Student.findByIdAndRemove(req.params.student_id, function(err){
        if (err){
            req.flash("error", err.message);
            res.redirect("/manage/student/index");
        } else {
            res.redirect("/manage/student/index");
        }
    })
})


// =========
// Clock in
// =========

// show the clock in types
router.get("/note/clockin", middleware.checkIsAdmin, function(req, res){
    res.render("manage/note/clockin/index")    
});

// Process the ClockingType and render the specific workspace
router.post("/note/clockin", middleware.checkIsAdmin, function(req, res){
    var checkType = String(req.body.clockinType);
    Student.find({[checkType]: "Enrolled"}, function(err, foundStudents){
        if (err) {
            req.flash("error", "No students are founded");
            res.redirect("back");
        } else {
            var eventType;
            if (checkType == "isNoonCare") {
                eventType = "Noon Care";
            } else {
                eventType = "Afternoon Care";
            }
            res.render("manage/note/clockin/workspace", {students: foundStudents, eventType:eventType});
        }
    });
});

// Receive clockingIn results and create events
router.post("/note/clockin/result", middleware.checkIsAdmin, function(req, res){
    if (!req.body.students.clickTime) {
        res.redirect("/manage/note/event");
    }
    var num = req.body.students.clickTime.length;
    var queries = [];
    if (typeof(req.body.students.clickTime) == "string") {
        queries.push(function(){
            return new Promise((resolve, reject) =>{
                Student.findById(req.body.students.id, function(err, foundStudent){
                    if (err) {
                        reject();
                        // req.flash("error", err.message);
                        // res.redirect("back");
                    } else {
                        var event = {};
                        event.student = {};
                        event.student.name = foundStudent.name;
                        event.student.id = foundStudent._id;
                        // --------- Moment.js formatting ------------
                        var str = req.body.students.clickTime;
                        var ans = "";
                        if (!(str == "Absent")) {
                            ans = moment(str).tz("Asia/Shanghai").format("YYYY-MM-DD ddd h:mm:ss a");                        
                        } else {
                            ans = "Absent";
                        }
                        // -------------------------------------------
                        event.time = ans;       
                        event.eventType = req.body.students.eventType;
                        event.operator = req.body.students.operator;
                        Event.create(event, function(err, newEvent){
                            newEvent.save();
                            resolve();
                        });
                    }
                });                
            });
        }());
    } else {
        for (var i = 0; i < num; i++) {
            queries.push(function(i){
                return new Promise((resolve, reject) =>{
                    Student.findById(req.body.students.id[i], function(err, foundStudent){
                                                console.log(req.body.students.id);
                                                console.log(foundStudent);
                        if (err) {
                            reject();
                            // req.flash("error", err.message);
                            // res.redirect("back");
                        } else {
                            var event = {};
                            event.student = {};
                            console.log("foundStudent is :");
                            console.log(foundStudent);
                            event.student.name = foundStudent.name;
                            event.student.id = foundStudent._id;
                            // --------- Moment.js formatting ------------
                            var str = req.body.students.clickTime[i];
                            var ans = "";
                            if (!(str == "Absent")) {
                                ans = moment(str).tz("Asia/Shanghai").format("YYYY-MM-DD ddd h:mm:ss a");                        
                            } else {
                                ans = "Absent";
                            }
                            // -------------------------------------------
                            event.time = ans;       
                            event.eventType = req.body.students.eventType;
                            event.operator = req.body.students.operator;
                            Event.create(event, function(err, newEvent){
                                newEvent.save();
                                resolve();
                            });
                        }
                    });                
                });
            }(i));
        };        
    }
    
    Promise.all(queries).then(function(){
        res.redirect("/manage/note/event");        
    }).catch(function(err){
        console.log(err);
    });
});

// Show the comment panel
router.get("/note/event", middleware.checkIsAdmin, function(req, res){
    Event.find(function(err, currentEvents){
        if (err) {
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            res.render("manage/note/event/index", {events: currentEvents});             
        }
    });
});

// Show the edit form of event_id
router.post("/note/event/:event_id/edit", middleware.checkIsAdmin, function(req, res){
    var collection;
    if (req.body.eventFlag == "true") {
        collection = Event;
    } else {
        collection = Activity;
    }
    collection.findById(req.params.event_id, function(err, foundEvent){
        if (err) {
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            res.render("manage/note/event/edit", {event: foundEvent, referer:req.headers.referer, eventFlag:req.body.eventFlag, isReset:req.body.isReset});
        }
    })
});

// update a comment
router.put("/note/event/:event_id", middleware.checkIsAdmin, function(req, res){
    var collection;
    if (req.body.eventFlag == "true") {
        collection = Event;
    } else {
        collection = Activity;
    }
    if (req.body.isReset == "false"){
        collection.findByIdAndUpdate(req.params.event_id, 
        {
            "$set": { 
                "comment": req.body.comment,
                "supervisor": req.body.commenter
            }
        },
        function(err, updatedEvent){
            if (err) {
                req.flash("error", err.message);
                res.redirect("back");
            } else {
                if (req.body.eventFlag == "true"){
                    res.redirect("/manage/note/event/");
                } else {
                    res.redirect(req.body.referer);                
                }
    
            }
        })        
    } else {
        collection.findByIdAndUpdate(req.params.event_id, 
        {
            "$set": { 
                "comment": "",
                "supervisor": ""
            }
        },
        function(err, updatedEvent){
            if (err) {
                req.flash("error", err.message);
                res.redirect("back");
            } else {
                if (req.body.eventFlag == "true"){
                    res.redirect("/manage/note/event/");
                } else {
                    res.redirect("back");                
                }
            }
        }) 
    }
});

// delete an event
router.delete("/note/event/:event_id", middleware.checkIsSuperAdmin, function(req, res){
    var collection;
    if (req.body.eventFlag == "true") {
        collection = Event;
    } else {
        collection = Activity;
    }
    collection.findById(req.params.event_id, function(err, event){
        console.log(event);
    })
    collection.findByIdAndRemove(req.params.event_id, function(err){
        if (err) {
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            res.redirect("back");
        }
    });
});

// write the current events into DB and students
router.post("/note/event", middleware.checkIsSuperAdmin, function(req, res){
    Event.find(function(err, events){
        if (err) {
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            events.forEach(function(event){
                var object = {};
                object.student = {};
                object.student.id = event.student.id;
                object.student.name = event.student.name;
                object.time = event.time;
                object.eventType = event.eventType;
                object.operator = event.operator;
                object.comment = event.comment;
                object.supervisor = event.supervisor;
                Activity.create(object, function(err, newActivity){
                    newActivity.save();
                    (function(newActivity){
                        Student.findById(newActivity.student.id, function(err, student){
                            if (err) {
                                console.log(err);
                            } else {
                                student.footprint.push(newActivity._id);
                                student.save();
                            }
                        });                    
                    })(newActivity);   
                });
                Event.findOneAndDelete({"_id": event._id}, function(err){
                    if (err) {
                        console.log(err);
                    }
                });     
            });
        }
    });
    req.flash("success", "Submit Successfully");
    res.redirect("/manage/note/event");
});

module.exports = router;
