const mongoose  = require("mongoose");

const postSchema =  mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    users: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    date: {
        type: Date,
        default: Date.now
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],

    
})

module.exports = mongoose.model("Post", postSchema)