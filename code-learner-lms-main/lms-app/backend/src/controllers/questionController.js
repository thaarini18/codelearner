const Question = require('../models/Question');

exports.getQuestions = async (req, res) => {
  try {
    const questions = await Question.find({ courseId: req.params.courseId }).sort({ createdAt: -1 });
    res.json(questions);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.getQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ error: 'Not found' });
    res.json(question);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.createQuestion = async (req, res) => {
  try {
    const { title, description, courseId, createdBy, difficulty, placeholderCode, language, testCases } = req.body;
    if (!title || !description || !courseId || !createdBy)
      return res.status(400).json({ error: 'Missing required fields' });
    const question = new Question({ title, description, courseId, createdBy, difficulty, placeholderCode: placeholderCode || '', language: language || 'mips', testCases: testCases || [] });
    res.status(201).json(await question.save());
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.updateQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ error: 'Not found' });
    const fields = ['title', 'description', 'answer', 'isAnswerVisible', 'difficulty', 'placeholderCode', 'language', 'testCases'];
    fields.forEach(f => { if (req.body[f] !== undefined) question[f] = req.body[f]; });
    res.json(await question.save());
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.updateAnswerVisibility = async (req, res) => {
  try {
    const { isAnswerVisible } = req.body;
    if (typeof isAnswerVisible !== 'boolean') return res.status(400).json({ error: 'isAnswerVisible must be boolean' });
    const question = await Question.findByIdAndUpdate(req.params.id, { isAnswerVisible }, { new: true });
    if (!question) return res.status(404).json({ error: 'Not found' });
    res.json(question);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.submitAnswer = async (req, res) => {
  try {
    const { answer } = req.body;
    if (!answer?.trim()) return res.status(400).json({ error: 'Answer cannot be empty' });
    const question = await Question.findByIdAndUpdate(req.params.id, { answer }, { new: true });
    if (!question) return res.status(404).json({ error: 'Not found' });
    res.json(question);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (e) { res.status(500).json({ error: e.message }); }
};
