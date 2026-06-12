const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  studentUsername: { type: String, required: true, lowercase: true, trim: true },
  studentName:     { type: String, required: true, trim: true },
  rollNumber:      { type: String, default: '', trim: true },
  courseCode:      { type: String, required: true, uppercase: true, trim: true },
}, { timestamps: true });

// A student can only enroll in a given course once
enrollmentSchema.index({ studentUsername: 1, courseCode: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', enrollmentSchema);
