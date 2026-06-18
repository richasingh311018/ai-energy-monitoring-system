// src/components/EnergyRecords.js
import React, { useEffect, useState } from 'react';
import { getEnergyRecords, addEnergyRecord, deleteEnergyRecord, getDepartments } from '../api';

function EnergyRecords() {
  const [records, setRecords] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({ energyId: '', departmentId: '', energyConsumed: '', date: '' });
  const [filterDept, setFilterDept] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadDepartments();
    loadRecords();
  }, []);

  const loadDepartments = async () => {
    try {
      const res = await getDepartments();
      setDepartments(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const loadRecords = async (departmentId = '') => {
    try {
      const params = departmentId ? { departmentId } : {};
      const res = await getEnergyRecords(params);
      setRecords(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await addEnergyRecord({
        ...form,
        energyConsumed: parseFloat(form.energyConsumed)
      });
      setSuccess('Energy record added successfully');
      setForm({ energyId: '', departmentId: '', energyConsumed: '', date: '' });
      loadRecords(filterDept);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleDelete = async (energyId) => {
    if (!window.confirm(`Delete record ${energyId}?`)) return;
    setError('');
    setSuccess('');
    try {
      await deleteEnergyRecord(energyId);
      setSuccess('Record deleted successfully');
      loadRecords(filterDept);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleFilterChange = (e) => {
    const value = e.target.value;
    setFilterDept(value);
    loadRecords(value);
  };

  return (
    <div>
      <h1>Energy Monitoring</h1>

      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}

      <div className="card">
        <h3>Record Daily Energy Consumption</h3>
        <form className="inline-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="energyId"
            placeholder="Energy ID (e.g., E001)"
            value={form.energyId}
            onChange={handleChange}
            required
          />
          <select name="departmentId" value={form.departmentId} onChange={handleChange} required>
            <option value="">Select Department</option>
            {departments.map((d) => (
              <option key={d.departmentId} value={d.departmentId}>
                {d.departmentId} - {d.departmentName}
              </option>
            ))}
          </select>
          <input
            type="number"
            step="0.01"
            name="energyConsumed"
            placeholder="Energy Consumed (kWh)"
            value={form.energyConsumed}
            onChange={handleChange}
            required
          />
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
          />
          <button type="submit">Add Record</button>
        </form>
      </div>

      <div className="card">
        <h3>Energy Records</h3>
        <form className="inline-form">
          <select value={filterDept} onChange={handleFilterChange}>
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.departmentId} value={d.departmentId}>
                {d.departmentId} - {d.departmentName}
              </option>
            ))}
          </select>
        </form>

        <table>
          <thead>
            <tr>
              <th>Energy ID</th>
              <th>Department</th>
              <th>Consumed (kWh)</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.energyId}>
                <td>{r.energyId}</td>
                <td>{r.departmentId}</td>
                <td>{r.energyConsumed}</td>
                <td>{new Date(r.date).toLocaleDateString()}</td>
                <td>
                  <button className="danger" onClick={() => handleDelete(r.energyId)}>Delete</button>
                </td>
              </tr>
            ))}
            {records.length === 0 && (
              <tr><td colSpan="5">No energy records found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default EnergyRecords;
