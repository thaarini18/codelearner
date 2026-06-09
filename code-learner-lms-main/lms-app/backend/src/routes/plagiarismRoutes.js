const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/plagiarismController');

router.get('/question/:questionId',  ctrl.checkPlagiarism);
router.get('/course/:courseId',      ctrl.checkCoursePlagiarism);

module.exports = router;
