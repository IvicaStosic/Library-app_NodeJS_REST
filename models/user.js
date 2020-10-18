const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: false
    },
    publicEmail: {
        type: Boolean,
        required: false
    },
    books: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Book'
        }
    ]
})

module.exports = mongoose.model("User", userSchema)