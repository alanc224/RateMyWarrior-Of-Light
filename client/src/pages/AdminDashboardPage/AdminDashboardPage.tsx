import { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';

interface AdminStats {
  totalUsers: number;
  characterLookups: number;
  totalReviews: number;
  apiGateStatus: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  externalApiRemaining: number;
  cacheHitRate: number;
  openReports: number;
}

export default function AdminDashboardPage() {
  const { user: currentUser } = useUser();
  const { getToken } = useAuth();
  
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  const currentRole = (currentUser?.publicMetadata?.role as 'user' | 'mod' | 'admin') || 'user';

  useEffect(() => {
    async function fetchAdminStats() {
      if (currentRole !== 'admin') return;

      try {
        const token = await getToken();
        const response = await fetch('/api/admin/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          setStats(data);
        } else {
          setStats({
            totalUsers: 0,
            characterLookups: 0,
            totalReviews: 0,
            apiGateStatus: 'OFFLINE',
            externalApiRemaining: 0,
            cacheHitRate: 0.0,
            openReports: 0
          });
        }
      } catch (error) {
        console.error('System diagnostics extraction failed:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAdminStats();
  }, [getToken, currentRole]);

  if (currentRole !== 'admin') {
    return (
      <div className="page-content text-center" style={{ padding: '4rem 2rem' }}>
        <h2>🛑 System Access Denied</h2>
        <p className="muted-text">Root administrative clearance required to view telemetry channels.</p>
      </div>
    );
  }

  if (loading || !stats) {
    return <div className="page-content"><p className="muted-text">Loading...</p></div>;
  }

  return (
    <div className="page-content">
      <h2>System Administration</h2>
      <p className="muted-text">Global application controls and structural statistics.</p>

      <h3 style={{ fontSize: '1.1rem', color: '#fff', margin: '2rem 0 1rem 0' }}>Core Aggregates</h3>
      <div className="stats-grid">
        <div className="stat-card">
          <span>Total Database Users</span>
          <h3>{stats.totalUsers.toLocaleString()}</h3>
        </div>
        <div className="stat-card">
          <span>Character Lookups</span>
          <h3>{stats.characterLookups.toLocaleString()}</h3>
        </div>
        <div className="stat-card">
          <span>Total Reviews Written</span>
          <h3>{stats.totalReviews.toLocaleString()}</h3>
        </div>
      </div>

      <h3 style={{ fontSize: '1.1rem', color: '#fff', margin: '2rem 0 1rem 0' }}>System Health & Routing</h3>
      <div className="stats-grid">
        <div className="stat-card">
          <span>API Gate Status</span>
          <h3 className={`status-${stats.apiGateStatus.toLowerCase()}`}>{stats.apiGateStatus}</h3>
        </div>
        <div className="stat-card">
          <span>External API Pool (Left)</span>
          <h3>{stats.externalApiRemaining} hits</h3>
        </div>
        <div className="stat-card">
          <span>Lookup Cache Hit Rate</span>
          <h3>{stats.cacheHitRate}%</h3>
        </div>
      </div>

      {stats.openReports > 0 && (
        <div className="admin-alert-banner" style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#2d1a22', border: '1px solid #e94560', borderRadius: '6px' }}>
          <p style={{ margin: 0, color: '#fff' }}>
            ⚠️ <strong>Attention:</strong> There are currently <strong>{stats.openReports}</strong> unresolved content tickets waiting in the moderation workspace.
          </p>
        </div>
      )}
    </div>
  );
}