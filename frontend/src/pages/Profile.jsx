import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, token } = useAuth();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (user) setEmail(user.email || '');
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);

    try {
      const res = await fetch('http://localhost:8000/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email: email })
      });

      if (res.ok) {
        setMessage('Profil sikeresen frissítve!');
      } else {
        setIsError(true);
        setMessage('Hiba történt a mentéskor.');
      }
    } catch (err) {
      setIsError(true);
      setMessage('Szerver hiba.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-8 text-white">Profil beállítások</h1>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 shadow-2xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-2xl font-bold text-white">
            {user?.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{user?.username}</h3>
            <p className="text-gray-400 text-sm">Felhasználó</p>
          </div>
        </div>

        {message && (
          <div className={`p-4 mb-6 rounded-lg text-sm font-medium ${isError ? 'bg-red-900/50 text-red-200 border border-red-800' : 'bg-green-900/50 text-green-200 border border-green-800'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Email cím</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors"
          >
            Mentés
          </button>
        </form>
      </div>
    </div>
  );
}