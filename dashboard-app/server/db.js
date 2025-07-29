const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

// Determine the database file from the environment. The default file is `database.sqlite`
const dbFile = process.env.DB_FILE || './database.sqlite';

// Initialize the database connection. The sqlite3 module will create the file if it does not exist.
const db = new sqlite3.Database(dbFile);

/**
 * Initialise the database by creating tables (if they don't exist) and inserting
 * a couple of default users and records. This function returns a Promise and
 * should be awaited during server startup.
 */
function init() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create a table for users
      db.run(
        `CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE,
          password TEXT,
          role TEXT
        )`,
        err => {
          if (err) return reject(err);
          // Create a table for records
          db.run(
            `CREATE TABLE IF NOT EXISTS records (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              title TEXT,
              description TEXT,
              user_id INTEGER,
              FOREIGN KEY(user_id) REFERENCES users(id)
            )`,
            err2 => {
              if (err2) return reject(err2);
              // Check whether default users already exist
              db.get('SELECT COUNT(*) AS count FROM users', (err3, row) => {
                if (err3) return reject(err3);
                if (row.count === 0) {
                  // Insert a default administrator and regular user with hashed passwords
                  const adminPassword = bcrypt.hashSync('admin123', 10);
                  const userPassword = bcrypt.hashSync('user123', 10);
                  db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [
                    'admin',
                    adminPassword,
                    'admin'
                  ]);
                  db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [
                    'user',
                    userPassword,
                    'user'
                  ]);
                  // Insert a couple of sample records for the regular user (id 2)
                  db.run(
                    'INSERT INTO records (title, description, user_id) VALUES (?, ?, ?)',
                    ['Sample Record 1', 'This is a sample record', 2]
                  );
                  db.run(
                    'INSERT INTO records (title, description, user_id) VALUES (?, ?, ?)',
                    ['Sample Record 2', 'Another sample record', 2],
                    () => resolve()
                  );
                } else {
                  resolve();
                }
              });
            }
          );
        }
      );
    });
  });
}

module.exports = {
  db,
  init
};