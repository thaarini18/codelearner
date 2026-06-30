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

  const prompt = `You are a code generator. Output ONLY raw code with no explanation, no markdown, no code fences, no comments other than a single TODO comment showing where the student should write their solution.

Generate starter/boilerplate code in ${langName} for a programming question titled "${title || 'Untitled'}".
Include only: necessary imports, class/function structure, and a main entry point if required by the language.
Do not solve the problem. Output raw code only.`;

  try {
    const response = await axios.post(OLLAMA_URL, {
      model: OLLAMA_MODEL,
      prompt,
      stream: false,
      options: { temperature: 0.1, num_predict: 300 },
    }, { timeout: 30000 });

    let code = response.data.response || '';

    // Strip any markdown code fences the model might still include
    code = code.replace(/^```[\w]*\n?/gm, '').replace(/^```$/gm, '').trim();

    res.json({ code });
  } catch (err) {
    if (err.code === 'ECONNREFUSED') {
      return res.status(503).json({ error: 'Ollama is not running. Start it with: ollama serve' });
    }
    res.status(500).json({ error: err.message });
  }
};
