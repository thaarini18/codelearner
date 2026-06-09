const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/gradeController');

router.get('/course/:courseId',       ctrl.getCourseGrades);
router.get('/student/:studentId',     ctrl.getStudentGrade);

module.exports = router;
