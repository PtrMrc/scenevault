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

  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 5;

  const [showAddForm, setShowAddForm] = useState(false);

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
        const result = await res.json();
        setMovies(result.data);
        setTotalPages(Math.ceil(result.total / limit));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies(searchQuery, page);
  }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchMovies(searchQuery, 1);
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
        setShowAddForm(false);
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

      {/* 2. TOGGLE BUTTON (Only visible if logged in) */}
      {token && (
        <div style={{ marginBottom: '1rem', textAlign: 'right' }}>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            style={{
              padding: '0.75rem 1.5rem',
              background: showAddForm ? '#6c757d' : '#28a745', // Grey if open, Green if closed
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            {showAddForm ? '✕ Mégse' : '+ Új film hozzáadása'}
          </button>
        </div>
      )}

      {/* --- ADD MOVIE FORM (Only visible if logged in AND not currently editing) --- */}
      {token && !editingMovie && showAddForm && (
        <div className="mb-8 bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-2xl animate-fade-in">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white">Új film hozzáadása</h3>
            <button onClick={() => setShowAddForm(false)} className="text-gray-500 hover:text-white">✕</button>
          </div>

          {message && (
             <p className={`mb-4 p-3 rounded ${message.includes('Hiba') ? 'bg-red-900/50 text-red-200' : 'bg-green-900/50 text-green-200'}`}>
               {message}
             </p>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title - Full Width */}
            <div className="md:col-span-2">
              <input
                placeholder="Cím"
                value={newMovie.title}
                onChange={e => setNewMovie({...newMovie, title: e.target.value})}
                required
                className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-red-600 focus:outline-none"
              />
            </div>

            {/* Year & Director */}
            <input
              type="number"
              placeholder="Év"
              value={newMovie.year}
              onChange={e => setNewMovie({...newMovie, year: e.target.value})}
              className="bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-red-600 focus:outline-none"
            />
            <input
              placeholder="Rendező"
              value={newMovie.director}
              onChange={e => setNewMovie({...newMovie, director: e.target.value})}
              className="bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-red-600 focus:outline-none"
            />

            {/* Poster - Full Width */}
            <div className="md:col-span-2">
              <input
                placeholder="Poszter URL (kép link)"
                value={newMovie.poster_url}
                onChange={e => setNewMovie({...newMovie, poster_url: e.target.value})}
                className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-red-600 focus:outline-none"
              />
            </div>

            {/* Description - Full Width */}
            <div className="md:col-span-2">
              <textarea
                placeholder="Leírás / Történet"
                value={newMovie.description}
                onChange={e => setNewMovie({...newMovie, description: e.target.value})}
                className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-red-600 focus:outline-none h-32"
              />
            </div>

            {/* Submit Button */}
            <div className="md:col-span-2 flex justify-end">
              <button type="submit" className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors">
                Mentés
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- EDIT MODAL OVERLAY --- */}
      {editingMovie && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-gray-900 border border-gray-800 rounded-xl shadow-2xl p-8 animate-fade-in max-h-[90vh] overflow-y-auto">

            <h2 className="text-2xl font-bold text-white mb-6 border-b border-gray-800 pb-2">
              Film szerkesztése
            </h2>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1 ml-1">Cím</label>
                <input
                  value={editingMovie.title}
                  onChange={e => setEditingMovie({...editingMovie, title: e.target.value})} 
                  required
                  className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-red-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1 ml-1">Év</label>
                  <input
                    type="number"
                    value={editingMovie.year}
                    onChange={e => setEditingMovie({...editingMovie, year: e.target.value})} 
                    className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-red-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1 ml-1">Rendező</label>
                  <input
                    value={editingMovie.director}
                    onChange={e => setEditingMovie({...editingMovie, director: e.target.value})} 
                    className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-red-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1 ml-1">Poszter URL</label>
                <input
                  value={editingMovie.poster_url}
                  onChange={e => setEditingMovie({...editingMovie, poster_url: e.target.value})} 
                  className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-red-600 focus:outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1 ml-1">Leírás</label>
                <textarea
                  value={editingMovie.description}
                  onChange={e => setEditingMovie({...editingMovie, description: e.target.value})} 
                  className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-red-600 focus:outline-none h-32"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setEditingMovie(null)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Mégse
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
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

      {/* --- PAGINATION CONTROLS --- */}
      {!loading && (
        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '1rem', alignItems: 'center' }}>
          <button
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            style={{ padding: '0.5rem 1rem', cursor: page === 1 ? 'not-allowed' : 'pointer' }}
          >
            ← Előző
          </button>

          <span>{page} / {totalPages || 1}. oldal</span>

          <button
            disabled={page >= totalPages}
            onClick={() => setPage(p => p + 1)}
            style={{ padding: '0.5rem 1rem', cursor: page >= totalPages ? 'not-allowed' : 'pointer' }}
          >
            Következő →
          </button>
        </div>
      )}
    </div>
  );
}