import React from 'react';
import { useUser } from '@clerk/clerk-react';
import { Link, Navigate } from 'react-router-dom';
import Header from '../components/Header/Header'; 
import './DashboardLayout.css'; 

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoaded, isSignedIn } = useUser(); 

  if (!isLoaded) {
    return <div style={{ color: '#fff', padding: '2rem' }}>Loading profile...</div>;
  }

  if (!isSignedIn) {
    return <Navigate to="/" state={{ showLogin: true }} replace />;
  }

  const role = (user?.publicMetadata?.role as 'user' | 'mod' | 'admin') || 'user';

  return (
    <div className="dashboard-page-wrapper">
      <Header />

      <div className="dashboard-main-area">
        <aside className="dashboard-sidebar">
          <div className="profile-brief">
            <h3>{user?.username || 'Warrior of Light'}</h3>
            <span className={`role-badge ${role}`}>{role.toUpperCase()}</span>
          </div>
          
          <nav className="sidebar-nav">
            <Link to="/profile">My Profile</Link>
            
            {(role === 'mod' || role === 'admin') && (
              <Link to="/mod-panel">Moderator Tools</Link>
            )}
            
            {role === 'admin' && (
              <Link to="/admin-panel">Admin Dashboard</Link>
            )}
          </nav>
        </aside>

        <main className="dashboard-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;