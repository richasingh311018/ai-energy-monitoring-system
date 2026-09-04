import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import Departments from './components/Departments';
import EnergyRecords from './components/EnergyRecords';
import Analysis from './components/Analysis';
import Prediction from './components/Prediction';
import Reports from './components/Reports';
import Login from './components/Login';

const TABS = [
  { key: 'dashboard', label: 'Dashboard', icon: 'DB' },
  { key: 'departments', label: 'Departments', icon: 'DP' },
  { key: 'energy', label: 'Energy records', icon: 'ER' },
  { key: 'analysis', label: 'Analytics', icon: 'AN' },
  { key: 'prediction', label: 'AI predictions', icon: 'AI' },
  { key: 'reports', label: 'Reports', icon: 'RP' }
];

function App() {
  const [user, setUser] = useState(() => {
    const storedUser = window.localStorage.getItem('energyiq-user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogin = (loggedInUser) => {
    window.localStorage.setItem('energyiq-user', JSON.stringify(loggedInUser));
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    window.localStorage.removeItem('energyiq-user');
    setUser(null);
  };

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

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">E</div>
          <div>
            <strong>EnergyIQ</strong>
            <span>Operations platform</span>
          </div>
        </div>
        <p className="nav-label">Workspace</p>
        <nav className="sidebar-nav" aria-label="Main navigation">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={activeTab === tab.key ? 'active nav-item' : 'nav-item'}
              onClick={() => setActiveTab(tab.key)}
            >
              <span className="nav-icon">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <span className="status-dot" />
          <span>System connected</span>
        </div>
      </aside>
      <div className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">ENERGY MANAGEMENT</p>
            <h1>{TABS.find((tab) => tab.key === activeTab)?.label}</h1>
          </div>
          <div className="topbar-meta">
            <span className="live-pill"><span className="status-dot" /> Live data</span>
            <div className="profile-menu">
              <button
                className="user-menu"
                onClick={() => setProfileOpen((isOpen) => !isOpen)}
                title="Open profile menu"
                aria-expanded={profileOpen}
              >
                <div className="avatar">AD</div>
                <span>{user.username}</span>
                <span className="profile-chevron">{profileOpen ? '▲' : '▼'}</span>
              </button>
              {profileOpen && (
                <div className="profile-dropdown">
                  <p className="profile-title">My profile</p>
                  <div className="profile-summary">
                    <div className="avatar">AD</div>
                    <div>
                      <strong>Administrator</strong>
                      <span>EnergyIQ user</span>
                    </div>
                  </div>
                  <div className="profile-divider" />
                  <dl className="profile-details">
                    <div>
                      <dt>Username</dt>
                      <dd>{user.username}</dd>
                    </div>
                    <div>
                      <dt>Role</dt>
                      <dd>System administrator</dd>
                    </div>
                    <div>
                      <dt>Access</dt>
                      <dd>All refinery areas</dd>
                    </div>
                  </dl>
                  <div className="profile-divider" />
                  <button className="sign-out-button" onClick={handleLogout}>
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <main>{renderContent()}</main>
      </div>
    </div>
  );
}

export default App;
