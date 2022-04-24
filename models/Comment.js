const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'posts',
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
