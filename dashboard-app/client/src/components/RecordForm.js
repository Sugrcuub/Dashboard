import React, { useEffect, useState } from 'react';

/**
 * Form component for creating or editing a record.  It accepts a list of users
 * to populate the assignee dropdown.  When editing, the `initialData` prop
 * contains the record fields.  On submission the collected data is passed
 * to the provided onSubmit callback.
 */
const RecordForm = ({ users, initialData, onSubmit, onCancel }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [userId, setUserId] = useState('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setUserId(String(initialData.user_id));
    } else {
      setTitle('');
      setDescription('');
      setUserId(users.length > 0 ? String(users[0].id) : '');
    }
  }, [initialData, users]);

  const handleSubmit = e => {
    e.preventDefault();
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      user_id: parseInt(userId, 10)
    });
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: '1rem', marginTop: '1rem' }}>
      <h3>{initialData ? 'Edit Record' : 'Add Record'}</h3>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '0.5rem' }}>
          <label htmlFor="title">Title:</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <div style={{ marginBottom: '0.5rem' }}>
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
            rows={4}
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <div style={{ marginBottom: '0.5rem' }}>
          <label htmlFor="user">Assigned User:</label>
          <select
            id="user"
            value={userId}
            onChange={e => setUserId(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          >
            {users.map(u => (
              <option key={u.id} value={u.id}>
                {u.username} ({u.role})
              </option>
            ))}
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

export default RecordForm;