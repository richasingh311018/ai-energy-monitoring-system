// src/components/Reports.js
import React, { useEffect, useState } from 'react';
import {
  getMonthlyReport, getDepartmentReport, getConsumptionSummaryReport,
  getPredictionReport, getDepartments
} from '../api';

function Reports() {
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState('');

  // Monthly report state
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [monthlyData, setMonthlyData] = useState(null);

  // Department report state
  const [departmentId, setDepartmentId] = useState('');
  const [departmentReport, setDepartmentReport] = useState(null);

  // Summary report
  const [summaryData, setSummaryData] = useState(null);

  // Prediction report
  const [predictionReport, setPredictionReport] = useState(null);

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

  const handleMonthlyReport = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await getMonthlyReport({ year, month });
      setMonthlyData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleDepartmentReport = async (e) => {
    e.preventDefault();
    setError('');
    if (!departmentId) {
      setError('Please select a department');
      return;
    }
    try {
      const res = await getDepartmentReport(departmentId);
      setDepartmentReport(res.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleSummaryReport = async () => {
    setError('');
    try {
      const res = await getConsumptionSummaryReport();
      setSummaryData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const handlePredictionReport = async () => {
    setError('');
    try {
      const res = await getPredictionReport();
      setPredictionReport(res.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  return (
    <div>
      <h1>Report Generation</h1>
      {error && <p className="error-message">{error}</p>}

      {/* Monthly Report */}
      <div className="card">
        <h3>Monthly Report</h3>
        <form className="inline-form" onSubmit={handleMonthlyReport}>
          <input type="number" value={year} onChange={(e) => setYear(e.target.value)} placeholder="Year" />
          <input type="number" min="1" max="12" value={month} onChange={(e) => setMonth(e.target.value)} placeholder="Month" />
          <button type="submit">Generate</button>
        </form>

        {monthlyData && (
          <table>
            <thead>
              <tr>
                <th>Department</th>
                <th>Location</th>
                <th>Total (kWh)</th>
                <th>Average (kWh)</th>
                <th>Records</th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.data.map((d) => (
                <tr key={d.departmentId}>
                  <td>{d.departmentName}</td>
                  <td>{d.location}</td>
                  <td>{d.totalConsumption}</td>
                  <td>{d.avgConsumption}</td>
                  <td>{d.recordCount}</td>
                </tr>
              ))}
              {monthlyData.data.length === 0 && (
                <tr><td colSpan="5">No data for this period.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Department Report */}
      <div className="card">
        <h3>Department Report</h3>
        <form className="inline-form" onSubmit={handleDepartmentReport}>
          <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
            <option value="">Select Department</option>
            {departments.map((d) => (
              <option key={d.departmentId} value={d.departmentId}>
                {d.departmentId} - {d.departmentName}
              </option>
            ))}
          </select>
          <button type="submit">Generate</button>
        </form>

        {departmentReport && (
          <div>
            <p><strong>Department:</strong> {departmentReport.department.departmentName} ({departmentReport.department.departmentId})</p>
            <p><strong>Total Consumption:</strong> {departmentReport.summary.totalConsumption} kWh</p>
            <p><strong>Average Consumption:</strong> {departmentReport.summary.avgConsumption} kWh</p>
            <p><strong>Total Records:</strong> {departmentReport.summary.recordCount}</p>
            {departmentReport.summary.highest && (
              <p><strong>Highest:</strong> {departmentReport.summary.highest.value} kWh on {new Date(departmentReport.summary.highest.date).toLocaleDateString()}</p>
            )}
            {departmentReport.summary.lowest && (
              <p><strong>Lowest:</strong> {departmentReport.summary.lowest.value} kWh on {new Date(departmentReport.summary.lowest.date).toLocaleDateString()}</p>
            )}
          </div>
        )}
      </div>

      {/* Consumption Summary Report */}
      <div className="card">
        <h3>Consumption Summary Report (All Departments)</h3>
        <button onClick={handleSummaryReport}>Generate</button>

        {summaryData && (
          <div>
            <p><strong>Grand Total:</strong> {summaryData.grandTotal} kWh</p>
            <table>
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Total (kWh)</th>
                  <th>Average (kWh)</th>
                  <th>Records</th>
                  <th>% of Total</th>
                </tr>
              </thead>
              <tbody>
                {summaryData.data.map((d) => (
                  <tr key={d.departmentId}>
                    <td>{d.departmentName}</td>
                    <td>{d.totalConsumption}</td>
                    <td>{d.avgConsumption}</td>
                    <td>{d.recordCount}</td>
                    <td>{d.percentageOfTotal}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Prediction Report */}
      <div className="card">
        <h3>Prediction Report</h3>
        <button onClick={handlePredictionReport}>Generate</button>

        {predictionReport && (
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
              {predictionReport.data.map((d) => (
                <tr key={d.departmentId}>
                  <td>{d.departmentName} ({d.departmentId})</td>
                  <td>{d.latestPrediction ? d.latestPrediction.predictedConsumption : '-'}</td>
                  <td>{d.latestPrediction ? new Date(d.latestPrediction.predictionDate).toLocaleDateString() : '-'}</td>
                  <td>{d.latestPrediction ? new Date(d.latestPrediction.generatedAt).toLocaleString() : 'No prediction yet'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Reports;
