import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('A jelszavak nem egyeznek');
      return;
    }

    if (password.length < 6) {
      setError('A jelszónak legalább 6 karakter hosszúnak kell lennie');
      return;
    }

    setLoading(true);

    try {
      await register(username, password, email);
      // Auto-login after successful registration
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError('A regisztráció sikertelen. Lehet, hogy a felhasználónév már foglalt.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 py-8">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-xl p-8 shadow-2xl">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">Regisztráció</h2>

        {error && (
          <div className="bg-red-900/50 border border-red-800 text-red-200 p-3 rounded-lg mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
              placeholder="Válassz felhasználónevet"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Email (opcionális)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-red-600 focus:ring-1 focus:ring-red-600 focus:outline-none transition-all"
              placeholder="pelda@email.com"
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

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Jelszó megerősítése
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-red-600 focus:ring-1 focus:ring-red-600 focus:outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 mt-4 rounded-lg font-bold text-white transition-all ${
              loading
                ? 'bg-gray-700 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-green-900/30'
            }`}
          >
            {loading ? 'Regisztráció...' : 'Regisztráció'}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-500 text-sm">
          Van már fiókod?{' '}
          <Link to="/login" className="text-white font-medium hover:text-red-500 transition-colors">
            Jelentkezz be itt
          </Link>
        </p>
      </div>
    </div>
  );
}