// src/components/Dashboard.js
import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from 'recharts';
import {
  getSummary, getDepartmentComparison, getConsumptionTrend, getPredictions
} from '../api';

function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [comparison, setComparison] = useState([]);
  const [trend, setTrend] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [summaryRes, comparisonRes, trendRes, predictionsRes] = await Promise.all([
        getSummary(),
        getDepartmentComparison(),
        getConsumptionTrend({ period: 'monthly' }),
        getPredictions()
      ]);

      setSummary(summaryRes.data.data);
      setComparison(comparisonRes.data.data);

      const formattedTrend = trendRes.data.data.map((item) => ({
        label: `${item._id.month}/${item._id.year}`,
        totalConsumption: Math.round(item.totalConsumption * 100) / 100
      }));
      setTrend(formattedTrend);

      setPredictions(predictionsRes.data.data.slice(0, 5));
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  return (
    <div>
      <h1>Dashboard</h1>
      {error && <p className="error-message">{error}</p>}

      {summary && (
        <div className="stats-grid">
          <div className="stat-box">
            <div className="value">{summary.totalConsumption?.toFixed(2)}</div>
            <div className="label">Total Energy Consumption (kWh)</div>
          </div>
          <div className="stat-box">
            <div className="value">{summary.departmentCount}</div>
            <div className="label">Departments</div>
          </div>
          <div className="stat-box">
            <div className="value">{summary.recordCount}</div>
            <div className="label">Total Records</div>
          </div>
          <div className="stat-box">
            <div className="value">{summary.avgConsumption?.toFixed(2)}</div>
            <div className="label">Avg Consumption / Record (kWh)</div>
          </div>
        </div>
      )}

      <div className="card">
        <h3>Department-wise Energy Usage</h3>
        {comparison.length === 0 ? (
          <p>No data available yet. Add departments and energy records to see charts.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={comparison}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="departmentName" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="totalConsumption" fill="#2563eb" name="Total Consumption (kWh)" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="card">
        <h3>Monthly Energy Trend (All Departments)</h3>
        {trend.length === 0 ? (
          <p>No trend data available yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="totalConsumption" stroke="#16a34a" name="Total Consumption (kWh)" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="card">
        <h3>Recent Predictions</h3>
        {predictions.length === 0 ? (
          <p>No predictions generated yet. Go to "AI Prediction" tab to generate one.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Department</th>
                <th>Predicted Consumption (kWh)</th>
                <th>Prediction Date</th>
                <th>Generated At</th>
              </tr>
            </thead>
            <tbody>
              {predictions.map((p) => (
                <tr key={p.predictionId}>
                  <td>{p.departmentId}</td>
                  <td>{p.predictedConsumption}</td>
                  <td>{new Date(p.predictionDate).toLocaleDateString()}</td>
                  <td>{new Date(p.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
