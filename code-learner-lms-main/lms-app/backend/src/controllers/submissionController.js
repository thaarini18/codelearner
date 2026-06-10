const axios     = require('axios');
const { spawn } = require('child_process');
const fs        = require('fs');
const path      = require('path');
const os        = require('os');
const Submission = require('../models/Submission');
const Question   = require('../models/Question');
const Grade      = require('../models/Grade');

const JUDGE0_URL = 'https://ce.judge0.com/submissions?base64_encoded=false&wait=true';

// Judge0 language IDs
const JUDGE0_LANG = {
  python:     71,   // Python 3.8.1
  javascript: 63,   // Node.js 12.14.0
  c:          50,   // C (GCC 9.2.0)
  cpp:        54,   // C++ (GCC 9.2.0)
  java:       62,   // Java (OpenJDK 13.0.1)
  csharp:     51,   // C# (Mono 6.6.0)
  ruby:       72,   // Ruby 2.7.0
};

// ── MIPS execution via local SPIM ──
function runMips(code, stdin = '') {
  return new Promise((resolve) => {
    const tmpFile = path.join(os.tmpdir(), `mips_${Date.now()}_${Math.random().toString(36).slice(2)}.asm`);
    fs.writeFileSync(tmpFile, code);

    let stdout = '';
    let stderr = '';
    const proc = spawn('spim', ['-f', tmpFile], { timeout: 10000 });

    proc.stdin.write(stdin || '');
    proc.stdin.end();
    proc.stdout.on('data', d => { stdout += d.toString(); });
    proc.stderr.on('data', d => { stderr += d.toString(); });

    const cleanup = () => { try { fs.unlinkSync(tmpFile); } catch (_) {} };

    proc.on('close', () => {
      cleanup();
      // Strip SPIM header lines (everything up to and including the last "Loaded:" line)
      const lines = stdout.split('\n');
      const lastLoaded = lines.reduce((acc, l, i) => l.startsWith('Loaded:') ? i : acc, -1);
      const clean = lines.slice(lastLoaded + 1).join('\n').trim();

      // SPIM prints assembly errors in stdout prefixed with "spim:"
      const spimErr = lines.find(l => /^spim:/i.test(l));
      if (spimErr && !clean) {
        resolve({ output: null, error: spimErr });
      } else {
        resolve({ output: clean, error: null });
      }
    });

    proc.on('error', (err) => {
      cleanup();
      if (err.code === 'ENOENT') {
        resolve({ output: null, error: 'SPIM is not installed. Run: brew install spim' });
      } else {
        resolve({ output: null, error: err.message });
      }
    });
  });
}

// Run code for a single test case via Judge0 (or SPIM for MIPS)
async function runCode(language, code, stdin = '') {
  // MIPS → run locally via SPIM
  if (language === 'mips') {
    return runMips(code, stdin);
  }

  const langId = JUDGE0_LANG[language];
  if (!langId) {
    return { output: null, error: `Language "${language}" is not supported.` };
  }
  try {
    const res = await axios.post(JUDGE0_URL, {
      source_code: code,
      language_id: langId,
      stdin:       stdin || '',
      cpu_time_limit: 5,
      memory_limit:   128000,
    }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 15000,
    });

    const { stdout, stderr, compile_output, status } = res.data;

    // Compilation error
    if (compile_output && compile_output.trim()) {
      return { output: null, error: compile_output.trim() };
    }
    // Runtime error
    if (stderr && stderr.trim()) {
      return { output: null, error: stderr.trim() };
    }
    // Time limit / other status errors
    if (status && status.id > 3) {
      return { output: null, error: status.description };
    }
    return { output: (stdout || '').trim(), error: null };
  } catch (err) {
    return { output: null, error: err.message };
  }
}

// POST /api/submissions  — run code + save submission
exports.submitCode = async (req, res) => {
  try {
    const { questionId, courseId, language, code } = req.body;
    // Identity comes from the authenticated JWT, not the request body,
    // so a student can't submit code under another student's name.
    const studentId = req.user.name;
    if (!questionId || !language || !code) {
      return res.status(400).json({ error: 'questionId, language and code are required.' });
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
    // Students may only view their own submission history; teachers can view anyone's.
    if (req.user.role === 'student' && req.user.name !== req.params.studentId) {
      return res.status(403).json({ error: 'You can only view your own submission history.' });
    }
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
