const express = require('express');
const router = express.Router();

// Import Default.json config
const config = require('config');

// Import User Model
const Post = require('../../models/Post');

// @route   GET api/posts
// @desc    GET Posts
// @access  Public
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find();
    res.json(posts);
  } catch (error) {
    console.error(err.message);
    res.status(500).json({ msg: 'Internal Server Error' });
  }
});

module.exports = router;
