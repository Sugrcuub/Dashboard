import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import AdminPanel from './components/AdminPanel';
import PrivateRoute from './components/PrivateRoute';
import { AuthContext } from './contexts/AuthContext';

/**
 * Root component for application routing.  Routes are protected using the
 * PrivateRoute component.  Depending on the authenticated user's role the
 * appropriate dashboards are shown.
 */
function App() {
  const { user } = useContext(AuthContext);
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      {/* All routes below require authentication */}
      <Route element={<PrivateRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        {/* Admin routes */}
        <Route element={<PrivateRoute roles={["admin"]} />}>
          <Route path="/admin" element={<AdminPanel />} />
        </Route>
      </Route>
      {/* Fallback: redirect based on auth status */}
      <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
    </Routes>
  );
}

export default App;