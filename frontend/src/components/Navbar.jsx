import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav style={{
      padding: "1rem",
      background: "#222",
      color: "white",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }}>
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

            <span>Üdv, {user.username}!</span>
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