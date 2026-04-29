import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';

function StatCard({ icon, value, label, loading }) {
  return (
    <div className="stat-card">
      <span className="stat-icon">{icon}</span>
      {loading ? (
        <div style={{ height: '2rem', display: 'flex', alignItems: 'center' }}>
          <span className="spinner spinner-sm" />
        </div>
      ) : (
        <div className="stat-value">{value ?? '—'}</div>
      )}
      <div className="stat-label">{label}</div>
    </div>
  );
}

function DashboardPage({ user }) {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      setError('');
      try {
        // Fetch aggregate data in parallel
        const [allRes, maleRes, femaleRes, recentRes] = await Promise.all([
          client.get('/api/profiles', { params: { limit: 1, page: 1 } }),
          client.get('/api/profiles', { params: { limit: 1, page: 1, gender: 'male' } }),
          client.get('/api/profiles', { params: { limit: 1, page: 1, gender: 'female' } }),
          client.get('/api/profiles', { params: { limit: 5, page: 1, sort_by: 'created_at', order: 'desc' } }),
        ]);

        const total = allRes.data.total;
        const maleCount = maleRes.data.total;
        const femaleCount = femaleRes.data.total;

        // Age group counts
        const [youngRes, adultRes, middleRes, seniorRes] = await Promise.all([
          client.get('/api/profiles', { params: { limit: 1, page: 1, age_group: 'young' } }),
          client.get('/api/profiles', { params: { limit: 1, page: 1, age_group: 'adult' } }),
          client.get('/api/profiles', { params: { limit: 1, page: 1, age_group: 'middle-aged' } }),
          client.get('/api/profiles', { params: { limit: 1, page: 1, age_group: 'senior' } }),
        ]);

        setStats({
          total,
          maleCount,
          femaleCount,
          malePct: total ? Math.round((maleCount / total) * 100) : 0,
          femalePct: total ? Math.round((femaleCount / total) * 100) : 0,
          ageGroups: {
            young: youngRes.data.total,
            adult: adultRes.data.total,
            'middle-aged': middleRes.data.total,
            senior: seniorRes.data.total,
          },
        });
        setRecent(recentRes.data.data);
      } catch {
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  return (
    <div className="page content">
      <h1 className="page-title">
        Welcome back, {user?.username} 👋
      </h1>
      <p className="page-subtitle">Here's a snapshot of your profile analytics.</p>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>{error}</div>
      )}

      {/* Stat Cards */}
      <div className="stat-grid">
        <StatCard icon="👥" value={stats?.total?.toLocaleString()} label="Total Profiles" loading={loading} />
        <StatCard icon="♂️" value={loading ? null : `${stats?.malePct ?? 0}%`} label="Male" loading={loading} />
        <StatCard icon="♀️" value={loading ? null : `${stats?.femalePct ?? 0}%`} label="Female" loading={loading} />
        <StatCard
          icon="📅"
          value={loading ? null : (() => {
            if (!stats?.ageGroups) return '—';
            const top = Object.entries(stats.ageGroups).sort((a, b) => b[1] - a[1])[0];
            return top ? top[0] : '—';
          })()}
          label="Top Age Group"
          loading={loading}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        {/* Gender breakdown */}
        <div className="card">
          <div className="section-title">Gender Distribution</div>
          {loading ? <span className="spinner" /> : (
            <div className="donut-row">
              <div className="donut-item">
                <div className="donut-pct" style={{ color: '#63a3ff' }}>{stats?.malePct ?? 0}%</div>
                <div className="donut-lbl">Male</div>
              </div>
              <div className="donut-item">
                <div className="donut-pct" style={{ color: '#ec6ab4' }}>{stats?.femalePct ?? 0}%</div>
                <div className="donut-lbl">Female</div>
              </div>
              <div className="donut-item">
                <div className="donut-pct" style={{ color: 'var(--text-2)' }}>
                  {stats ? stats.total - stats.maleCount - stats.femaleCount : '—'}
                </div>
                <div className="donut-lbl">Other</div>
              </div>
            </div>
          )}
        </div>

        {/* Age group breakdown */}
        <div className="card">
          <div className="section-title">Age Groups</div>
          {loading ? <span className="spinner" /> : (
            <div className="donut-row">
              {stats?.ageGroups && Object.entries(stats.ageGroups).map(([group, count]) => (
                <div key={group} className="donut-item">
                  <div className="donut-pct" style={{ color: 'var(--primary)', fontSize: '1.1rem' }}>
                    {count.toLocaleString()}
                  </div>
                  <div className="donut-lbl" style={{ textTransform: 'capitalize' }}>{group}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent profiles */}
      <div className="card section-gap">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div className="section-title" style={{ margin: 0 }}>Recently Added</div>
          <Link to="/profiles" className="btn btn-ghost btn-sm">View all →</Link>
        </div>
        {loading && <span className="spinner" />}
        {!loading && recent.length === 0 && (
          <div className="empty">No profiles yet.</div>
        )}
        {!loading && recent.map((p) => (
          <Link
            key={p.id}
            to={`/profiles/${p.id}`}
            className="recent-item"
            style={{ display: 'flex', textDecoration: 'none', color: 'inherit' }}
          >
            <div className="recent-initials">{p.name?.[0]}</div>
            <div className="recent-info">
              <div className="recent-name">{p.name}</div>
              <div className="recent-meta">
                <span className={`gender-badge gender-${p.gender}`}>{p.gender}</span>
                {' · '}age {p.age}{' · '}{p.country_name}
              </div>
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--muted)', flexShrink: 0 }}>
              {p.created_at ? new Date(p.created_at).toLocaleDateString() : ''}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default DashboardPage;
