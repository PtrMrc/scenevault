import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError('Hibás felhasználónév vagy jelszó');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-xl p-8 shadow-2xl">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">Bejelentkezés</h2>

        {error && (
          <div className="bg-red-900/50 border border-red-800 text-red-200 p-3 rounded-lg mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Felhasználónév
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-red-600 focus:ring-1 focus:ring-red-600 focus:outline-none transition-all"
              placeholder="Írd be a felhasználóneved"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Jelszó
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-red-600 focus:ring-1 focus:ring-red-600 focus:outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-bold text-white transition-all ${
              loading
                ? 'bg-gray-700 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700 shadow-lg hover:shadow-red-900/30'
            }`}
          >
            {loading ? 'Bejelentkezés...' : 'Bejelentkezés'}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-500 text-sm">
          Nincs még fiókod?{' '}
          <Link to="/register" className="text-white font-medium hover:text-red-500 transition-colors">
            Regisztrálj itt
          </Link>
        </p>
      </div>
    </div>
  );
}