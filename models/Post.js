const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  markdown: {
    type: String,
    required: true,
  },
  thumbnail: {
    type: String,
    required: true,
  },
  categories: {
    type: [String],
    required: true,
  },
  slug: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: new Date(),
    required: true,
  },
  lastUpdated: {
    type: Date,
  },
  commentCount: {
    type: Number,
    required: true,
    default: 0,
  },
});

module.exports = Post = mongoose.model('post', PostSchema);
