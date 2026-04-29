import { NavLink, useNavigate } from 'react-router-dom';
import client from '../api/client';

function Header({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await client.post('/auth/web/logout');
    } catch (_) {
      // clear state regardless
    }
    onLogout();
    navigate('/', { replace: true });
  };

  const initial = user?.username?.[0]?.toUpperCase() ?? '?';

  return (
    <header className="header">
      <span className="header-brand">⚡ Insighta</span>

      <nav className="header-nav">
        <NavLink
          to="/dashboard"
          className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/profiles"
          className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
        >
          Profiles
        </NavLink>
        <NavLink
          to="/search"
          className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
        >
          Search
        </NavLink>
        <NavLink
          to="/account"
          className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
        >
          Account
        </NavLink>
      </nav>

      <div className="header-right">
        {user && (
          <div className="header-user">
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.username}
                className="header-avatar"
              />
            ) : (
              <div className="header-avatar-placeholder">{initial}</div>
            )}
            <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{user.username}</span>
            <span className={`badge ${user.role === 'admin' ? 'admin' : ''}`}>{user.role}</span>
          </div>
        )}
        <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}

export default Header;
