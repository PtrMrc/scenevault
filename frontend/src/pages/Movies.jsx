import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Movies() {
  const { token } = useAuth(); // Get the token to allow adding movies
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [newMovie, setNewMovie] = useState({
    title: '',
    year: '',
    director: '',
    description: '',
    poster_url: ''
  });
  const [message, setMessage] = useState('');

  // 1. Fetch Movies on Load
  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      const res = await fetch('http://localhost:8000/movies?limit=100');
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

  // 2. Handle Add Movie
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
          'Authorization': `Bearer ${token}` // Send token to backend
        },
        body: JSON.stringify(newMovie)
      });

      if (res.ok) {
        setMessage('Film sikeresen hozzáadva!');
        setNewMovie({ title: '', year: '', director: '', description: '', poster_url: '' }); // Reset form
        fetchMovies(); // Refresh list immediately
      } else {
        setMessage('Hiba történt a hozzáadáskor.');
      }
    } catch (err) {
      setMessage('Szerver hiba.');
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '1rem' }}>
      <h1>Filmek</h1>

      {/* --- ADD MOVIE FORM --- */}
      {token && (
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

      {/* --- MOVIE LIST --- */}
      {loading ? <p>Betöltés...</p> : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {movies.map(movie => (
            <div key={movie.id} style={{ display: 'flex', border: '1px solid #eee', padding: '1rem', borderRadius: '8px' }}>
              {movie.poster_url && (
                <img src={movie.poster_url} alt={movie.title} style={{ width: '80px', height: '120px', objectFit: 'cover', marginRight: '1rem' }} />
              )}
              <div>
                <h3 style={{ margin: '0 0 0.5rem 0' }}>{movie.title} <small style={{ fontWeight: 'normal', color: '#666' }}>({movie.year})</small></h3>
                <p style={{ margin: 0, color: '#555' }}>{movie.director}</p>
                <p style={{ fontSize: '0.9rem', color: '#777', marginTop: '0.5rem' }}>{movie.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}