const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: false
    },
    ipAddress: {
        type: String,
        required: false
    }
}, { timestamps: true });

const User = mongoose.model('users', UserSchema);

module.exports = User;