const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

let questions = [
  { _id: '1', title: 'Write a MIPS program to add two numbers', description: 'Use registers $t0 and $t1', answer: '.data\n.text\nmain:\n  li $t0, 5\n  li $t1, 3\n  add $t2, $t0, $t1', isAnswerVisible: false, courseId: 'cs101', difficulty: 'easy', createdBy: 'teacher' },
  { _id: '2', title: 'Implement a loop in MIPS assembly', description: 'Print numbers 1 to 10 using a loop', answer: null, isAnswerVisible: false, courseId: 'cs101', difficulty: 'medium', createdBy: 'teacher' },
  { _id: '3', title: 'What is a syscall in MIPS?', description: 'Explain how syscall works in MIPS', answer: 'syscall transfers control to OS to perform services like I/O', isAnswerVisible: true, courseId: 'cs101', difficulty: 'easy', createdBy: 'teacher' }
];

app.get('/api/health', (req, res) => res.json({ status: 'OK' }));
app.get('/api/questions/course/:courseId', (req, res) => res.json(questions));
app.post('/api/questions', (req, res) => {
  const q = { ...req.body, _id: Date.now().toString(), isAnswerVisible: false };
  questions.push(q);
  res.json(q);
});
app.post('/api/questions/:id/answer', (req, res) => {
  const q = questions.find(q => q._id === req.params.id);
  if (q) { q.answer = req.body.answer; res.json(q); }
  else res.status(404).json({ error: 'Not found' });
});
app.patch('/api/questions/:id/visibility', (req, res) => {
  const q = questions.find(q => q._id === req.params.id);
  if (q) { q.isAnswerVisible = req.body.isAnswerVisible; res.json(q); }
  else res.status(404).json({ error: 'Not found' });
});
app.put('/api/questions/:id', (req, res) => {
  const i = questions.findIndex(q => q._id === req.params.id);
  if (i >= 0) { questions[i] = { ...questions[i], ...req.body }; res.json(questions[i]); }
  else res.status(404).json({ error: 'Not found' });
});
app.delete('/api/questions/:id', (req, res) => {
  questions = questions.filter(q => q._id !== req.params.id);
  res.json({ success: true });
});

app.listen(5000, () => console.log('Mock backend running on port 5000'));
