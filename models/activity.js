var mongoose = require("mongoose");

var activitySchema = new mongoose.Schema({
    student: {
        id:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "student"
            },
        name: String
    },
    time: String,
    eventType: String,
    operator: String,
    comment: String,
    supervisor: String
});

module.exports = mongoose.model("Activity", activitySchema);