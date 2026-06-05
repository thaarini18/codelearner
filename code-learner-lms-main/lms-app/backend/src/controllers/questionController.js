const Question = require('../models/Question');

// Get all questions for a course
exports.getQuestions = async (req, res) => {
  try {
    const { courseId } = req.params;
    const questions = await Question.find({ courseId }).sort({ createdAt: -1 });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single question by ID
exports.getQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    res.json(question);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new question
exports.createQuestion = async (req, res) => {
  try {
    const { title, description, courseId, createdBy, difficulty } = req.body;

    if (!title || !description || !courseId || !createdBy) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const question = new Question({
      title,
      description,
      courseId,
      createdBy,
      difficulty,
    });

    const savedQuestion = await question.save();
    res.status(201).json(savedQuestion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update question (add/edit answer)
exports.updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, answer, isAnswerVisible, difficulty } = req.body;

    const question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    // Update fields if provided
    if (title !== undefined) question.title = title;
    if (description !== undefined) question.description = description;
    if (answer !== undefined) question.answer = answer;
    if (isAnswerVisible !== undefined) question.isAnswerVisible = isAnswerVisible;
    if (difficulty !== undefined) question.difficulty = difficulty;

    const updatedQuestion = await question.save();
    res.json(updatedQuestion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update answer visibility only
exports.updateAnswerVisibility = async (req, res) => {
  try {
    const { id } = req.params;
    const { isAnswerVisible } = req.body;

    if (typeof isAnswerVisible !== 'boolean') {
      return res.status(400).json({ error: 'isAnswerVisible must be a boolean' });
    }

    const question = await Question.findByIdAndUpdate(
      id,
      { isAnswerVisible },
      { new: true }
    );

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    res.json(question);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Submit/Update answer
exports.submitAnswer = async (req, res) => {
  try {
    const { id } = req.params;
    const { answer } = req.body;

    if (!answer || answer.trim() === '') {
      return res.status(400).json({ error: 'Answer cannot be empty' });
    }

    const question = await Question.findByIdAndUpdate(
      id,
      { answer },
      { new: true }
    );

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    res.json(question);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete question
exports.deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const question = await Question.findByIdAndDelete(id);

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
