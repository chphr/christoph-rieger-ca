const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');

// Import Default.json config
const config = require('config');

// Import Models
const Post = require('../../models/Post');
const User = require('../../models/User');
const auth = require('../../middleware/auth');

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

// @route   POST api/posts
// @desc    Submit Blog Post
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('title', 'Title is required').not().isEmpty(),
      check('description', 'Description is required').not().isEmpty(),
      check('markdown', 'Content is required').not().isEmpty(),
      check('thumbnail_url', 'Thumbnail is required').not().isEmpty(),
      check('categories', 'Categories are required').not().isEmpty(),
      check('slug', 'Slug is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    // console.log(req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, markdown, thumbnail_url, categories, slug } =
      req.body;

    try {
      // Check Permissions
      const user = await User.findOne({ user: req.user.id });

      // Check if Post exists
      let post = await Post.findOne({ title });

      if (post) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Post already exists' }] });
      }

      if (user.role != 'Admin') {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Insufficient Permissions' }] });
      }

      post = new Post({
        title,
        description,
        markdown,
        thumbnail_url,
        categories,
        slug,
      });

      // Create Post in Database
      await post.save();

      res.json({ post });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   DELETE api/posts
// @desc    Delete Post
// @access  Private
router.delete('/:post_id', auth, async (req, res) => {
  try {
    const user = await User.findOne({ user: req.user.id });
    if (user.role == 'Admin') {
      // Remove Post
      await Post.findOneAndRemove({ _id: req.params.post_id });
      res.json({ msg: 'Post deleted' });
    } else {
      res.status(500).send('Insufficient Permissions');
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
