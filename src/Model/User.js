const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  user_id: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  user_type: {
    type: String,
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', UserSchema);