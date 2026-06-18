// src/App.js
import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import Departments from './components/Departments';
import EnergyRecords from './components/EnergyRecords';
import Analysis from './components/Analysis';
import Prediction from './components/Prediction';
import Reports from './components/Reports';

const TABS = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'departments', label: 'Departments' },
  { key: 'energy', label: 'Energy Records' },
  { key: 'analysis', label: 'Analysis' },
  { key: 'prediction', label: 'AI Prediction' },
  { key: 'reports', label: 'Reports' }
];

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'departments':
        return <Departments />;
      case 'energy':
        return <EnergyRecords />;
      case 'analysis':
        return <Analysis />;
      case 'prediction':
        return <Prediction />;
      case 'reports':
        return <Reports />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app-container">
      <div className="sidebar">
        <h2>⚡ Energy Monitor</h2>
        <ul>
          {TABS.map((tab) => (
            <li
              key={tab.key}
              className={activeTab === tab.key ? 'active' : ''}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </li>
          ))}
        </ul>
      </div>
      <div className="main-content">
        {renderContent()}
      </div>
    </div>
  );
}

export default App;
