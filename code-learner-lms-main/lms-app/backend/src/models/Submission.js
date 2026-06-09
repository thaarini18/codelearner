const mongoose = require('mongoose');

const testResultSchema = new mongoose.Schema({
  label:          { type: String, default: '' },
  input:          { type: String, default: '' },
  expectedOutput: { type: String, default: '' },
  actualOutput:   { type: String, default: '' },
  passed:         { type: Boolean, default: false },
  isHidden:       { type: Boolean, default: false },
}, { _id: false });

const submissionSchema = new mongoose.Schema({
  questionId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  courseId:      { type: String, required: true },
  studentId:     { type: String, required: true },   // student name / identifier
  language:      { type: String, required: true },
  code:          { type: String, required: true },
  testResults:   { type: [testResultSchema], default: [] },
  score:         { type: Number, default: 0 },       // 0–100
  totalPassed:   { type: Number, default: 0 },
  totalCases:    { type: Number, default: 0 },
  executionError:{ type: String, default: null },
  submittedAt:   { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Submission', submissionSchema);
