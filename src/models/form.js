const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FormSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    formId: {
        type: String,
        required: true
    },
    responderUri: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: false
    }
}, { timestamps: true });

const Form = mongoose.model('forms', FormSchema);

module.exports = Form; 