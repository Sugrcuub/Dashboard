const express = require('express');
const router = express.Router();
const { db } = require('../db');
const bcrypt = require('bcryptjs');
const authenticate = require('../middleware/auth');
const authorizeRole = require('../middleware/role');

// Utility: validate role
function isValidRole(role) {
  return role === 'admin' || role === 'user';
}

// GET /api/users
// Return a list of all users (id, username, role). Only admins can access.
router.get('/', authenticate, authorizeRole('admin'), (req, res) => {
  db.all('SELECT id, username, role FROM users ORDER BY id ASC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }
    return res.json(rows);
  });
});

// GET /api/users/:id
// Return a single user. Admins can fetch anyone; a user can fetch themself.
router.get('/:id', authenticate, (req, res) => {
  const id = parseInt(req.params.id, 10);
  // If the requester is not admin and not the same user, forbid
  if (req.user.role !== 'admin' && req.user.id !== id) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  db.get('SELECT id, username, role FROM users WHERE id = ?', [id], (err, user) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json(user);
  });
});

// POST /api/users
// Create a new user. Only admins can create users.
router.post('/', authenticate, authorizeRole('admin'), (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password || !role) {
    return res.status(400).json({ message: 'Username, password and role are required' });
  }
  if (!isValidRole(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }
  // Check if username already exists
  db.get('SELECT id FROM users WHERE username = ?', [username], (err, existing) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }
    if (existing) {
      return res.status(400).json({ message: 'Username already taken' });
    }
    const hashed = bcrypt.hashSync(password, 10);
    db.run(
      'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
      [username, hashed, role],
      function (err2) {
        if (err2) {
          return res.status(500).json({ message: 'Database error' });
        }
        return res.status(201).json({ id: this.lastID, username, role });
      }
    );
  });
});

// PUT /api/users/:id
// Update an existing user. Only admins can update other users; a user can update their own
// password or username (but not role) if allowed. Admins can update any field.
router.put('/:id', authenticate, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { username, password, role } = req.body;
  // Determine if the requester is allowed to update role
  const isAdmin = req.user.role === 'admin';
  if (!isAdmin && req.user.id !== id) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  // Validate role if provided
  if (role && !isValidRole(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }
  // Build update statement dynamically
  const fields = [];
  const params = [];
  if (username) {
    fields.push('username = ?');
    params.push(username);
  }
  if (password) {
    const hashed = bcrypt.hashSync(password, 10);
    fields.push('password = ?');
    params.push(hashed);
  }
  if (isAdmin && role) {
    fields.push('role = ?');
    params.push(role);
  }
  if (fields.length === 0) {
    return res.status(400).json({ message: 'Nothing to update' });
  }
  params.push(id);
  const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
  db.run(sql, params, function (err) {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json({ message: 'User updated' });
  });
});

// DELETE /api/users/:id
// Delete a user. Only admins can delete users. When a user is deleted their records
// remain or can be optionally deleted; here we delete associated records as well.
router.delete('/:id', authenticate, authorizeRole('admin'), (req, res) => {
  const id = parseInt(req.params.id, 10);
  // Delete records associated with the user first to avoid orphan rows
  db.run('DELETE FROM records WHERE user_id = ?', [id], err => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }
    db.run('DELETE FROM users WHERE id = ?', [id], function (err2) {
      if (err2) {
        return res.status(500).json({ message: 'Database error' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      return res.json({ message: 'User and associated records deleted' });
    });
  });
});

module.exports = router;