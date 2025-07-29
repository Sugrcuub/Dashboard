const express = require('express');
const router = express.Router();
const { db } = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authenticate = require('../middleware/auth');

// POST /api/login
// Authenticate a user and return a signed JWT along with user information.
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }
  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    // Compare supplied password to stored hash
    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const payload = { id: user.id, username: user.username, role: user.role };
    // Sign the token. The expiry is configurable; here we set it to 1 hour.
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    return res.json({ token, user: payload });
  });
});

// GET /api/me
// Return the currently authenticated user's payload. This route uses the
// authenticate middleware to verify the token.
router.get('/me', authenticate, (req, res) => {
  return res.json({ user: req.user });
});

module.exports = router;