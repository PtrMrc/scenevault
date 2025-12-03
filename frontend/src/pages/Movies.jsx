import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Movies() {
  const { token, user } = useAuth();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [editingMovie, setEditingMovie] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 8;

  const [newMovie, setNewMovie] = useState({
    title: '', year: '', director: '', description: '', poster_url: ''
  });
  const [message, setMessage] = useState('');

  const fetchMovies = async (query = '', pageNum = 1) => {
    setLoading(true);
    try {
      const skip = (pageNum - 1) * limit;
      let url = `http://localhost:8000/movies?skip=${skip}&limit=${limit}`;
      if (query) {
        url = `http://localhost:8000/movies/search?q=${encodeURIComponent(query)}&skip=${skip}&limit=${limit}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const result = await res.json();
        setMovies(result.data);
        setTotalPages(Math.ceil(result.total / limit));
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchMovies(searchQuery, page); }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchMovies(searchQuery, 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return alert("Jelentkezz be!");
    try {
      const res = await fetch('http://localhost:8000/movies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newMovie)
      });
      if (res.ok) {
        setMessage('Film sikeresen hozzáadva!');
        setNewMovie({ title: '', year: '', director: '', description: '', poster_url: '' });
        fetchMovies(searchQuery);
        setShowAddForm(false);
      } else { setMessage('Hiba történt a hozzáadáskor.'); }
    } catch (err) { setMessage('Szerver hiba.'); }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingMovie) return;
    try {
      const res = await fetch(`http://localhost:8000/movies/${editingMovie.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(editingMovie)
      });
      if (res.ok) {
        alert("Film frissítve!");
        setEditingMovie(null);
        fetchMovies(searchQuery, page);
      } else { alert("Hiba a frissítéskor."); }
    } catch (err) { alert("Hálózati hiba"); }
  };

  const handleDelete = async (movieId) => {
    if (!window.confirm("Biztosan törölni akarod ezt a filmet? FIGYELEM: Ez törölheti a hozzá tartozó jeleneteket is!")) return;

    try {
      const res = await fetch(`http://localhost:8000/movies/${movieId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        // Refresh list
        fetchMovies(searchQuery, page);
      } else {
        const data = await res.json();
        alert(data.detail || "Hiba történt a törléskor");
      }
    } catch (err) {
      alert("Hálózati hiba");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-white">Filmek</h1>

        {/* Toggle Button */}
        {token && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className={`px-6 py-2 rounded-lg font-bold text-white transition-all ${
              showAddForm ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700 shadow-lg hover:shadow-red-900/30'
            }`}
          >
            {showAddForm ? '✕ Mégse' : '+ Új film'}
          </button>
        )}
      </div>

      {/* SEARCH BAR */}
      <form onSubmit={handleSearch} className="mb-8 flex gap-2">
        <input
          type="text"
          placeholder="Keresés cím, rendező vagy leírás alapján..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-gray-900 border border-gray-700 rounded-lg p-4 text-white placeholder-gray-500 focus:border-red-600 focus:outline-none transition-colors"
        />
        <button type="submit" className="px-8 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-lg transition-colors border border-gray-700">
          Keresés
        </button>
        {searchQuery && (
          <button
            type="button"
            onClick={() => { setSearchQuery(''); setPage(1); fetchMovies('', 1); }}
            className="px-4 bg-gray-800 hover:bg-red-900/50 text-gray-400 hover:text-red-400 rounded-lg border border-gray-700 transition-colors"
          >
            ✕
          </button>
        )}
      </form>

      {/* ADD FORM */}
      {showAddForm && (
        <div className="mb-8 bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-2xl animate-fade-in">
          <h3 className="text-xl font-bold text-white mb-6">Új film hozzáadása</h3>
          {message && <p className="mb-4 text-green-400">{message}</p>}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2"><input placeholder="Cím" value={newMovie.title} onChange={e => setNewMovie({...newMovie, title: e.target.value})} required className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-red-600 focus:outline-none" /></div>
            <input type="number" placeholder="Év" value={newMovie.year} onChange={e => setNewMovie({...newMovie, year: e.target.value})} className="bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-red-600 focus:outline-none" />
            <input placeholder="Rendező" value={newMovie.director} onChange={e => setNewMovie({...newMovie, director: e.target.value})} className="bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-red-600 focus:outline-none" />
            <div className="md:col-span-2"><input placeholder="Poszter URL" value={newMovie.poster_url} onChange={e => setNewMovie({...newMovie, poster_url: e.target.value})} className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-red-600 focus:outline-none" /></div>
            <div className="md:col-span-2"><textarea placeholder="Leírás" value={newMovie.description} onChange={e => setNewMovie({...newMovie, description: e.target.value})} className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-red-600 focus:outline-none h-32" /></div>
            <div className="md:col-span-2 flex justify-end"><button type="submit" className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors">Mentés</button></div>
          </form>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingMovie && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-gray-900 border border-gray-800 rounded-xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-6 border-b border-gray-800 pb-2">Film szerkesztése</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <input value={editingMovie.title} onChange={e => setEditingMovie({...editingMovie, title: e.target.value})} required className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-red-600 focus:outline-none" />
              <div className="grid grid-cols-2 gap-4">
                <input value={editingMovie.year} onChange={e => setEditingMovie({...editingMovie, year: e.target.value})} className="bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-red-600 focus:outline-none" />
                <input value={editingMovie.director} onChange={e => setEditingMovie({...editingMovie, director: e.target.value})} className="bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-red-600 focus:outline-none" />
              </div>
              <input value={editingMovie.poster_url} onChange={e => setEditingMovie({...editingMovie, poster_url: e.target.value})} className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-red-600 focus:outline-none" />
              <textarea value={editingMovie.description} onChange={e => setEditingMovie({...editingMovie, description: e.target.value})} className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-red-600 focus:outline-none h-32" />
              <div className="flex gap-3 justify-end pt-4">
                <button type="button" onClick={() => setEditingMovie(null)} className="px-4 py-2 text-gray-400 hover:text-white">Mégse</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg">Frissítés</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MOVIE LIST (GRID) */}
      {loading ? <p className="text-center text-gray-500">Betöltés...</p> : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {movies.map(movie => (
            <div key={movie.id} className="group relative bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-lg transition-transform hover:-translate-y-1 hover:border-gray-600">
              <Link to={`/movies/${movie.id}`}>
                <div className="aspect-[2/3] bg-gray-800 relative overflow-hidden">
                  {movie.poster_url ? (
                    <img src={movie.poster_url} alt={movie.title} className="w-full h-full object-cover group-hover:opacity-75 transition-opacity" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">🎬</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="font-bold text-white text-lg leading-tight mb-1">{movie.title}</h3>
                    <p className="text-sm text-gray-400">{movie.year}</p>
                  </div>
                </div>
              </Link>

              {/* Admin Actions (Edit & Delete) */}
              {user && user.is_admin && (
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.preventDefault(); // Prevent clicking the card link
                      setEditingMovie(movie);
                    }}
                    className="bg-black/70 hover:bg-yellow-600 text-white p-2 rounded-full backdrop-blur-sm transition-colors"
                    title="Szerkesztés"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault(); // Prevent clicking the card link
                      handleDelete(movie.id);
                    }}
                    className="bg-black/70 hover:bg-red-600 text-white p-2 rounded-full backdrop-blur-sm transition-colors"
                    title="Törlés"
                  >
                    🗑️
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* PAGINATION */}
      {!loading && totalPages > 1 && (
        <div className="mt-12 flex justify-center items-center gap-4">
          <button
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${page === 1 ? 'text-gray-600 cursor-not-allowed' : 'bg-gray-800 hover:bg-gray-700 text-white'}`}
          >
            ← Előző
          </button>

          <span className="text-gray-400 text-sm">
            <span className="text-white font-bold">{page}</span> / {totalPages}
          </span>

          <button
            disabled={page >= totalPages}
            onClick={() => setPage(p => p + 1)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${page >= totalPages ? 'text-gray-600 cursor-not-allowed' : 'bg-gray-800 hover:bg-gray-700 text-white'}`}
          >
            Következő →
          </button>
        </div>
      )}
    </div>
  );
}