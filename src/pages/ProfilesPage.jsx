import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';

function ProfilesPage({ user }) {
  const navigate = useNavigate();

  // ── List state ──────────────────────────────────────────────
  const [profiles, setProfiles] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ── Filter state ────────────────────────────────────────────
  const [gender, setGender] = useState('');
  const [ageGroup, setAgeGroup] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [order, setOrder] = useState('asc');

  // ── Create profile state (admin only) ───────────────────────
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState(null);

  // ── Export state ────────────────────────────────────────────
  const [exporting, setExporting] = useState(false);

  // ── Fetch profiles ──────────────────────────────────────────
  const fetchProfiles = useCallback(async (p = 1) => {
    setLoading(true);
    setError('');
    try {
      const params = { page: p, limit: 10 };
      if (gender) params.gender = gender;
      if (ageGroup) params.age_group = ageGroup;
      if (sortBy) { params.sort_by = sortBy; params.order = order; }
      const res = await client.get('/api/profiles', { params });
      const body = res.data;
      setProfiles(body.data);
      setPage(body.page);
      setTotalPages(body.total_pages);
      setTotal(body.total);
    } catch (err) {
      const status = err.response?.status;
      if (status === 401) setError('Session expired. Please log in again.');
      else if (status === 403) setError('Not authorized to view profiles.');
      else setError('Failed to load profiles.');
    } finally {
      setLoading(false);
    }
  }, [gender, ageGroup, sortBy, order]);

  useEffect(() => { fetchProfiles(1); }, [fetchProfiles]);

  // ── Create profile ──────────────────────────────────────────
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    setCreateMsg(null);
    try {
      await client.post('/api/profiles', { name: newName.trim() });
      setCreateMsg({ type: 'success', text: 'Profile created successfully.' });
      setNewName('');
      fetchProfiles(1);
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message;
      if (status === 403) setCreateMsg({ type: 'error', text: 'Not authorized — admin only.' });
      else setCreateMsg({ type: 'error', text: msg || 'Failed to create profile.' });
    } finally {
      setCreating(false);
    }
  };

  // ── Export CSV ──────────────────────────────────────────────
  const handleExport = async () => {
    setExporting(true);
    try {
      const params = { format: 'csv' };
      if (gender) params.gender = gender;
      if (ageGroup) params.age_group = ageGroup;
      const res = await client.get('/api/profiles/export', { params, responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }));
      const a = document.createElement('a');
      const disposition = res.headers['content-disposition'] || '';
      const match = disposition.match(/filename=([^;]+)/);
      a.download = match ? match[1] : 'profiles.csv';
      a.href = url;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Export failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setExporting(false);
    }
  };

  const resetFilters = () => {
    setGender('');
    setAgeGroup('');
    setSortBy('');
    setOrder('asc');
  };

  const hasFilters = gender || ageGroup || sortBy;

  return (
    <div className="page content">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
        <h1 className="page-title" style={{ margin: 0 }}>Profiles</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            id="export-csv-btn"
            className="btn btn-ghost btn-sm"
            onClick={handleExport}
            disabled={exporting}
          >
            {exporting ? 'Exporting…' : '⬇ Export CSV'}
          </button>
        </div>
      </div>
      <p className="page-subtitle">
        {total > 0 ? `${total.toLocaleString()} profiles found` : 'Browse all profiles'}
      </p>

      {/* Filters */}
      <div className="filter-row">
        <div className="field">
          <label>Gender</label>
          <select value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="">All genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        <div className="field">
          <label>Age Group</label>
          <select value={ageGroup} onChange={(e) => setAgeGroup(e.target.value)}>
            <option value="">All age groups</option>
            <option value="young">Young</option>
            <option value="adult">Adult</option>
            <option value="middle-aged">Middle-aged</option>
            <option value="senior">Senior</option>
          </select>
        </div>
        <div className="field">
          <label>Sort By</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="">Default</option>
            <option value="age">Age</option>
            <option value="created_at">Date Added</option>
            <option value="gender_probability">Gender Probability</option>
          </select>
        </div>
        {sortBy && (
          <div className="field">
            <label>Order</label>
            <select value={order} onChange={(e) => setOrder(e.target.value)}>
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        )}
        {hasFilters && (
          <button className="btn btn-ghost btn-sm" onClick={resetFilters} style={{ alignSelf: 'flex-end' }}>
            ✕ Reset
          </button>
        )}
      </div>

      {/* Error */}
      {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

      {/* Loading */}
      {loading && <span className="spinner" />}

      {/* Table */}
      {!loading && profiles.length === 0 && !error && (
        <div className="empty">No profiles match your filters.</div>
      )}
      {!loading && profiles.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Gender</th>
                <th>Age</th>
                <th>Age Group</th>
                <th>Country</th>
                <th>Added</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((p) => (
                <tr key={p.id} onClick={() => navigate(`/profiles/${p.id}`)}>
                  <td style={{ fontWeight: 600, textTransform: 'capitalize' }}>{p.name}</td>
                  <td>
                    <span className={`gender-badge gender-${p.gender}`}>{p.gender}</span>
                  </td>
                  <td>{p.age ?? '—'}</td>
                  <td style={{ textTransform: 'capitalize' }}>{p.age_group ?? '—'}</td>
                  <td>{p.country_name ?? p.country_id ?? '—'}</td>
                  <td style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>
                    {p.created_at ? new Date(p.created_at).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="pagination">
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => fetchProfiles(page - 1)}
            disabled={page <= 1}
          >
            ← Prev
          </button>
          <span className="pagination-info">Page {page} of {totalPages}</span>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => fetchProfiles(page + 1)}
            disabled={page >= totalPages}
          >
            Next →
          </button>
        </div>
      )}

      {/* Create Profile — admin only */}
      {user?.role === 'admin' && (
        <div className="card section-gap">
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>
            Create Profile <span className="badge admin">Admin</span>
          </h2>
          <form id="create-profile-form" className="create-form" onSubmit={handleCreate}>
            <div className="field">
              <label>Name</label>
              <input
                id="create-profile-name"
                className="input"
                type="text"
                placeholder="e.g. Alice"
                value={newName}
                onChange={(e) => { setNewName(e.target.value); setCreateMsg(null); }}
                required
              />
            </div>
            <button
              id="create-profile-submit"
              className="btn btn-primary"
              type="submit"
              disabled={creating}
            >
              {creating ? 'Creating…' : '+ Create'}
            </button>
          </form>
          {createMsg && (
            <div className={`alert alert-${createMsg.type}`} style={{ marginTop: '0.75rem' }}>
              {createMsg.text}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ProfilesPage;
