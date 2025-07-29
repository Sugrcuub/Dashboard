import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

/**
 * A wrapper component for protecting routes.  It checks whether a user is
 * authenticated and optionally whether they belong to one of a set of allowed
 * roles.  If the check fails the user is redirected to the login page or the
 * dashboard depending on their current state.
 *
 * Usage:
 *   <PrivateRoute> <Dashboard /> </PrivateRoute>
 *   <PrivateRoute roles={['admin']}> <AdminPanel /> </PrivateRoute>
 */
const PrivateRoute = ({ roles = [] }) => {
  const { user } = useContext(AuthContext);
  if (!user) {
    // Not authenticated; redirect to login
    return <Navigate to="/login" replace />;
  }
  // If roles are specified, ensure the user's role is allowed
  if (roles.length > 0 && !roles.includes(user.role)) {
    // Redirect non‑admins to the dashboard
    return <Navigate to="/dashboard" replace />;
  }
  // Render children or nested routes
  return <Outlet />;
};

export default PrivateRoute;