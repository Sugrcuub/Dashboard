const jwt = require('jsonwebtoken');

/**
 * Middleware to authenticate users based on a JSON Web Token.  It expects the token
 * to be provided in the `Authorization` header using the `Bearer <token>` format.
 * If the token is missing or invalid the request is rejected with an appropriate
 * status code.
 */
function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    // Attach the user payload (containing id, username and role) to the request
    req.user = user;
    next();
  });
}

module.exports = authenticate;