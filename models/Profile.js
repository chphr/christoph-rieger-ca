const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  mode: {
    type: String,
    enum: ['light', 'dark'],
    default: 'light',
    required: true,
  },
  newsletter: {
    type: Boolean,
    default: true,
    required: true,
  },
  website: {
    type: String,
  },
});

module.exports = Profile = mongoose.model('profile', ProfileSchema);
