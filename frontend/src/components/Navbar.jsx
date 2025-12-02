import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 w-full bg-black/90 backdrop-blur-sm border-b border-gray-800 px-6 py-4 flex justify-between items-center">
      <Link to="/" style={{ color: "white", textDecoration: "none" }}>
        <h1>🎬 SceneVault</h1>
      </Link>

      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        {user ? (
          <>
            {user.is_admin && (
              <Link to="/admin" style={{ color: "#ffc107", textDecoration: "none", fontWeight: "bold" }}>
                Admin
              </Link>
            )}

            <Link to="/profile" style={{ color: "white", textDecoration: "underline", cursor: "pointer" }}>
               Üdv, {user.username}!
            </Link>
            <button onClick={logout} style={{ padding: "0.5rem 1rem" }}>
              Kijelentkezés
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ color: "white" }}>Bejelentkezés</Link>
            <Link to="/register" style={{ color: "white" }}>Regisztráció</Link>
          </>
        )}
      </div>
    </nav>
  );
}