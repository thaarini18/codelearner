const Question = require('../models/Question');
const axios    = require('axios');

const OLLAMA_URL = 'http://localhost:11434/api/generate';
const OLLAMA_MODEL = 'qwen2.5-coder:1.5b';

const LANG_NAMES = {
  c: 'C', cpp: 'C++', python: 'Python', java: 'Java',
  javascript: 'JavaScript', csharp: 'C#', ruby: 'Ruby',
  mips: 'MIPS Assembly', sql: 'SQLite SQL', flex: 'Flex/Lex',
};

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

// POST /api/questions/generate-starter
// Calls local Ollama to generate boilerplate starter code for a given language + question.
exports.generateStarterCode = async (req, res) => {
  const { language, title, description } = req.body;
  if (!language) return res.status(400).json({ error: 'language is required.' });

  const langName = LANG_NAMES[language] || language;

  const prompt = `Output ONLY raw ${langName} code. No explanation. No markdown. No code fences. No backticks.

Rules:
- Include necessary imports and a main entry point only.
- Do NOT implement any logic or solve the problem.
- Replace the function body with a single comment: // TODO: write your solution here
- Do not add helper functions or sample implementations.

Question title: "${title || 'Untitled'}"

Raw code:`;

  try {
    const response = await axios.post(OLLAMA_URL, {
      model: OLLAMA_MODEL,
      prompt,
      stream: false,
      options: { temperature: 0.1, num_predict: 300 },
    }, { timeout: 30000 });

    let code = response.data.response || '';

    // Strip any markdown code fences or stray backticks the model might include
    code = code.replace(/^```[\w]*\n?/gm, '').replace(/`{1,3}/g, '').trim();

    res.json({ code });
  } catch (err) {
    if (err.code === 'ECONNREFUSED') {
      return res.status(503).json({ error: 'Ollama is not running. Start it with: ollama serve' });
    }
    res.status(500).json({ error: err.message });
  }
};
