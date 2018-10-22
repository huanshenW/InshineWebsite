var express = require("express");
var router = express.Router();
var Student = require("../models/student");
var User = require("../models/user");
var Event = require("../models/event");
var Activity = require("../models/activity");
var middleware = require("../middleware/");
var async = require("async");


router.get("/", /*middleware.checkIsAdmin,*/ function(req, res){
    res.render("manage/index");
});

// =======
// STUDENT ROUTES
// =======

//NEW - show the new student register page
router.get("/student/new", function(req, res){
    res.render("manage/student/new");
});

//ADD - 
router.post("/student/", function(req, res){
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
                    newStudent.user.id = user._id;
                    newStudent.user.username = req.body.student.username;
                    newStudent.save();
                    req.flash("success", "Registration success!");
                    res.redirect("/manage/student/new");
                }
            });            
        }
    });
});

//SHOW(INDEX) - show the student's enroll list
router.get("/student/index", function(req, res){
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
router.get("/student/:student_id", function(req, res){
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
router.get("/student/:student_id/edit", function(req, res){
    Student.findById(req.params.student_id).populate("footprint").exec(function(err, foundStudent){
        if (err) {
            req.flash("error", "Student not found!");
            res.redirect("back");
        } else {
            console.log(req.headers.referer);
            res.render("manage/student/edit", {student: foundStudent});
        }
    });
});

router.put("/student/:student_id", function(req, res){
    console.log("you hit the put route");
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
            "isNoonCare": req.body.student.isNoonCare,
            "isAfternoonCare": req.body.student.isAfternoonCare,
            "note": req.body.student.note
        }
    }
    ,
    function(err, updatedStudent){
        if (err) {
            console.log("update pass");
            req.flash("error", "Update failure");
        } else {
            console.log(updatedStudent._id);
            console.log(req.params.student_id);
            res.redirect("/manage/student/" + req.params.student_id);
        }
    }) 
});

router.delete("/student/:student_id", function(req, res){
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
router.get("/note/clockin", function(req, res){
    res.render("manage/note/clockin/index")    
});

// Process the ClockingType and render the specific workspace
router.post("/note/clockin", function(req, res){
    var checkType = String(req.body.clockinType);
    Student.find({[checkType]: "true"}, function(err, foundStudents){
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
router.post("/note/clockin/result", function(req, res){
    var num = req.body.students.clickTime.length;
    for (var i = 0; i < num; i++) {
        (function(i){
            Student.findById(req.body.students.id[i], function(err, foundStudent){
                if (err) {
                    req.flash("error", err.message);
                    res.redirect("back");
                } else {
                    var event = {};
                    event.student = {};
                    event.student.name = foundStudent.name;
                    event.student.id = foundStudent._id;
                    event.time = req.body.students.clickTime[i];       
                    event.eventType = req.body.students.eventType;
                    event.operator = req.body.students.operator;
                    Event.create(event, function(err, newEvent){
                        newEvent.save();
                    });
                }
            });            
        })(i);
    }
    res.redirect("/manage/note/event");
});

// Show the comment panel
router.get("/note/event", function(req, res){
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
router.post("/note/event/:event_id/edit", function(req, res){
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
            res.render("manage/note/event/edit", {event: foundEvent, referer:req.headers.referer, eventFlag: req.body.eventFlag});
        }
    })
});

// update a comment
router.put("/note/event/:event_id", function(req, res){
    var collection;
    if (req.body.eventFlag == "true") {
        collection = Event;
    } else {
        collection = Activity;
    }
    collection.findByIdAndUpdate(req.params.event_id, 
    {
        "$set": { 
            "comment": req.body.comment,
            "supervisor": req.body.commenter
        }
    },
    function(err, updatedEvent){
        console.log(updatedEvent);
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
});

// reset a comment
router.delete("/note/event/:event_id", function(req, res){
    Event.findByIdAndUpdate(req.params.event_id, 
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
            res.redirect("back");
        }
    })
});

// write the current events into DB and students
router.post("/note/event", function(req, res){
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
                                console.log(student.footprint);
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
