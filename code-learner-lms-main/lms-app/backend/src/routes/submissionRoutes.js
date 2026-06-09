const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/submissionController');

router.post('/',                            ctrl.submitCode);
router.get('/question/:questionId',         ctrl.getSubmissions);
router.get('/student/:studentId',           ctrl.getStudentHistory);

module.exports = router;
