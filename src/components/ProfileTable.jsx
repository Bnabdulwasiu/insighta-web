import { useNavigate } from 'react-router-dom';

function ProfileTable({ profiles }) {
  const navigate = useNavigate();

  if (!profiles || profiles.length === 0) {
    return <p className="empty">No profiles found.</p>;
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Gender</th>
            <th>Age</th>
            <th>Country</th>
            <th>Age Group</th>
          </tr>
        </thead>
        <tbody>
          {profiles.map((p) => (
            <tr key={p.id} onClick={() => navigate(`/profiles/${p.id}`)}>
              <td style={{ fontWeight: 500 }}>{p.name}</td>
              <td>
                <span className={`gender-badge gender-${p.gender}`}>
                  {p.gender}
                </span>
              </td>
              <td>{p.age ?? '—'}</td>
              <td>{p.country_name ?? p.country_id ?? '—'}</td>
              <td style={{ textTransform: 'capitalize', color: 'var(--muted)', fontSize: '0.82rem' }}>
                {p.age_group ?? '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ProfileTable;
