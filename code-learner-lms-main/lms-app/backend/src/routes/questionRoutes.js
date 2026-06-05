const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');

// Get all questions for a course
router.get('/course/:courseId', questionController.getQuestions);

// Get single question
router.get('/:id', questionController.getQuestion);

// Create new question
router.post('/', questionController.createQuestion);

// Update question
router.put('/:id', questionController.updateQuestion);

// Submit/Update answer
router.post('/:id/answer', questionController.submitAnswer);

// Update answer visibility
router.patch('/:id/visibility', questionController.updateAnswerVisibility);

// Delete question
router.delete('/:id', questionController.deleteQuestion);

module.exports = router;
