var mongoose    = require("mongoose");
var Campground  = require("./models/campground");
var Comment     = require("./models/comment");
var data = [
    {
        name: "Woman and A Dog",
        image: "https://images.unsplash.com/photo-1508873696983-2dfd5898f08b?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=5cedc6b95f731395da7269d2341f9a5e&auto=format&fit=crop&w=500&q=60",
        description: "Woman and a dog inside outside tent near body of water"
    },
    {
        name: "Blue Tent under Milkyway",
        image: "https://images.unsplash.com/photo-1517824806704-9040b037703b?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=d95171e276fbd03de651f9aecb64b53d&auto=format&fit=crop&w=500&q=60",
        description: "A blue tent under the amazing and beautiful milkyway"
    },
    {
        name: "tents Outside",
        image: "https://images.unsplash.com/photo-1528433556524-74e7e3bfa599?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=a4479c0b22e5c8a8ed5577c39f63b27b&auto=format&fit=crop&w=500&q=60",
        description: "Blue and white tents outside under blue sky"
    },
    {
        name: "Smoke and Hills",
        image: "https://images.unsplash.com/photo-1520632461690-67205b04e73d?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=3f5441c45df9e0a481186d60cf5db545&auto=format&fit=crop&w=500&q=60",
        description: "Group of people making smoke during daytime"
    }
]

function seedDB(){
    //Remove all campgrounds
    Campground.deleteMany({}, function(err){
        if (err){
            console.log(err);
        }
        console.log("remove campgrounds!");
        Comment.deleteMany({}, function(err) {
            if(err){
                console.log(err);
            }
            console.log("removed comments!");
            
            //add a few campgrounds
            data.forEach(function(seed){
                Campground.create(seed, function(err, campground){
                    if(err){
                        console.log(err)
                    } else {
                        console.log("added a campground");
                        //create a comment
                        Comment.create(
                            {
                                text: "This place is great, but I wish there was internet",
                                author: "Homer"
                            }, function(err, comment){
                                if(err){
                                    console.log(err);
                                } else {
                                    campground.comments.push(comment);
                                    campground.save();
                                    console.log("Created new comment");
                                }
                            });
                    }
                });
            });
        });
    }); 
}

module.exports = seedDB;
