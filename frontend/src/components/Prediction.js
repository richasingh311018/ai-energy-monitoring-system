// src/components/Prediction.js
import React, { useEffect, useState } from 'react';
import { getDepartments, predictConsumption, getPredictions } from '../api';

function Prediction() {
  const [departments, setDepartments] = useState([]);
  const [departmentId, setDepartmentId] = useState('');
  const [daysAhead, setDaysAhead] = useState(1);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

  const loadHistory = async (deptId) => {
    try {
      const res = await getPredictions({ departmentId: deptId });
      setHistory(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    if (!departmentId) {
      setError('Please select a department');
      return;
    }
    setLoading(true);
    try {
      const res = await predictConsumption({ departmentId, daysAhead: parseInt(daysAhead, 10) });
      setResult(res.data.data);
      loadHistory(departmentId);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>AI Prediction Module</h1>
      {error && <p className="error-message">{error}</p>}

      <div className="card">
        <h3>Predict Future Energy Consumption</h3>
        <p>
          Uses a Linear Regression model trained on the department's historical energy
          consumption records to forecast future usage.
        </p>
        <form className="inline-form" onSubmit={handlePredict}>
          <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} required>
            <option value="">Select Department</option>
            {departments.map((d) => (
              <option key={d.departmentId} value={d.departmentId}>
                {d.departmentId} - {d.departmentName}
              </option>
            ))}
          </select>
          <input
            type="number"
            min="1"
            value={daysAhead}
            onChange={(e) => setDaysAhead(e.target.value)}
            placeholder="Days Ahead"
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Predicting...' : 'Run Prediction'}
          </button>
        </form>

        {result && (
          <div className="card" style={{ background: '#f0f9ff' }}>
            <h4>Prediction Result</h4>
            <p><strong>Department:</strong> {result.departmentName} ({result.departmentId})</p>
            <p><strong>Predicted Consumption:</strong> {result.predictedConsumption} kWh</p>
            <p><strong>Prediction Date:</strong> {new Date(result.predictionDate).toLocaleDateString()}</p>
            <p><strong>Trained on:</strong> {result.trainedOnRecords} historical records</p>
            <p>
              <strong>Model:</strong> y = {result.model.slope.toFixed(4)}x + {result.model.intercept.toFixed(4)}
            </p>
          </div>
        )}
      </div>

      <div className="card">
        <h3>Prediction History</h3>
        {history.length === 0 ? (
          <p>Select a department and run a prediction to see history here.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Prediction ID</th>
                <th>Predicted Consumption (kWh)</th>
                <th>Prediction Date</th>
                <th>Generated At</th>
              </tr>
            </thead>
            <tbody>
              {history.map((p) => (
                <tr key={p.predictionId}>
                  <td>{p.predictionId}</td>
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

export default Prediction;
