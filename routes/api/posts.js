const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');

// Import Default.json config
const config = require('config');

// Import Post Model
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

// @route   POST api/posts
// @desc    Submit Blog Post
// @access  Public
router.post(
  '/',
  [
    check('title', 'Title is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
    check('markdown', 'Content is required').not().isEmpty(),
    check('thumbnail_url', 'Thumbnail is required').not().isEmpty(),
    check('categories', 'Categories are required').not().isEmpty(),
    check('slug', 'Slug is required').not().isEmpty(),
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
      // Check if user exists
      let post = await Post.findOne({ title });

      if (post) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Post already exists' }] });
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

module.exports = router;
