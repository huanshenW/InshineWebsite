var mongoose    = require("mongoose");
var Student  = require("./models/student");
var User = require("./models/user");
var Event = require("./models/event");
var Activity = require("./models/activity");
var faker = require("faker");
var numData = 5;
var data = [];

function seedDB(){

    User.findOne({"username":"visitor"}, function(err, foundUser){
        if (err) {
            console.log(err);

        } else {
            for (var i = 0; i < numData; i++) {
                var ran1= faker.random.number();
                var g;
                if (ran1 % 2 == 0) {
                    g = "Male";
                } else {
                    g = "Female";
                }
                var username = faker.name.firstName() + String(i);
                var object = {
                    name: username,
                    gender: g,
                    age: 7 + faker.random.number() % 4,
                    classNumber: faker.random.number() % 1000,
                    contact1: faker.name.findName(),
                    phone1: faker.phone.phoneNumberFormat(),
                    contact2: faker.name.findName(),
                    phone2: faker.phone.phoneNumberFormat(),
                    isNoonCare: String(faker.random.boolean()),
                    isAfternoonCare: String(faker.random.boolean()),
                    timeEnrolled: faker.date.recent(),
                    note: faker.lorem.sentences(),
                    user: {
                            id: foundUser._id,
                            username: "visitor"
                        }
                };
                data.push(object);
            }

            //Remove all students
            Student.deleteMany({}, function(err){
                if (err){
                    console.log(err);
                }
                console.log("Remove all students");
                Event.deleteMany({}, function(err){
                    console.log("Remove all events!");                    
                    Activity.deleteMany({}, function(err){
                        console.log("Remove all activitys");            
                        //add a few campgrounds
                        data.forEach(function(seed){
                            Student.create(seed, function(err, student){
                                if(err){
                                    console.log(err);
                                } else {
                                    student.save();
                                }
                            });
                        });
                        console.log("Successfully added all students");                           
                    });
                });
            });
        }
    });
}

module.exports = seedDB;
