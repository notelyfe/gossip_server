const mongoose = require('mongoose');
const { Schema } = mongoose;

const MessageSchema = new Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    receivers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    content: {
        type: String,
        trim: true
    },
    chat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat"
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Message', MessageSchema);