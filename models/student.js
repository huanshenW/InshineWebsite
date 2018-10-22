var mongoose = require("mongoose");

var studentSchema = new mongoose.Schema({
    name: String,
    gender: String,
    age: Number,
    classNumber: String,
    contact1: String,
    phone1: String,
    contact2: String,
    phone2: String,
    isNoonCare: {type: String, default: null},
    isAfternoonCare: {type: String, default: null},
    timeEnrolled: String,
    note: String,
    user: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user"
        },
        username: String
    },
    footprint: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Activity"
        }
    ]
});

module.exports = mongoose.model("Student", studentSchema); 