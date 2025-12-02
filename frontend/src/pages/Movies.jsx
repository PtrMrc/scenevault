import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Movies() {
  const { token, user } = useAuth();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');

  // Editing State
  const [editingMovie, setEditingMovie] = useState(null);

  // Adding State
  const [newMovie, setNewMovie] = useState({
    title: '',
    year: '',
    director: '',
    description: '',
    poster_url: ''
  });
  const [message, setMessage] = useState('');

  // 1. Fetch Movies (Handles both "All" and "Search")
  const fetchMovies = async (query = '') => {
    setLoading(true);
    try {
      let url = 'http://localhost:8000/movies?limit=100';
      if (query) {
        url = `http://localhost:8000/movies/search?q=${encodeURIComponent(query)}`;
      }

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setMovies(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchMovies(searchQuery);
  };

  // 2. Add Movie Logic
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      alert("Jelentkezz be film hozzáadásához!");
      return;
    }

    try {
      const res = await fetch('http://localhost:8000/movies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newMovie)
      });

      if (res.ok) {
        setMessage('Film sikeresen hozzáadva!');
        setNewMovie({ title: '', year: '', director: '', description: '', poster_url: '' });
        fetchMovies(searchQuery); // Refresh list
      } else {
        setMessage('Hiba történt a hozzáadáskor.');
      }
    } catch (err) {
      setMessage('Szerver hiba.');
    }
  };

  // 3. Update Movie Logic
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingMovie) return;

    try {
      const res = await fetch(`http://localhost:8000/movies/${editingMovie.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editingMovie)
      });

      if (res.ok) {
        alert("Film frissítve!");
        setEditingMovie(null); // Close modal
        fetchMovies(searchQuery); // Refresh list
      } else {
        alert("Hiba a frissítéskor (Admin jog szükséges).");
      }
    } catch (err) {
      alert("Hálózati hiba");
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '1rem' }}>
      <h1>Filmek</h1>

      {/* --- SEARCH BAR --- */}
      <form onSubmit={handleSearch} style={{ marginBottom: '2rem', display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          placeholder="Keresés cím, rendező vagy leírás alapján..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ flex: 1, padding: '0.75rem', fontSize: '1rem' }}
        />
        <button type="submit" style={{ padding: '0.75rem 1.5rem', cursor: 'pointer', background: '#333', color: 'white', border: 'none' }}>
          Keresés
        </button>
        {searchQuery && (
          <button
            type="button"
            onClick={() => { setSearchQuery(''); fetchMovies(''); }}
            style={{ padding: '0.75rem', cursor: 'pointer', background: '#ddd', border: 'none' }}
          >
            X
          </button>
        )}
      </form>

      {/* --- ADD MOVIE FORM (Only visible if logged in AND not currently editing) --- */}
      {token && !editingMovie && (
        <div style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #ccc', borderRadius: '8px', background: '#f9f9f9' }}>
          <h3>Új film hozzáadása</h3>
          {message && <p style={{ color: message.includes('Hiba') ? 'red' : 'green' }}>{message}</p>}

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.5rem' }}>
            <input
              placeholder="Cím"
              value={newMovie.title}
              onChange={e => setNewMovie({...newMovie, title: e.target.value})}
              required
              style={{ padding: '0.5rem' }}
            />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="number"
                placeholder="Év"
                value={newMovie.year}
                onChange={e => setNewMovie({...newMovie, year: e.target.value})}
                style={{ padding: '0.5rem', flex: 1 }}
              />
              <input
                placeholder="Rendező"
                value={newMovie.director}
                onChange={e => setNewMovie({...newMovie, director: e.target.value})}
                style={{ padding: '0.5rem', flex: 2 }}
              />
            </div>
            <input
              placeholder="Poszter URL (kép link)"
              value={newMovie.poster_url}
              onChange={e => setNewMovie({...newMovie, poster_url: e.target.value})}
              style={{ padding: '0.5rem' }}
            />
            <textarea
              placeholder="Leírás / Történet"
              value={newMovie.description}
              onChange={e => setNewMovie({...newMovie, description: e.target.value})}
              style={{ padding: '0.5rem', height: '60px' }}
            />
            <button type="submit" style={{ padding: '0.5rem', background: '#28a745', color: 'white', border: 'none', cursor: 'pointer' }}>
              Mentés
            </button>
          </form>
        </div>
      )}

      {/* --- EDIT MODAL OVERLAY --- */}
      {editingMovie && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', width: '90%', maxWidth: '500px' }}>
            <h2 style={{ marginTop: 0 }}>Film szerkesztése</h2>
            <form onSubmit={handleUpdate} style={{ display: 'grid', gap: '1rem' }}>
              <input
                placeholder="Cím"
                value={editingMovie.title}
                onChange={e => setEditingMovie({...editingMovie, title: e.target.value})}
                required
                style={{ padding: '0.5rem' }}
              />
              <input
                placeholder="Év"
                value={editingMovie.year}
                onChange={e => setEditingMovie({...editingMovie, year: e.target.value})}
                style={{ padding: '0.5rem' }}
              />
              <input
                placeholder="Rendező"
                value={editingMovie.director}
                onChange={e => setEditingMovie({...editingMovie, director: e.target.value})}
                style={{ padding: '0.5rem' }}
              />
              <input
                placeholder="Poszter URL"
                value={editingMovie.poster_url}
                onChange={e => setEditingMovie({...editingMovie, poster_url: e.target.value})}
                style={{ padding: '0.5rem' }}
              />
              <textarea
                placeholder="Leírás"
                value={editingMovie.description}
                onChange={e => setEditingMovie({...editingMovie, description: e.target.value})}
                style={{ padding: '0.5rem', height: '100px' }}
              />

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setEditingMovie(null)}
                  style={{ padding: '0.5rem 1rem', background: '#6c757d', color: 'white', border: 'none', cursor: 'pointer' }}
                >
                  Mégse
                </button>
                <button
                  type="submit"
                  style={{ padding: '0.5rem 1rem', background: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}
                >
                  Frissítés
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MOVIE LIST --- */}
      {loading ? <p>Betöltés...</p> : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {movies.map(movie => (
            <div key={movie.id} style={{ display: 'flex', border: '1px solid #eee', padding: '1rem', borderRadius: '8px', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex' }}>
                {movie.poster_url && (
                  <img src={movie.poster_url} alt={movie.title} style={{ width: '80px', height: '120px', objectFit: 'cover', marginRight: '1rem' }} />
                )}
                <div>
                  <h3 style={{ margin: '0 0 0.5rem 0' }}>{movie.title} <small style={{ fontWeight: 'normal', color: '#666' }}>({movie.year})</small></h3>
                  <p style={{ margin: 0, color: '#555' }}>{movie.director}</p>
                  <p style={{ fontSize: '0.9rem', color: '#777', marginTop: '0.5rem' }}>{movie.description}</p>
                </div>
              </div>

              {/* Edit Button (Admin Only) */}
              {user && user.is_admin && (
                <div style={{ minWidth: '40px' }}>
                  <button 
                    onClick={() => setEditingMovie(movie)}
                    style={{ background: '#ffc107', border: 'none', padding: '0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '1.2rem' }}
                    title="Szerkesztés"
                  >
                    ✏️
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}