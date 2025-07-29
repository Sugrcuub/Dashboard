/**
 * Middleware factory that restricts access to certain user roles.  It should be
 * used after the authentication middleware.  If the authenticated user's role
 * does not match one of the allowed roles the request is rejected with a 403.
 *
 * @param {string|string[]} roles - A role or list of roles permitted for the route.
 */
function authorizeRole(roles = []) {
  if (typeof roles === 'string') {
    roles = [roles];
  }
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    if (!roles.length || roles.includes(req.user.role)) {
      return next();
    }
    return res.status(403).json({ message: 'Forbidden' });
  };
}

module.exports = authorizeRole;