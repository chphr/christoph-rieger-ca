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
// @desc    GET all posts
// @access  Public
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: 'Internal Server Error' });
  }
});

// @route   GET api/posts/:post_id
// @desc    GET single post by ID
// @access  Public
router.get('/:post_id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id);

    if (!post) {
      return res.status(404).json({ errors: [{ msg: 'Post not found' }] });
    }

    res.json(post);
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ errors: [{ msg: 'Post not found' }] });
    }
    res.status(500).json({ msg: 'Internal Server Error' });
  }
});

// @route   POST api/posts
// @desc    Submit blog post
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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, markdown, thumbnail_url, categories, slug } =
      req.body;
    const author = req.user.id;

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
        author,
        title,
        description,
        markdown,
        thumbnail_url,
        categories,
        slug,
      });

      // Create post in database
      await post.save();

      res.json({ post });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   DELETE api/posts/:post_id
// @desc    Delete post
// @access  Private
router.delete('/:post_id', auth, async (req, res) => {
  try {
    const user = await User.findOne({ user: req.user.id });
    if (user.role == 'Admin') {
      // Remove Post
      await Post.findOneAndRemove({ _id: req.params.post_id });
      res.json({ msg: 'Post deleted' });
    } else {
      res.status(401).send('User not authorized');
    }
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ errors: [{ msg: 'Post not found' }] });
    }
    res.status(500).send('Internal Server Error');
  }
});

// @route   PUT api/posts/like/:post_id
// @desc    Add like to post
// @access  Public
router.put('/like/:post_id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id);

    post.likeCount = post.likeCount + 1;

    await post.save();

    res.json(post.likeCount);
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ errors: [{ msg: 'Post not found' }] });
    }
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
