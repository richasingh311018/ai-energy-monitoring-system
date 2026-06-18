// src/components/Analysis.js
import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from 'recharts';
import { getConsumptionTrend, getDepartmentComparison, getHighestConsumption, getDepartments } from '../api';

function formatGroupLabel(id, period) {
  if (period === 'monthly') return `${id.month}/${id.year}`;
  if (period === 'weekly') return `W${id.week}-${id.year}`;
  return `${id.day}/${id.month}/${id.year}`;
}

function Analysis() {
  const [period, setPeriod] = useState('daily');
  const [departmentId, setDepartmentId] = useState('');
  const [departments, setDepartments] = useState([]);
  const [trend, setTrend] = useState([]);
  const [comparison, setComparison] = useState([]);
  const [highest, setHighest] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDepartments();
    loadComparison();
    loadHighest();
  }, []);

  useEffect(() => {
    loadTrend();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, departmentId]);

  const loadDepartments = async () => {
    try {
      const res = await getDepartments();
      setDepartments(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const loadTrend = async () => {
    try {
      const params = { period };
      if (departmentId) params.departmentId = departmentId;
      const res = await getConsumptionTrend(params);
      const formatted = res.data.data.map((item) => ({
        label: formatGroupLabel(item._id, period),
        totalConsumption: Math.round(item.totalConsumption * 100) / 100,
        avgConsumption: Math.round(item.avgConsumption * 100) / 100
      }));
      setTrend(formatted);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const loadComparison = async () => {
    try {
      const res = await getDepartmentComparison();
      setComparison(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const loadHighest = async () => {
    try {
      const res = await getHighestConsumption({ limit: 3 });
      setHighest(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  return (
    <div>
      <h1>Consumption Analysis</h1>
      {error && <p className="error-message">{error}</p>}

      <div className="card">
        <h3>Consumption Trend</h3>
        <form className="inline-form">
          <select value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
          <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.departmentId} value={d.departmentId}>
                {d.departmentId} - {d.departmentName}
              </option>
            ))}
          </select>
        </form>

        {trend.length === 0 ? (
          <p>No data available for this selection.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="totalConsumption" stroke="#2563eb" name="Total (kWh)" />
              <Line type="monotone" dataKey="avgConsumption" stroke="#f59e0b" name="Average (kWh)" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="card">
        <h3>Department-wise Comparison</h3>
        {comparison.length === 0 ? (
          <p>No data available.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={comparison}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="departmentName" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="totalConsumption" fill="#2563eb" name="Total Consumption (kWh)" />
              <Bar dataKey="avgConsumption" fill="#16a34a" name="Avg Consumption (kWh)" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="card">
        <h3>Highest Energy Consuming Departments</h3>
        {highest.length === 0 ? (
          <p>No data available.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Department</th>
                <th>Location</th>
                <th>Total Consumption (kWh)</th>
              </tr>
            </thead>
            <tbody>
              {highest.map((h, idx) => (
                <tr key={h.departmentId}>
                  <td>{idx + 1}</td>
                  <td>{h.departmentName} ({h.departmentId})</td>
                  <td>{h.location}</td>
                  <td>{h.totalConsumption}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Analysis;
