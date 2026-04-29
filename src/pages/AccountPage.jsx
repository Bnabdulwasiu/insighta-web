import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';

function AccountPage({ user, onLogout }) {
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await client.post('/auth/web/logout');
    } catch (_) {
      // clear regardless
    }
    onLogout();
    navigate('/', { replace: true });
  };

  const initial = user?.username?.[0]?.toUpperCase() ?? '?';

  const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  return (
    <div className="page content">
      <h1 className="page-title">Account</h1>
      <p className="page-subtitle">Your profile and session information.</p>

      <div className="card" style={{ maxWidth: 680 }}>
        {/* User header */}
        <div className="account-header">
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt={user.username} className="account-avatar" />
          ) : (
            <div className="account-avatar-placeholder">{initial}</div>
          )}
          <div>
            <div className="account-name">{user?.username}</div>
            <div className="account-email">{user?.email ?? 'No email on record'}</div>
            <div style={{ marginTop: '0.5rem' }}>
              <span className={`badge ${user?.role === 'admin' ? 'admin' : ''}`}>
                {user?.role}
              </span>
            </div>
          </div>
        </div>

        <div className="divider" />

        {/* Fields */}
        <div className="account-grid">
          <div className="account-field">
            <label>Username</label>
            <div className="val">{user?.username ?? '—'}</div>
          </div>
          <div className="account-field">
            <label>Role</label>
            <div className="val" style={{ textTransform: 'capitalize' }}>{user?.role ?? '—'}</div>
          </div>
          <div className="account-field">
            <label>Email</label>
            <div className="val">{user?.email ?? '—'}</div>
          </div>
          <div className="account-field">
            <label>Last Login</label>
            <div className="val">{formatDate(user?.last_login_at)}</div>
          </div>
          <div className="account-field">
            <label>User ID</label>
            <div className="val" style={{ fontSize: '0.78rem', color: 'var(--text-2)', wordBreak: 'break-all' }}>
              {user?.id ?? '—'}
            </div>
          </div>
          <div className="account-field">
            <label>Auth Method</label>
            <div className="val">GitHub OAuth</div>
          </div>
        </div>

        <div className="divider" />

        {/* Admin section */}
        {user?.role === 'admin' && (
          <>
            <div style={{ marginBottom: '1rem' }}>
              <div className="section-title" style={{ marginBottom: '0.5rem' }}>
                🛡️ Admin Access
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-2)' }}>
                You have administrator privileges. You can create and delete profiles from the
                Profiles page.
              </p>
            </div>
            <div className="divider" />
          </>
        )}

        {/* Security note */}
        <div style={{ marginBottom: '1.5rem', fontSize: '0.825rem', color: 'var(--muted)', lineHeight: 1.7 }}>
          🔒 Your session is secured with HTTP-only cookies. Authentication tokens are never
          accessible to JavaScript and are automatically refreshed.
        </div>

        {/* Logout */}
        <button
          id="account-logout-btn"
          className="btn btn-danger"
          onClick={handleLogout}
          disabled={loggingOut}
        >
          {loggingOut ? 'Signing out…' : '← Sign out'}
        </button>
      </div>
    </div>
  );
}

export default AccountPage;
