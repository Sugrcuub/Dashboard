import React, { useEffect, useState } from 'react';
import axios from 'axios';
import RecordForm from './RecordForm';
import UserForm from './UserForm';

/**
 * The admin panel allows administrators to manage users and records.  It fetches
 * both lists from the API and displays them in simple tables.  Buttons are
 * provided to create, edit and delete items.  Forms are rendered inline when
 * adding or editing.
 */
const AdminPanel = () => {
  const [records, setRecords] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form state: if null then the form is hidden; if object then editing/creating
  const [recordFormData, setRecordFormData] = useState(null);
  const [userFormData, setUserFormData] = useState(null);

  useEffect(() => {
    // Fetch both users and records when component mounts
    const loadData = async () => {
      setLoading(true);
      setError('');
      try {
        const [recordsRes, usersRes] = await Promise.all([
          axios.get('/api/records'),
          axios.get('/api/users')
        ]);
        setRecords(recordsRes.data);
        setUsers(usersRes.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load admin data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Refresh the lists separately when needed
  const refreshRecords = async () => {
    try {
      const res = await axios.get('/api/records');
      setRecords(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not refresh records');
    }
  };
  const refreshUsers = async () => {
    try {
      const res = await axios.get('/api/users');
      setUsers(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not refresh users');
    }
  };

  // Record handlers
  const handleAddRecord = () => {
    setRecordFormData({});
  };
  const handleEditRecord = record => {
    setRecordFormData(record);
  };
  const handleDeleteRecord = async record => {
    if (!window.confirm('Delete this record?')) return;
    try {
      await axios.delete(`/api/records/${record.id}`);
      await refreshRecords();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete record');
    }
  };
  const handleRecordSubmit = async data => {
    try {
      if (recordFormData && recordFormData.id) {
        // Update
        await axios.put(`/api/records/${recordFormData.id}`, data);
      } else {
        // Create
        await axios.post('/api/records', data);
      }
      setRecordFormData(null);
      await refreshRecords();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save record');
    }
  };
  const handleRecordCancel = () => {
    setRecordFormData(null);
  };

  // User handlers
  const handleAddUser = () => {
    setUserFormData({});
  };
  const handleEditUser = user => {
    setUserFormData(user);
  };
  const handleDeleteUser = async user => {
    if (!window.confirm('Delete this user and their records?')) return;
    try {
      await axios.delete(`/api/users/${user.id}`);
      await refreshUsers();
      // If the deleted user had records assigned, refresh records list as well
      await refreshRecords();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
    }
  };
  const handleUserSubmit = async data => {
    try {
      if (userFormData && userFormData.id) {
        // Update
        await axios.put(`/api/users/${userFormData.id}`, data);
      } else {
        // Create
        await axios.post('/api/users', data);
      }
      setUserFormData(null);
      await refreshUsers();
      // When a new user is added, update the users list for the record form
      await refreshRecords();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save user');
    }
  };
  const handleUserCancel = () => {
    setUserFormData(null);
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '2rem auto' }}>
      <h2>Admin Panel</h2>
      {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          {/* Records management section */}
          <section style={{ marginBottom: '2rem' }}>
            <h3>Records</h3>
            <button onClick={handleAddRecord} style={{ marginBottom: '1rem' }}>
              Add Record
            </button>
            <table width="100%" border="1" cellPadding="8" cellSpacing="0">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Assigned To</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map(rec => (
                  <tr key={rec.id}>
                    <td>{rec.id}</td>
                    <td>{rec.title}</td>
                    <td>{rec.description}</td>
                    <td>{rec.username}</td>
                    <td>
                      <button onClick={() => handleEditRecord(rec)} style={{ marginRight: '0.5rem' }}>
                        Edit
                      </button>
                      <button onClick={() => handleDeleteRecord(rec)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {records.length === 0 && (
                  <tr>
                    <td colSpan="5">No records available.</td>
                  </tr>
                )}
              </tbody>
            </table>
            {recordFormData !== null && (
              <RecordForm
                users={users}
                initialData={recordFormData.id ? recordFormData : null}
                onSubmit={handleRecordSubmit}
                onCancel={handleRecordCancel}
              />
            )}
          </section>
          {/* Users management section */}
          <section>
            <h3>Users</h3>
            <button onClick={handleAddUser} style={{ marginBottom: '1rem' }}>
              Add User
            </button>
            <table width="100%" border="1" cellPadding="8" cellSpacing="0">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.username}</td>
                    <td>{u.role}</td>
                    <td>
                      <button onClick={() => handleEditUser(u)} style={{ marginRight: '0.5rem' }}>
                        Edit
                      </button>
                      {/* Prevent deleting self by disabling button */}
                      <button onClick={() => handleDeleteUser(u)} disabled={u.id === 1}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan="4">No users available.</td>
                  </tr>
                )}
              </tbody>
            </table>
            {userFormData !== null && (
              <UserForm
                initialData={userFormData.id ? userFormData : null}
                onSubmit={handleUserSubmit}
                onCancel={handleUserCancel}
              />
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default AdminPanel;