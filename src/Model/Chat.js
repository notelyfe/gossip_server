const mongoose = require('mongoose');
const { Schema } = mongoose;

const ChatSchema = new Schema({
    chatName: {
        type: String,
        trim: true
    },
    isGroupChat: {
        type: Boolean,
        default: false
    },
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    latestMsg: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message"
    },
    groupAdmins: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Chat', ChatSchema);