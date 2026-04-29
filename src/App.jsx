import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import client from './api/client';
import Header from './components/Header';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProfilesPage from './pages/ProfilesPage';
import ProfileDetailPage from './pages/ProfileDetailPage';
import SearchPage from './pages/SearchPage';
import AccountPage from './pages/AccountPage';
import './index.css';

function App() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);

  // ── Check auth on mount (cookie only) ───────────────────────────────────────
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await client.get('/auth/web/me');
        setUser(res.data.data);
        setSessionExpired(false);
      } catch {
        setUser(null);
      } finally {
        setAuthChecked(true);
      }
    };
    checkAuth();
  }, []);

  // ── Listen for session expiry (from client.js interceptor) ───────────────────
  useEffect(() => {
    const handle = () => {
      setUser(null);
      setSessionExpired(true);
    };
    window.addEventListener('auth:expired', handle);
    return () => window.removeEventListener('auth:expired', handle);
  }, []);

  const handleLogout = () => {
    setUser(null);
    setSessionExpired(false);
  };

  // Prevent redirect flicker while auth is resolving
  if (!authChecked) return null;

  const isLoggedIn = !!user;

  return (
    <BrowserRouter>
      {isLoggedIn && <Header user={user} onLogout={handleLogout} />}

      {sessionExpired && (
        <div className="alert alert-warn session-banner">
          ⚠️ Your session expired — please log in again.
        </div>
      )}

      <Routes>
        {/* Login */}
        <Route
          path="/"
          element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <LoginPage />}
        />

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={isLoggedIn ? <DashboardPage user={user} /> : <Navigate to="/" replace />}
        />

        {/* Profiles list */}
        <Route
          path="/profiles"
          element={isLoggedIn ? <ProfilesPage user={user} /> : <Navigate to="/" replace />}
        />

        {/* Profile detail */}
        <Route
          path="/profiles/:id"
          element={isLoggedIn ? <ProfileDetailPage user={user} /> : <Navigate to="/" replace />}
        />

        {/* Search */}
        <Route
          path="/search"
          element={isLoggedIn ? <SearchPage /> : <Navigate to="/" replace />}
        />

        {/* Account */}
        <Route
          path="/account"
          element={isLoggedIn ? <AccountPage user={user} onLogout={handleLogout} /> : <Navigate to="/" replace />}
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to={isLoggedIn ? '/dashboard' : '/'} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
