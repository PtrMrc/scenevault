import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const { user, token, loading: authLoading } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading) {
      if (!user || !user.is_admin) {
        navigate('/'); // Redirect non-admins
        return;
      }
      fetchUsers();
    }
  }, [user, authLoading, navigate]);

  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:8000/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setUsers(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Biztosan törölni akarod ezt a felhasználót?")) return;

    try {
      const res = await fetch(`http://localhost:8000/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        setUsers(users.filter(u => u.id !== userId));
      } else {
        const data = await res.json();
        alert(data.detail);
      }
    } catch (err) {
      alert("Hiba történt");
    }
  };

  if (authLoading || loading) return <div style={{padding:'2rem'}}>Betöltés...</div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '2rem auto', padding: '1rem' }}>
      <h1>Admin Dashboard</h1>

      <div style={{ display: 'grid', gap: '2rem', marginTop: '2rem' }}>

        {/* User Management Section */}
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #ddd' }}>
          <h2>Felhasználók kezelése</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
            <thead>
              <tr style={{ background: '#f8f9fa', textAlign: 'left' }}>
                <th style={{ padding: '0.5rem' }}>ID</th>
                <th style={{ padding: '0.5rem' }}>Felhasználónév</th>
                <th style={{ padding: '0.5rem' }}>Email</th>
                <th style={{ padding: '0.5rem' }}>Jogosultság</th>
                <th style={{ padding: '0.5rem' }}>Művelet</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '0.5rem' }}>{u.id}</td>
                  <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>{u.username}</td>
                  <td style={{ padding: '0.5rem' }}>{u.email || '-'}</td>
                  <td style={{ padding: '0.5rem' }}>
                    {u.is_admin ? (
                      <span style={{ background: '#28a745', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '0.8rem' }}>ADMIN</span>
                    ) : 'User'}
                  </td>
                  <td style={{ padding: '0.5rem' }}>
                    {!u.is_admin && (
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        style={{ background: '#dc3545', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Törlés
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}