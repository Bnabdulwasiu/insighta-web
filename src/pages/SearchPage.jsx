import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';

const EXAMPLE_QUERIES = [
  'male over 30',
  'female adult',
  'US',
  'GB senior',
  'young female',
  'middle-aged male',
];

function SearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [profiles, setProfiles] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');
  const debounceRef = useRef(null);

  const runSearch = useCallback(async (q, p = 1) => {
    if (!q.trim()) return;
    setLoading(true);
    setError('');
    setSearched(true);
    try {
      const res = await client.get('/api/profiles/search', {
        params: { q: q.trim(), page: p, limit: 10 },
      });
      const body = res.data;
      setProfiles(body.data);
      setPage(body.page);
      setTotalPages(body.total_pages);
      setTotal(body.total);
    } catch (err) {
      const msg = err.response?.data?.message;
      setError(msg || 'Search failed. Try a different query.');
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceRef.current);
    if (val.trim()) {
      debounceRef.current = setTimeout(() => runSearch(val), 400);
    } else {
      setProfiles([]);
      setSearched(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    clearTimeout(debounceRef.current);
    runSearch(query);
  };

  const handleTag = (tag) => {
    setQuery(tag);
    runSearch(tag);
  };

  return (
    <div className="page content">
      {/* Hero search bar */}
      <div className="search-hero">
        <h1 className="page-title">Smart Search</h1>
        <p>Use natural language to find profiles — by gender, age, country, or age group.</p>

        <form onSubmit={handleSubmit}>
          <div className="search-bar-wrap">
            <span className="search-bar-icon">🔍</span>
            <input
              id="search-input"
              className="input input-lg"
              type="text"
              placeholder='e.g. "male over 30", "female GB", "senior US"'
              value={query}
              onChange={handleChange}
              autoFocus
            />
          </div>
        </form>

        <div className="search-tags">
          {EXAMPLE_QUERIES.map((tag) => (
            <button
              key={tag}
              className="search-tag"
              onClick={() => handleTag(tag)}
              type="button"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>
      )}

      {/* Loading */}
      {loading && <span className="spinner" />}

      {/* Results */}
      {!loading && searched && profiles.length === 0 && !error && (
        <div className="empty">No profiles matched your query. Try different terms.</div>
      )}

      {!loading && profiles.length > 0 && (
        <>
          <div style={{ marginBottom: '0.75rem', fontSize: '0.85rem', color: 'var(--text-2)' }}>
            Found <strong style={{ color: 'var(--text)' }}>{total.toLocaleString()}</strong> profiles for{' '}
            <em>"{query}"</em>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Gender</th>
                  <th>Age</th>
                  <th>Age Group</th>
                  <th>Country</th>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => runSearch(query, page - 1)}
                disabled={page <= 1}
              >
                ← Prev
              </button>
              <span className="pagination-info">Page {page} of {totalPages}</span>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => runSearch(query, page + 1)}
                disabled={page >= totalPages}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default SearchPage;
