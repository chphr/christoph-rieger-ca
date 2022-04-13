const express = require('express');
const router = express.Router();

// Import Models and Authentication
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

// @route   GET api/profile/me
// @desc    Get current user profile
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate(
      'user',
      ['name', 'avatar']
    );

    if (!profile) {
      return res
        .status(400)
        .json({ errors: [{ msg: 'No profile for this user' }] });
    }

    res.json(profile);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Internal Server Error');
  }
});

// @route   GET api/profile
// @desc    Test Route
// @access  Public
router.get('/', (req, res) => res.send('Profile Route'));

module.exports = router;
