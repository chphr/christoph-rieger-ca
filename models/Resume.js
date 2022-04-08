const mongoose = require('mongoose');

const ResumeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['Position', 'Course', 'Award'],
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    default: new Date(),
    required: true,
  },
  endDate: {
    type: Date,
    default: new Date(),
    required: false,
  },
});

module.exports = Resume = mongoose.model('resume', ResumeSchema);
