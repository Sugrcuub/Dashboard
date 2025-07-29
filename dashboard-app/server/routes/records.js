const express = require('express');
const router = express.Router();
const { db } = require('../db');
const authenticate = require('../middleware/auth');
const authorizeRole = require('../middleware/role');

// Helper function to construct SQL WHERE clause for search and user restrictions
function buildWhereClause(user, search) {
  let where = '';
  const params = [];
  // Restrict to user's own records if not admin
  if (user.role !== 'admin') {
    where += ' WHERE records.user_id = ?';
    params.push(user.id);
  }
  // Apply search filter
  if (search) {
    // Determine if we already have a WHERE clause
    if (where) {
      where += ' AND';
    } else {
      where += ' WHERE';
    }
    where += ' (records.title LIKE ? OR records.description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  return { where, params };
}

// GET /api/records
// Retrieve a list of records. Admins get all records; users get only their own. Supports
// optional query parameters: sort, order, search.
router.get('/', authenticate, (req, res) => {
  const { sort, order, search } = req.query;
  const validSort = ['id', 'title', 'description', 'username'];
  // Determine the sort column; default to id
  const sortColumn = validSort.includes(sort) ? sort : 'id';
  const sortOrder = order && order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
  const { where, params } = buildWhereClause(req.user, search);
  // Join users to include username in the response
  const sql = `SELECT records.id, records.title, records.description, records.user_id, users.username
               FROM records
               JOIN users ON users.id = records.user_id
               ${where}
               ORDER BY ${sortColumn} ${sortOrder}`;
  db.all(sql, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }
    return res.json(rows);
  });
});

// GET /api/records/:id
// Retrieve a single record. Admins can access any record; users can only access their own.
router.get('/:id', authenticate, (req, res) => {
  const recordId = req.params.id;
  db.get(
    `SELECT records.id, records.title, records.description, records.user_id, users.username
     FROM records JOIN users ON users.id = records.user_id
     WHERE records.id = ?`,
    [recordId],
    (err, record) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }
      if (!record) {
        return res.status(404).json({ message: 'Record not found' });
      }
      // Check ownership
      if (req.user.role !== 'admin' && record.user_id !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      return res.json(record);
    }
  );
});

// POST /api/records
// Create a new record. Only admins can create records.
router.post('/', authenticate, authorizeRole('admin'), (req, res) => {
  const { title, description, user_id } = req.body;
  if (!title || !description || !user_id) {
    return res.status(400).json({ message: 'Title, description and user_id are required' });
  }
  // Verify the user_id exists
  db.get('SELECT id FROM users WHERE id = ?', [user_id], (err, user) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }
    db.run(
      'INSERT INTO records (title, description, user_id) VALUES (?, ?, ?)',
      [title, description, user_id],
      function (err2) {
        if (err2) {
          return res.status(500).json({ message: 'Database error' });
        }
        // Return the created record id
        return res.status(201).json({ id: this.lastID, title, description, user_id });
      }
    );
  });
});

// PUT /api/records/:id
// Update an existing record. Only admins can update records.
router.put('/:id', authenticate, authorizeRole('admin'), (req, res) => {
  const recordId = req.params.id;
  const { title, description, user_id } = req.body;
  if (!title || !description || !user_id) {
    return res.status(400).json({ message: 'Title, description and user_id are required' });
  }
  // Verify target user exists
  db.get('SELECT id FROM users WHERE id = ?', [user_id], (err, user) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }
    // Update record
    db.run(
      'UPDATE records SET title = ?, description = ?, user_id = ? WHERE id = ?',
      [title, description, user_id, recordId],
      function (err2) {
        if (err2) {
          return res.status(500).json({ message: 'Database error' });
        }
        if (this.changes === 0) {
          return res.status(404).json({ message: 'Record not found' });
        }
        return res.json({ id: Number(recordId), title, description, user_id });
      }
    );
  });
});

// DELETE /api/records/:id
// Delete a record. Only admins can delete records.
router.delete('/:id', authenticate, authorizeRole('admin'), (req, res) => {
  const recordId = req.params.id;
  db.run('DELETE FROM records WHERE id = ?', [recordId], function (err) {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Record not found' });
    }
    return res.json({ message: 'Record deleted' });
  });
});

module.exports = router;