// src/components/Departments.js
import React, { useEffect, useState } from 'react';
import { getDepartments, addDepartment, updateDepartment, deleteDepartment } from '../api';

function Departments() {
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({ departmentId: '', departmentName: '', location: '' });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      const res = await getDepartments();
      setDepartments(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({ departmentId: '', departmentName: '', location: '' });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      if (editingId) {
        await updateDepartment(editingId, { departmentName: form.departmentName, location: form.location });
        setSuccess('Department updated successfully');
      } else {
        await addDepartment(form);
        setSuccess('Department added successfully');
      }
      resetForm();
      loadDepartments();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleEdit = (dept) => {
    setForm({ departmentId: dept.departmentId, departmentName: dept.departmentName, location: dept.location });
    setEditingId(dept.departmentId);
  };

  const handleDelete = async (departmentId) => {
    if (!window.confirm(`Delete department ${departmentId}?`)) return;
    setError('');
    setSuccess('');
    try {
      await deleteDepartment(departmentId);
      setSuccess('Department deleted successfully');
      loadDepartments();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  return (
    <div>
      <h1>Department Management</h1>

      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}

      <div className="card">
        <h3>{editingId ? `Edit Department: ${editingId}` : 'Add New Department'}</h3>
        <form className="inline-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="departmentId"
            placeholder="Department ID (e.g., D001)"
            value={form.departmentId}
            onChange={handleChange}
            disabled={!!editingId}
            required
          />
          <input
            type="text"
            name="departmentName"
            placeholder="Department Name"
            value={form.departmentName}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="location"
            placeholder="Location"
            value={form.location}
            onChange={handleChange}
            required
          />
          <button type="submit">{editingId ? 'Update' : 'Add'}</button>
          {editingId && <button type="button" onClick={resetForm}>Cancel</button>}
        </form>
      </div>

      <div className="card">
        <h3>All Departments ({departments.length})</h3>
        <table>
          <thead>
            <tr>
              <th>Department ID</th>
              <th>Name</th>
              <th>Location</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {departments.map((dept) => (
              <tr key={dept.departmentId}>
                <td>{dept.departmentId}</td>
                <td>{dept.departmentName}</td>
                <td>{dept.location}</td>
                <td>
                  <button onClick={() => handleEdit(dept)}>Edit</button>{' '}
                  <button className="danger" onClick={() => handleDelete(dept.departmentId)}>Delete</button>
                </td>
              </tr>
            ))}
            {departments.length === 0 && (
              <tr><td colSpan="4">No departments found. Add one above.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Departments;
