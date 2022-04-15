const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');

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

// @route   POST api/profile
// @desc    Create or update user profile
// @access  Private
router.post(
  '/',
  [auth, check('mode', 'Mode is required').not().isEmpty()],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array });
    }

    const { mode, newsletter, website } = req.body;

    // Build Profile Object

    const profileFields = {};
    profileFields.user = req.user.id;
    if (mode) profileFields.mode = mode;
    if (newsletter) profileFields.newsletter = newsletter;
    if (website || website == '') profileFields.website = website.trim();

    try {
      let profile = await Profile.findOne({ user: req.user.id });

      // Update User Profile
      if (profile) {
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );
        return res.status(200).json(profile);
      }
      // Create User Profile
      profile = new Profile(profileFields);
      await profile.save();
      res.status(200).json(profile);
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Internal Server Error');
    }
  }
);

module.exports = router;
