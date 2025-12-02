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
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-8 text-white">Admin Dashboard</h1>

      <div className="grid gap-8">
        {/* User Management Section */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-gray-800">
            <h2 className="text-xl font-bold text-white">Felhasználók kezelése</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-gray-300">
              <thead className="bg-black text-gray-400 uppercase text-xs font-semibold">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Felhasználónév</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Jogosultság</th>
                  <th className="px-6 py-4 text-right">Művelet</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 text-gray-500">#{u.id}</td>
                    <td className="px-6 py-4 font-medium text-white">{u.username}</td>
                    <td className="px-6 py-4">{u.email || '-'}</td>
                    <td className="px-6 py-4">
                      {u.is_admin ? (
                        <span className="bg-red-900/30 text-red-400 px-3 py-1 rounded-full text-xs font-bold border border-red-900">
                          ADMIN
                        </span>
                      ) : (
                        <span className="bg-gray-800 text-gray-400 px-3 py-1 rounded-full text-xs font-bold">
                          USER
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {!u.is_admin && (
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="text-red-500 hover:text-red-400 hover:bg-red-900/20 px-3 py-1 rounded transition-all text-sm font-medium"
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
    </div>
  );
}