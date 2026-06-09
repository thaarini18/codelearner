const Submission = require('../models/Submission');

// Tokenize code — strip comments, whitespace, normalize identifiers
function tokenize(code) {
  return code
    .replace(/\/\/[^\n]*/g, '')       // remove // comments
    .replace(/\/\*[\s\S]*?\*\//g, '') // remove /* */ comments
    .replace(/#[^\n]*/g, '')          // remove # comments (Python)
    .replace(/['"](.*?)['"]/g, 'STR') // normalize string literals
    .replace(/\b\d+\b/g, 'NUM')       // normalize numbers
    .replace(/\s+/g, ' ')
    .trim()
    .split(/\s+/);
}

function jaccardSimilarity(tokensA, tokensB) {
  const setA = new Set(tokensA);
  const setB = new Set(tokensB);
  const intersection = [...setA].filter(t => setB.has(t)).length;
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : intersection / union;
}

// GET /api/plagiarism/question/:questionId?threshold=70
exports.checkPlagiarism = async (req, res) => {
  try {
    const threshold = parseFloat(req.query.threshold || 70) / 100;
    // Get the best submission per student for this question
    const allSubs = await Submission.find({ questionId: req.params.questionId })
      .sort({ score: -1, submittedAt: -1 });

    // Keep only the best submission per student
    const bestByStudent = {};
    for (const sub of allSubs) {
      if (!bestByStudent[sub.studentId]) bestByStudent[sub.studentId] = sub;
    }
    const subs = Object.values(bestByStudent);

    if (subs.length < 2) {
      return res.json({ pairs: [], message: 'Need at least 2 submissions to compare.' });
    }

    const tokenized = subs.map(s => ({ sub: s, tokens: tokenize(s.code) }));
    const pairs = [];

    for (let i = 0; i < tokenized.length; i++) {
      for (let j = i + 1; j < tokenized.length; j++) {
        const sim = jaccardSimilarity(tokenized[i].tokens, tokenized[j].tokens);
        if (sim >= threshold) {
          pairs.push({
            studentA:   tokenized[i].sub.studentId,
            studentB:   tokenized[j].sub.studentId,
            similarity: Math.round(sim * 100),
            languageA:  tokenized[i].sub.language,
            languageB:  tokenized[j].sub.language,
            submittedA: tokenized[i].sub.submittedAt,
            submittedB: tokenized[j].sub.submittedAt,
          });
        }
      }
    }

    pairs.sort((a, b) => b.similarity - a.similarity);
    res.json({ pairs, totalCompared: subs.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/plagiarism/course/:courseId?threshold=70
exports.checkCoursePlagiarism = async (req, res) => {
  try {
    const threshold = parseFloat(req.query.threshold || 70) / 100;
    const allSubs = await Submission.find({ courseId: req.params.courseId })
      .sort({ score: -1, submittedAt: -1 });

    // Group by questionId
    const byQuestion = {};
    for (const sub of allSubs) {
      const qid = sub.questionId.toString();
      if (!byQuestion[qid]) byQuestion[qid] = {};
      if (!byQuestion[qid][sub.studentId]) byQuestion[qid][sub.studentId] = sub;
    }

    const results = [];
    for (const [questionId, studentMap] of Object.entries(byQuestion)) {
      const subs = Object.values(studentMap);
      if (subs.length < 2) continue;
      const tokenized = subs.map(s => ({ sub: s, tokens: tokenize(s.code) }));
      for (let i = 0; i < tokenized.length; i++) {
        for (let j = i + 1; j < tokenized.length; j++) {
          const sim = jaccardSimilarity(tokenized[i].tokens, tokenized[j].tokens);
          if (sim >= threshold) {
            results.push({
              questionId,
              studentA:   tokenized[i].sub.studentId,
              studentB:   tokenized[j].sub.studentId,
              similarity: Math.round(sim * 100),
              languageA:  tokenized[i].sub.language,
              languageB:  tokenized[j].sub.language,
            });
          }
        }
      }
    }
    results.sort((a, b) => b.similarity - a.similarity);
    res.json({ pairs: results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
