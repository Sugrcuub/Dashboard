import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

/**
 * Displays a list of records accessible to the logged in user.  Supports simple
 * searching and client‑side sorting.  Admins see all records while regular
 * users only see their own.  A link is provided for admins to access the
 * admin panel.
 */
const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('id');
  const [sortAsc, setSortAsc] = useState(true);

  useEffect(() => {
    const fetchRecords = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get('/api/records');
        setRecords(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load records');
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, []);

  const handleSort = field => {
    if (field === sortField) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const filtered = records.filter(rec => {
    const s = searchTerm.toLowerCase();
    return (
      rec.title.toLowerCase().includes(s) ||
      rec.description.toLowerCase().includes(s) ||
      (rec.username && rec.username.toLowerCase().includes(s))
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];
    // Convert strings to lowercase for case‑insensitive sorting
    if (typeof aVal === 'string') aVal = aVal.toLowerCase();
    if (typeof bVal === 'string') bVal = bVal.toLowerCase();
    if (aVal < bVal) return sortAsc ? -1 : 1;
    if (aVal > bVal) return sortAsc ? 1 : -1;
    return 0;
  });

  return (
    <div style={{ maxWidth: '900px', margin: '2rem auto' }}>
      <h2>Dashboard</h2>
      {user && user.role === 'admin' && (
        <button onClick={() => navigate('/admin')} style={{ marginBottom: '1rem' }}>
          Go to Admin Panel
        </button>
      )}
      {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '0.5rem' }}
            />
          </div>
          <table width="100%" border="1" cellPadding="8" cellSpacing="0">
            <thead>
              <tr>
                <th onClick={() => handleSort('id')} style={{ cursor: 'pointer' }}>
                  ID {sortField === 'id' ? (sortAsc ? '▲' : '▼') : ''}
                </th>
                <th onClick={() => handleSort('title')} style={{ cursor: 'pointer' }}>
                  Title {sortField === 'title' ? (sortAsc ? '▲' : '▼') : ''}
                </th>
                <th onClick={() => handleSort('description')} style={{ cursor: 'pointer' }}>
                  Description {sortField === 'description' ? (sortAsc ? '▲' : '▼') : ''}
                </th>
                <th onClick={() => handleSort('username')} style={{ cursor: 'pointer' }}>
                  Assigned To {sortField === 'username' ? (sortAsc ? '▲' : '▼') : ''}
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(rec => (
                <tr key={rec.id}>
                  <td>{rec.id}</td>
                  <td>{rec.title}</td>
                  <td>{rec.description}</td>
                  <td>{rec.username}</td>
                </tr>
              ))}
              {sorted.length === 0 && (
                <tr>
                  <td colSpan="4">No records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default Dashboard;