import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import client from '../api/client';

function Field({ label, value }) {
  return (
    <div className="account-field">
      <label>{label}</label>
      <div className="val">{value ?? <span style={{ color: 'var(--muted)' }}>—</span>}</div>
    </div>
  );
}

function ProfileDetailPage({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteMsg, setDeleteMsg] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await client.get(`/api/profiles/${id}`);
        setProfile(res.data.data);
      } catch (err) {
        const status = err.response?.status;
        if (status === 404) setError('Profile not found.');
        else if (status === 401) setError('Session expired. Please log in again.');
        else if (status === 403) setError('Not authorized.');
        else setError('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm(`Delete profile "${profile?.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    setDeleteMsg('');
    try {
      await client.delete(`/api/profiles/${id}`);
      navigate('/profiles', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message;
      setDeleteMsg(msg || 'Failed to delete profile.');
      setDeleting(false);
    }
  };

  const pct = (val) => (val != null ? `${(val * 100).toFixed(1)}%` : null);

  return (
    <div className="page content">
      <Link to="/profiles" className="back-link">← Back to profiles</Link>

      {loading && <span className="spinner" />}
      {error && <div className="alert alert-error">{error}</div>}

      {!loading && profile && (
        <>
          {/* Profile header card */}
          <div className="profile-header-card">
            <div className="profile-initials">
              {profile.name?.[0]?.toUpperCase()}
            </div>
            <div className="profile-header-info">
              <h1>{profile.name}</h1>
              <p>
                <span className={`gender-badge gender-${profile.gender}`}>{profile.gender}</span>
                {' · '}Age {profile.age ?? '—'}{' · '}{profile.country_name ?? profile.country_id ?? '—'}
              </p>
            </div>
            {user?.role === 'admin' && (
              <div style={{ marginLeft: 'auto' }}>
                <button
                  id="delete-profile-btn"
                  className="btn btn-danger btn-sm"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? 'Deleting…' : '🗑 Delete'}
                </button>
              </div>
            )}
          </div>

          {deleteMsg && (
            <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{deleteMsg}</div>
          )}

          {/* Detail fields */}
          <div className="card">
            <div className="account-grid">
              <Field label="Profile ID" value={
                <span style={{ fontSize: '0.78rem', color: 'var(--text-2)', wordBreak: 'break-all' }}>
                  {profile.id}
                </span>
              } />
              <Field label="Name" value={
                <span style={{ textTransform: 'capitalize' }}>{profile.name}</span>
              } />
              <Field label="Gender" value={
                <span className={`gender-badge gender-${profile.gender}`}>{profile.gender}</span>
              } />
              <Field label="Gender Probability" value={pct(profile.gender_probability)} />
              <Field label="Age" value={profile.age} />
              <Field label="Age Group" value={
                profile.age_group
                  ? <span style={{ textTransform: 'capitalize' }}>{profile.age_group}</span>
                  : null
              } />
              <Field label="Country" value={profile.country_name} />
              <Field label="Country Code" value={profile.country_id} />
              <Field label="Country Probability" value={pct(profile.country_probability)} />
              <Field label="Created At" value={
                profile.created_at ? new Date(profile.created_at).toLocaleString() : null
              } />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ProfileDetailPage;
