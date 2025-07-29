require('dotenv').config({ path: process.env.NODE_ENV === 'production' ? './.env' : './.env' });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const { init } = require('./db');

const app = express();

// Apply security‑related HTTP headers
app.use(helmet());

// Log incoming requests
app.use(morgan('dev'));

// Enable CORS for all origins by default. In production you may wish to restrict this.
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Initialise the database before handling requests
init().then(() => {
  console.log('Database initialized');
});

// Routes
const authRoutes = require('./routes/auth');
const recordRoutes = require('./routes/records');
const userRoutes = require('./routes/users');

app.use('/api', authRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/users', userRoutes);

// Serve the React build files in production. When deployed to a cloud platform
// or after running `npm run build` in the client directory, the static files
// will reside in `client/build`. This fallback ensures the frontend routes
// are served correctly.
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '..', 'client', 'build');
  app.use(express.static(buildPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}

// Start the server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});