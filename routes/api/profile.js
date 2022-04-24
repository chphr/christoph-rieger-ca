const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const request = require('request');
const config = require('config');

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

// @route   GET api/profile
// @desc    Get all profile
// @access  Public
router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', ['name', 'avatar']);

    res.json(profiles);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Internal Server Error');
  }
});

// @route   GET api/profile/user/:user_id
// @desc    Get profile by user ID
// @access  Public
router.get('/user/:user_id', async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate('user', ['name', 'avatar']);

    if (!profile) {
      return res
        .status(400)
        .json({ errors: [{ msg: "Profile or User doesn't exist" }] });
    }

    res.json(profile);
  } catch (error) {
    console.error(error.message);
    res
      .status(400)
      .json({ errors: [{ msg: "Profile or User doesn't exist" }] });
  }
});

// @route   DELETE api/profile
// @desc    Delete profile and user
// @access  Private
router.delete('/', auth, async (req, res) => {
  try {
    // Remove Profile of current User
    await Profile.findOneAndRemove({ user: req.user.id });
    // Remote User
    await User.findOneAndRemove({ _id: req.user.id });
    res.json({ msg: 'User deleted' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Internal Server Error');
  }
});

// @route   GET api/profile/github/gists
// @desc    Get user gists from Github
// @access  Public
router.get('/github/gists', async (req, res) => {
  try {
    const options = {
      uri: `https://api.github.com/users/chphr/gists?sort=created: asc&client_id=${config.get(
        'githubClient'
      )}&client_secret=${config.get('githubSecret')}`,
      method: 'GET',
      headers: { 'user-agent': 'node.js' },
    };

    request(options, (error, response, body) => {
      if (error) {
        console.error(error.message);
        res
          .status(404)
          .send({ msg: 'Errors sending the request to the Github API' });
      }

      if (response.statusCode != 200) {
        res.status(500).send({ msg: 'Github profile not found' });
      }
      res.json(JSON.parse(body));
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Internal Server Error');
  }
});

// @route   GET api/profile/github/repos
// @desc    Get user repositories from Github
// @access  Public
router.get('/github/repos', async (req, res) => {
  try {
    const options = {
      uri: `https://api.github.com/users/chphr/repos?sort=created: asc&client_id=${config.get(
        'githubClient'
      )}&client_secret=${config.get('githubSecret')}`,
      method: 'GET',
      headers: { 'user-agent': 'node.js' },
    };

    request(options, (error, response, body) => {
      if (error) {
        console.error(error.message);
        res
          .status(404)
          .send({ msg: 'Errors sending the request to the Github API' });
      }

      if (response.statusCode != 200) {
        res.status(500).send({ msg: 'Github profile not found' });
      }
      res.json(JSON.parse(body));
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Internal Server Error');
  }
});

// @route   GET api/profile/github/user
// @desc    Get user from Github
// @access  Public
router.get('/github/user', async (req, res) => {
  try {
    const options = {
      uri: `https://api.github.com/users/chphr?&client_id=${config.get(
        'githubClient'
      )}&client_secret=${config.get('githubSecret')}`,
      method: 'GET',
      headers: { 'user-agent': 'node.js' },
    };

    request(options, (error, response, body) => {
      if (error) {
        console.error(error.message);
        return res
          .status(404)
          .send({ msg: 'Errors sending the request to the Github API' });
      }

      if (response.statusCode != 200) {
        return res.status(500).send({ msg: 'Github profile not found' });
      }
      res.json(JSON.parse(body));
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
