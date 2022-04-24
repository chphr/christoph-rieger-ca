const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');

// Import Default.json config
const config = require('config');

// Import Comment Model
const Comment = require('../../models/Comment');
const Post = require('../../models/Post');
const auth = require('../../middleware/auth');

// @route   GET api/comments/
// @desc    GET all comments
// @access  Public
router.get('/', async (req, res) => {
  try {
    const comments = await Comment.find().sort({ commentDate: -1 });
    res.json(comments);
  } catch (error) {
    console.error(err.message);
    res.status(500).json({ msg: 'Internal Server Error' });
  }
});

// @route   GET api/comments/:post_id
// @desc    GET all comments for a post
// @access  Public
router.get('/:post_id', async (req, res) => {
  try {
    const comments = await Comment.find({ postId: req.params.post_id }).sort({
      commentDate: -1,
    });
    res.json(comments);
  } catch (error) {
    console.error(err.message);
    res.status(500).json({ msg: 'Internal Server Error' });
  }
});

// @route   POST api/comments/user/:post_id/:parent_id?
// @desc    Submit comment w/ user
// @access  Private
router.post(
  '/',
  [auth, [check('text', 'Text is required').not().isEmpty()]],
  async (req, res) => {
    // console.log(req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { postId, text } = req.body;

    try {
      comment = new Comment({
        postId,
        text,
      });

      // Create Comment in Database
      await comment.save();

      res.json({ comment });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   PUT api/comments/like/:comment_id
// @desc    Add like to comment
// @access  Public
router.put('/like/:comment_id', async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.comment_id);

    comment.likeCount = comment.likeCount + 1;

    await comment.save();

    res.json(comment.likeCount);
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ errors: [{ msg: 'Comment not found' }] });
    }
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
