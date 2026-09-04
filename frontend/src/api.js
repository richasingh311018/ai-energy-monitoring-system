// src/api.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Department Management Module
export const getDepartments = () => api.get('/departments');
export const getDepartment = (departmentId) => api.get(`/departments/${departmentId}`);
export const addDepartment = (data) => api.post('/departments', data);
export const updateDepartment = (departmentId, data) => api.put(`/departments/${departmentId}`, data);
export const deleteDepartment = (departmentId) => api.delete(`/departments/${departmentId}`);

// Energy Monitoring Module
export const getEnergyRecords = (params) => api.get('/energy', { params });
export const addEnergyRecord = (data) => api.post('/energy', data);
export const updateEnergyRecord = (energyId, data) => api.put(`/energy/${energyId}`, data);
export const deleteEnergyRecord = (energyId) => api.delete(`/energy/${energyId}`);

// Analysis Module
export const getConsumptionTrend = (params) => api.get('/analysis/trend', { params });
export const getDepartmentComparison = (params) => api.get('/analysis/department-comparison', { params });
export const getHighestConsumption = (params) => api.get('/analysis/highest-consumption', { params });
export const getSummary = () => api.get('/analysis/summary');

// AI Prediction Module
export const predictConsumption = (data) => api.post('/predict', data);
export const getPredictions = (params) => api.get('/predict', { params });

// Report Generation Module
export const getMonthlyReport = (params) => api.get('/reports/monthly', { params });
export const getDepartmentReport = (departmentId, params) => api.get(`/reports/department/${departmentId}`, { params });
export const getConsumptionSummaryReport = (params) => api.get('/reports/summary', { params });
export const getPredictionReport = () => api.get('/reports/predictions');

export default api;
