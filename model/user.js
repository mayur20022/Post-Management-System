const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/middleware")

const UserSchema =  mongoose.Schema({
    username: {
        type: String,
        unique: true
    },
    name: String,
    age: Number,
    image: {
        type: String,
        default: "default.png"
    },
    email: {
        type: String,
        unique: true
    },
    password: String,
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    }]
})

module.exports = mongoose.model("User", UserSchema)