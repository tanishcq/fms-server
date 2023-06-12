const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BugSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false
    },
    email: {
        type: String,
        required: false
    },
    description: {
        type: String,
        required: true
    }
}, { timestamps: true });

const Bug = mongoose.model('bugs', BugSchema);

module.exports = Bug; 