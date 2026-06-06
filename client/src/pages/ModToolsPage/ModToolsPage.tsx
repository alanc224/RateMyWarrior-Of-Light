import { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';

interface Report {
  _id: string;
  characterName: string;
  server: string;
  reason: string;
  reviewId: string;
  reviewContent: string;
}

interface UserAccount {
  id: string; 
  username: string;
  email: string;
  role: 'user' | 'mod' | 'admin';
  status: 'active' | 'banned';
}

export default function ModToolsPage() {
  const { user: currentUser } = useUser();
  const { getToken } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'reports' | 'users'>('reports');
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const currentRole = (currentUser?.publicMetadata?.role as 'user' | 'mod' | 'admin') || 'user';
  const BASE_URL = 'https://ratemywarrioroflight-api.onrender.com';

    useEffect(() => {
        async function loadModerationData() {
        if (currentRole === 'user') return;

        try {
            const token = await getToken({ template: 'api-template' });
            
            const [usersRes, reportsRes] = await Promise.all([
            fetch(`${BASE_URL}/api/mod/users`, { 
                headers: { Authorization: `Bearer ${token}` } 
            }),
            fetch(`${BASE_URL}/api/mod/reports`, { 
                headers: { Authorization: `Bearer ${token}` } 
            })
            ]);

            if (usersRes.ok) {
                const data = await usersRes.json();
                console.log("Users received from API:", data); 
                setUsers(data);
                
            } else {
                console.error("Users API failed with status:", usersRes.status);
            }

            if (reportsRes.ok) {
                setReports(await reportsRes.json());
            } else {
                console.error("Reports API failed with status:", reportsRes.status);
            }

        } catch (err) {
            console.error('Failed to capture administration feeds:', err);
        } finally {
            setLoading(false);
        }
        }

        loadModerationData();
    }, [getToken, currentRole]);

  if (currentRole === 'user') {
    return (
      <div className="page-content text-center" style={{ padding: '4rem 2rem' }}>
        <h2>🛑 Access Denied</h2>
        <p className="muted-text">This grid terminal is locked to authorized system staff elements only.</p>
      </div>
    );
  }

  const handleToggleBan = async (userId: string, currentStatus: string) => {
    const targetStatus = currentStatus === 'active' ? 'banned' : 'active';
    try {
      const token = await getToken({ template: 'api-template' });
      const res = await fetch(`${BASE_URL}/api/mod/users/${userId}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ status: targetStatus })
      });

      if (res.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, status: targetStatus } : u));
      }
    } catch (err) {
      console.error('Ban action transmission failure:', err);
    }
  };

  const handleChangeRole = async (userId: string, targetCurrentRole: string) => {
    const newRole = targetCurrentRole === 'mod' ? 'user' : 'mod';
    try {
      const token = await getToken({ template: 'api-template' });
      const res = await fetch(`${BASE_URL}/api/mod/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ role: newRole })
      });

      if (res.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      }
    } catch (err) {
      console.error('Role alteration transmission failure:', err);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Permanently erase this account? This cannot be undone.")) return;
    try {
      const token = await getToken({ template: 'api-template' });
      const res = await fetch(`${BASE_URL}/api/mod/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        setUsers(users.filter(u => u.id !== userId));
      }
    } catch (err) {
      console.error('Account erasure failure:', err);
    }
  };

  const handleReportAction = async (reportId: string, action: 'keep' | 'delete', reviewId: string) => {
    try {
      const token = await getToken({ template: 'api-template' });
      const res = await fetch(`${BASE_URL}/api/mod/reports/${reportId}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ action, reviewId })
      });

      if (res.ok) {
        setReports(reports.filter(r => r._id !== reportId));
      }
    } catch (err) {
      console.error('Report execution request dropped:', err);
    }
  };

  return (
    <div className="page-content">
      <h2>Moderation Action Center</h2>
      <p className="muted-text">Logged in as: <strong style={{color: '#e94560'}}>{currentRole.toUpperCase()}</strong></p>

      <div className="mod-tabs">
        <button className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>
          Pending Reports ({reports.length})
        </button>
        <button className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
          User Account Directory ({users.length})
        </button>
      </div>

      {loading ? (
        <p className="muted-text" style={{ padding: '2rem 0' }}>Loading...</p>
      ) : (
        <>
          {activeTab === 'reports' && (
            <div className="mod-queue-container">
              <h3>Pending Content Reports</h3>
              {reports.length === 0 ? (
                <p className="muted-text" style={{ fontStyle: 'italic' }}>No reports found.</p>
              ) : (
                <table className="mod-table">
                  <thead>
                    <tr>
                      <th>Target Character</th>
                      <th>Server</th>
                      <th>Review</th>
                      <th>Reason</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((report) => (
                        <tr key={report._id}>
                        <td><strong>{report.characterName}</strong></td>
                        <td><span className="review-world-tag">{report.server}</span></td>
                        {/* New Column: Display the content here */}
                        <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {report.reviewContent}
                        </td>
                        <td>{report.reason}</td>
                        <td>
                            <button 
                            className="btn-mod approve" 
                            onClick={() => handleReportAction(report._id, 'keep', report.reviewId)}
                            style={{ backgroundColor: '#2f855a', color: '#fff', marginRight: '0.5rem' }}
                            >
                            Keep
                            </button>
                            <button 
                            className="btn-mod delete"
                            onClick={() => handleReportAction(report._id, 'delete', report.reviewId)}
                            >
                            Delete Review
                            </button>
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === 'users' && (
            <div className="mod-queue-container">
              <h3>Registered Users</h3>
              <table className="mod-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Administrative Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((account) => {
                    const isTargetAdmin = account.role === 'admin';
                    const isTargetStaff = account.role === 'mod' || account.role === 'admin';
                    const isSelf = account.id === currentUser?.id;
                    const canCurrentRoleBanTarget = currentRole === 'admin' 
                      ? !isTargetAdmin 
                      : (currentRole === 'mod' && !isTargetStaff);

                    const canCurrentRoleDeleteTarget = currentRole === 'admin' && !isTargetAdmin && !isSelf;

                    return (
                        <tr key={account.id}>
                            <td><strong>{account.username}</strong></td>
                            <td>
                            <span className={`role-badge ${account.role}`}>
                                {(account.role || 'user').toUpperCase()}
                            </span>
                            </td>
                            
                            <td>
                            <span className={`status-tag ${account.status}`}>
                                {(account.status || 'active').toUpperCase()}
                            </span>
                            </td>

                            <td>
                            {currentRole === 'admin' && !isTargetAdmin && account.status === 'active' && (
                                <button 
                                className="btn-mod role-toggle" 
                                onClick={() => handleChangeRole(account.id, account.role)}
                                style={{ backgroundColor: '#4a5568', color: '#fff', marginRight: '0.5rem' }}
                                >
                                {account.role === 'mod' ? '❌ Demote to User' : '👑 Promote to Mod'}
                                </button>
                            )}

                            {canCurrentRoleBanTarget && !isSelf ? (
                                <button 
                                className={`btn-mod ${account.status === 'active' ? 'ban' : 'unban'}`}
                                onClick={() => handleToggleBan(account.id, account.status)}
                                >
                                {account.status === 'active' ? 'Ban' : 'Unban'}
                                </button>
                            ) : (
                                <span style={{ color: '#4a5568', fontSize: '0.85rem', fontStyle: 'italic', padding: '0 0.5rem' }}>
                                {isTargetAdmin ? 'Protected (Admin)' : 'Locked'}
                                </span>
                            )}
                            
                            {canCurrentRoleDeleteTarget && (
                                <button className="btn-mod delete" onClick={() => handleDeleteUser(account.id)} style={{ marginLeft: '0.5rem' }}>
                                Delete
                                </button>
                            )}
                            </td>
                        </tr>
                        );
                    })}
                    </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}