const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/plagiarismController');
const { authenticate, requireRole } = require('../middleware/auth');

// Plagiarism reports are teacher-only
router.get('/question/:questionId', authenticate, requireRole('teacher'), ctrl.checkPlagiarism);
router.get('/course/:courseId',     authenticate, requireRole('teacher'), ctrl.checkCoursePlagiarism);

module.exports = router;
