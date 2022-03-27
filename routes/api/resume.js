const express = require('express');
const router = express.Router();

// @route   GET api/resume
// @desc    Test Route
// @access  Public
router.get('/', (req,res) => res.send('Resume Route'));

module.exports = router;