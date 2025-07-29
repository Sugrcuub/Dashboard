import React, { useEffect, useState } from 'react';

/**
 * Form component for creating or editing a user.  When editing, the `initialData`
 * prop contains the user's current information.  The password field is left
 * empty when editing and only updated if a new password is entered.  The role
 * can only be changed by administrators.
 */
const UserForm = ({ initialData, onSubmit, onCancel }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');

  useEffect(() => {
    if (initialData) {
      setUsername(initialData.username || '');
      setRole(initialData.role || 'user');
    } else {
      setUsername('');
      setRole('user');
    }
    setPassword('');
  }, [initialData]);

  const handleSubmit = e => {
    e.preventDefault();
    const data = { username: username.trim(), role };
    if (password.trim()) {
      data.password = password.trim();
    }
    onSubmit(data);
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: '1rem', marginTop: '1rem' }}>
      <h3>{initialData ? 'Edit User' : 'Add User'}</h3>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '0.5rem' }}>
          <label htmlFor="username">Username:</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <div style={{ marginBottom: '0.5rem' }}>
          <label htmlFor="password">Password:</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder={initialData ? 'Leave blank to keep existing password' : ''}
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <div style={{ marginBottom: '0.5rem' }}>
          <label htmlFor="role">Role:</label>
          <select
            id="role"
            value={role}
            onChange={e => setRole(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button type="submit" style={{ padding: '0.5rem 1rem', marginRight: '0.5rem' }}>
          {initialData ? 'Update' : 'Create'}
        </button>
        <button type="button" onClick={onCancel} style={{ padding: '0.5rem 1rem' }}>
          Cancel
        </button>
      </form>
    </div>
  );
};

export default UserForm;