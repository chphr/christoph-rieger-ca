const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
  },
  name: {
    type: String,
  },
  postId: {
    type: String,
    required: true,
  },
  parentId: {
    type: String,
  },
  text: {
    type: String,
    required: true,
  },
  commentDate: {
    type: Date,
    default: new Date(),
    required: true,
  },
  likeCount: {
    type: Number,
    required: true,
    default: 0,
  },
});

module.exports = Comment = mongoose.model('comment', CommentSchema);
