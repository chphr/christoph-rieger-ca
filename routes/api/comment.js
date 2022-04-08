const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');

// Import Default.json config
const config = require('config');

// Import Comment Model
const Comment = require('../../models/Comment');

// @route   GET api/comments
// @desc    GET Comments
// @access  Public
router.get('/', async (req, res) => {
  try {
    const comments = await Comment.find();
    res.json(comments);
  } catch (error) {
    console.error(err.message);
    res.status(500).json({ msg: 'Internal Server Error' });
  }
});

// @route   POST api/posts
// @desc    Submit Blog Post
// @access  Public
router.post(
  '/',
  [
    check('postId', 'Comment needs like to Post').not().isEmpty(),
    check('text', 'Text is required').not().isEmpty(),
  ],
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

module.exports = router;
