const jwt  = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET     = process.env.JWT_SECRET || 'dev_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

function signToken(user) {
  return jwt.sign(
    { id: user._id, username: user.username, role: user.role, name: user.name, courseId: user.courseId },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// POST /api/auth/register  { username, password, name, role, courseId }
exports.register = async (req, res) => {
  try {
    const { username, password, name, role, courseId } = req.body;

    if (!username || !password || !name || !role) {
      return res.status(400).json({ error: 'username, password, name and role are required.' });
    }
    if (!['student', 'teacher'].includes(role)) {
      return res.status(400).json({ error: 'role must be "student" or "teacher".' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const existing = await User.findOne({ username: username.trim().toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: 'That username is already taken.' });
    }

    const user = await User.create({
      username: username.trim().toLowerCase(),
      passwordHash: password, // hashed by pre-save hook
      name: name.trim(),
      role,
      courseId: courseId || 'course-001',
    });

    const token = signToken(user);
    res.status(201).json({ token, user });
  } catch (err) {
    console.error('register error:', err);
    res.status(500).json({ error: err.message });
  }
};

// POST /api/auth/login  { username, password }
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'username and password are required.' });
    }

    const user = await User.findOne({ username: username.trim().toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const match = await user.comparePassword(password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const token = signToken(user);
    res.json({ token, user });
  } catch (err) {
    console.error('login error:', err);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/auth/me  (requires auth middleware)
exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
