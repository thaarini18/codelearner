const axios     = require('axios');
const Submission = require('../models/Submission');
const Question   = require('../models/Question');
const Grade      = require('../models/Grade');

const PISTON_URL = 'https://emkc.org/api/v2/piston/execute';

// Map our language keys → Piston runtime identifiers
const PISTON_LANG = {
  python:     { language: 'python',     version: '3.10.0' },
  javascript: { language: 'javascript', version: '18.15.0' },
  c:          { language: 'c',          version: '10.2.0' },
  cpp:        { language: 'c++',        version: '10.2.0' },
  java:       { language: 'java',       version: '15.0.2' },
  csharp:     { language: 'csharp',     version: '6.12.0' },
  ruby:       { language: 'ruby',       version: '3.0.1'  },
};

// Run code for a single test case via Piston
async function runCode(language, code, stdin = '') {
  const runtime = PISTON_LANG[language];
  if (!runtime) {
    return { output: null, error: `Language "${language}" execution is not supported (MIPS requires SPIM/MARS simulator).` };
  }
  try {
    const res = await axios.post(PISTON_URL, {
      language: runtime.language,
      version:  runtime.version,
      files:    [{ content: code }],
      stdin,
      run_timeout: 5000,
    }, { timeout: 10000 });

    const run = res.data.run;
    if (run.code !== 0 && run.stderr) {
      return { output: null, error: run.stderr.trim() };
    }
    return { output: (run.stdout || '').trim(), error: null };
  } catch (err) {
    return { output: null, error: err.message };
  }
}

// POST /api/submissions  — run code + save submission
exports.submitCode = async (req, res) => {
  try {
    const { questionId, courseId, studentId, language, code } = req.body;
    if (!questionId || !studentId || !language || !code) {
      return res.status(400).json({ error: 'questionId, studentId, language and code are required.' });
    }

    const question = await Question.findById(questionId);
    if (!question) return res.status(404).json({ error: 'Question not found.' });

    const testCases = question.testCases || [];
    const testResults = [];
    let totalPassed = 0;
    let executionError = null;

    if (testCases.length === 0) {
      // No test cases — just run the code and record output
      const { output, error } = await runCode(language, code, '');
      executionError = error;
      // Store a single "free run" result
      testResults.push({
        label: 'Free run',
        input: '',
        expectedOutput: '',
        actualOutput: output || '',
        passed: !error,
        isHidden: false,
      });
      if (!error) totalPassed = 1;
    } else {
      for (const tc of testCases) {
        const { output, error } = await runCode(language, code, tc.input);
        if (error && !executionError) executionError = error;
        const actual = output || '';
        const expected = (tc.expectedOutput || '').trim();
        const passed = !error && actual === expected;
        if (passed) totalPassed++;
        testResults.push({
          label:          tc.label || '',
          input:          tc.input || '',
          expectedOutput: tc.expectedOutput || '',
          actualOutput:   actual,
          passed,
          isHidden:       tc.isHidden || false,
        });
      }
    }

    const totalCases = testResults.length;
    const score = totalCases > 0 ? Math.round((totalPassed / totalCases) * 100) : 0;

    const submission = await Submission.create({
      questionId,
      courseId:      courseId || question.courseId,
      studentId,
      language,
      code,
      testResults,
      score,
      totalPassed,
      totalCases,
      executionError,
    });

    // Update grade record
    await updateGrade(studentId, courseId || question.courseId, questionId, question.title, score);

    res.json(submission);
  } catch (err) {
    console.error('submitCode error:', err);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/submissions/question/:questionId?studentId=xxx
exports.getSubmissions = async (req, res) => {
  try {
    const filter = { questionId: req.params.questionId };
    if (req.query.studentId) filter.studentId = req.query.studentId;
    const subs = await Submission.find(filter).sort({ submittedAt: -1 });
    res.json(subs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/submissions/student/:studentId?courseId=xxx
exports.getStudentHistory = async (req, res) => {
  try {
    const filter = { studentId: req.params.studentId };
    if (req.query.courseId) filter.courseId = req.query.courseId;
    const subs = await Submission.find(filter)
      .populate('questionId', 'title difficulty language')
      .sort({ submittedAt: -1 });
    res.json(subs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Helper — upsert grade after each submission
async function updateGrade(studentId, courseId, questionId, questionTitle, score) {
  try {
    let grade = await Grade.findOne({ studentId, courseId });
    if (!grade) {
      grade = new Grade({ studentId, courseId, grades: [], totalScore: 0 });
    }
    const idx = grade.grades.findIndex(g => g.questionId.toString() === questionId.toString());
    if (idx === -1) {
      grade.grades.push({ questionId, questionTitle, bestScore: score, attempts: 1, lastSubmittedAt: new Date() });
    } else {
      grade.grades[idx].attempts += 1;
      grade.grades[idx].lastSubmittedAt = new Date();
      if (score > grade.grades[idx].bestScore) grade.grades[idx].bestScore = score;
    }
    // total = average of best scores
    const total = grade.grades.reduce((sum, g) => sum + g.bestScore, 0);
    grade.totalScore = grade.grades.length > 0 ? Math.round(total / grade.grades.length) : 0;
    grade.updatedAt = new Date();
    await grade.save();
  } catch (e) {
    console.error('updateGrade error:', e.message);
  }
}
