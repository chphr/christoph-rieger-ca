const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');

// Import Gravatar Package
const gravatar = require('gravatar');

// Import bcrypt to encrypt user password
const bcrypt = require('bcryptjs');

// Import User Model
const User = require('../../models/User');

// @route   POST api/users
// @desc    Register User
// @access  Public
router.post(
  '/',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Email address invalid').isEmail(),
    check(
      'password',
      'Please enter a password with 6 or more characters'
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    // console.log(req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      // Check if user exists
      let user = await User.findOne({ email });

      if (user) {
        res.status(400).json({ errors: [{ msg: 'User already exists' }] });
      }

      // Get users gravatar

      const avatar = gravatar.url(email, {
        s: '200',
        r: 'pg',
        d: 'mm',
      });

      user = new User({
        name,
        email,
        avatar,
        password,
      });

      // Encrypt user password
      // Generate Salt for hashing password
      const salt = await bcrypt.genSalt(10);
      // Replace plaintext password with hashed pass
      user.password = await bcrypt.hash(password, salt);

      // Create User in Database
      await user.save();

      // Return JWT

      res.send('User created');
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

module.exports = router;
