import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Scenes() {
  const { token, user } = useAuth();
  const [scenes, setScenes] = useState([]);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newScene, setNewScene] = useState({
    movie_id: '',
    title: '',
    description: '',
    start_timestamp: '',
    end_timestamp: '',
    video_url: '',
    image_url: '',
    tags: ''
  });
  const [message, setMessage] = useState('');

  const [searchQuery, setSearchQuery] = useState('');

  const [editingScene, setEditingScene] = useState(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 5;

  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (query = '', pageNum = 1) => {
    setLoading(true);
    try {
      const skip = (pageNum - 1) * limit;

      let scenesUrl = `http://localhost:8000/scenes?skip=${skip}&limit=${limit}`;
      if (query) {
        scenesUrl = `http://localhost:8000/scenes/search?q=${encodeURIComponent(query)}&skip=${skip}&limit=${limit}`;
      }

      const [scenesRes, moviesRes] = await Promise.all([
        fetch(scenesUrl),
        fetch('http://localhost:8000/movies?limit=100') // Fetch all movies for the dropdown
      ]);

      if (scenesRes.ok && moviesRes.ok) {
        const scenesData = await scenesRes.json();
        const moviesData = await moviesRes.json();

        setScenes(scenesData.data);
        setTotalPages(Math.ceil(scenesData.total / limit));

        setMovies(moviesData.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(searchQuery, page);
  }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchData(searchQuery);
  };

  const handleTagClick = (tag) => {
    const cleanTag = tag.trim();
    setSearchQuery(cleanTag);
    fetchData(cleanTag);
  };

  const getMovieTitle = (id) => {
    const movie = movies.find(m => m.id === id);
    return movie ? movie.title : `Ismeretlen film (${id})`;
  };

  //Convert YouTube URL to Embed URL
  const getEmbedUrl = (url) => {
    if (!url) return null;
    // Simple check for youtube/youtu.be
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
  };

  const handleDelete = async (sceneId) => {
    if (!window.confirm("Biztosan törölni szeretnéd ezt a jelenetet?")) return;

    try {
      const res = await fetch(`http://localhost:8000/scenes/${sceneId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        // Remove from UI immediately
        setScenes(scenes.filter(s => s.id !== sceneId));
        setMessage('Jelenet törölve.');
      } else {
        const errData = await res.json();
        alert(`Hiba: ${errData.detail}`);
      }
    } catch (err) {
      alert("Hálózati hiba.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return alert("Jelentkezz be!");
    if (!newScene.movie_id) return alert("Válassz egy filmet!");

    try {
      const res = await fetch('http://localhost:8000/scenes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newScene)
      });

      if (res.ok) {
        setMessage('Jelenet sikeresen hozzáadva!');
        // Reset form completely
        setNewScene({
          movie_id: newScene.movie_id, // Keep movie selected
          title: '', description: '', start_timestamp: '', end_timestamp: '',
          video_url: '', image_url: '', tags: ''
        });
        fetchData(searchQuery, page);
        setShowAddForm(false);
      } else {
        setMessage('Hiba történt.');
      }
    } catch (err) {
      setMessage('Szerver hiba.');
    }
  };

  const handleUpdateScene = async (e) => {
    e.preventDefault();
    if (!editingScene) return;

    try {
      const res = await fetch(`http://localhost:8000/scenes/${editingScene.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(editingScene)
      });
      if (res.ok) {
        alert("Jelenet frissítve!");
        setEditingScene(null);
        fetchData(searchQuery);
      } else {
        const err = await res.json();
        alert(`Hiba: ${err.detail}`);
      }
    } catch (err) { alert("Hálózati hiba"); }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '2rem auto', padding: '1rem' }}>
      <h1>Jelenetek</h1>

      <form onSubmit={handleSearch} style={{ marginBottom: '2rem', display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          placeholder="Keresés cím, leírás vagy címke (#tag) alapján..." 
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
            onClick={() => { setSearchQuery(''); fetchData(''); }}
            style={{ padding: '0.75rem', cursor: 'pointer', background: '#ddd', border: 'none' }}
          >
            X
          </button>
        )}
      </form>

      {/* 2. TOGGLE BUTTON */}
      {token && (
        <div style={{ marginBottom: '1rem', textAlign: 'right' }}>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            style={{
              padding: '0.75rem 1.5rem',
              background: showAddForm ? '#6c757d' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            {showAddForm ? '✕ Mégse' : '+ Új jelenet hozzáadása'}
          </button>
        </div>
      )}

      {/* --- ADD SCENE FORM --- */}
      {token && showAddForm && (
        <div className="mb-8 bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-2xl animate-fade-in">

          {/* Header with Close Button */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white">Új jelenet hozzáadása</h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-gray-500 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Success/Error Message */}
          {message && (
             <p className={`mb-4 p-3 rounded ${message.includes('Hiba') ? 'bg-red-900/50 text-red-200 border border-red-800' : 'bg-green-900/50 text-green-200 border border-green-800'}`}>
               {message}
             </p>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Movie Selection - Full Width */}
            <div className="md:col-span-2">
              <label className="block text-xs text-gray-400 mb-1 ml-1">Válassz filmet</label>
              <select
                value={newScene.movie_id}
                onChange={e => setNewScene({...newScene, movie_id: e.target.value})}
                required
                className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-red-600 focus:outline-none appearance-none"
              >
                <option value="">-- Válassz filmet --</option>
                {movies.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
              </select>
            </div>

            {/* Scene Title - Full Width */}
            <div className="md:col-span-2">
              <input
                placeholder="Jelenet címe"
                value={newScene.title}
                onChange={e => setNewScene({...newScene, title: e.target.value})}
                required
                className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-red-600 focus:outline-none"
              />
            </div>

            {/* Timestamps - Split Row */}
            <input
              placeholder="Kezdés (pl. 01:20:00)"
              value={newScene.start_timestamp}
              onChange={e => setNewScene({...newScene, start_timestamp: e.target.value})}
              className="bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-red-600 focus:outline-none"
            />
            <input
              placeholder="Vége (pl. 01:25:00)"
              value={newScene.end_timestamp}
              onChange={e => setNewScene({...newScene, end_timestamp: e.target.value})}
              className="bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-red-600 focus:outline-none"
            />

            {/* URLs - Split Row */}
            <input
              placeholder="YouTube Videó Link"
              value={newScene.video_url}
              onChange={e => setNewScene({...newScene, video_url: e.target.value})}
              className="bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-red-600 focus:outline-none"
            />
            <input
              placeholder="Kép URL (Opcionális)"
              value={newScene.image_url}
              onChange={e => setNewScene({...newScene, image_url: e.target.value})}
              className="bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-red-600 focus:outline-none"
            />

            {/* Tags - Full Width */}
            <div className="md:col-span-2">
              <input
                placeholder="Címkék (vesszővel elválasztva: akció, vicces, dráma)"
                value={newScene.tags}
                onChange={e => setNewScene({...newScene, tags: e.target.value})}
                className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-red-600 focus:outline-none"
              />
            </div>

            {/* Description - Full Width */}
            <div className="md:col-span-2">
              <textarea
                placeholder="Rövid leírás a jelenetről..."
                value={newScene.description}
                onChange={e => setNewScene({...newScene, description: e.target.value})}
                className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-red-600 focus:outline-none h-24"
              />
            </div>

            {/* Submit Button */}
            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors shadow-lg hover:shadow-red-900/20"
              >
                Mentés
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- EDIT MODAL OVERLAY --- */}
      {editingScene && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-gray-900 border border-gray-800 rounded-xl shadow-2xl p-8 animate-fade-in max-h-[90vh] overflow-y-auto">

            <h2 className="text-2xl font-bold text-white mb-6 border-b border-gray-800 pb-2">
              Jelenet szerkesztése
            </h2>

            <form onSubmit={handleUpdateScene} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1 ml-1">Cím</label>
                <input
                  value={editingScene.title}
                  onChange={e => setEditingScene({...editingScene, title: e.target.value})} 
                  required
                  className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-red-600 focus:outline-none" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1 ml-1">Kezdés</label>
                  <input
                    value={editingScene.start_timestamp}
                    onChange={e => setEditingScene({...editingScene, start_timestamp: e.target.value})} 
                    className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-red-600 focus:outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1 ml-1">Vége</label>
                  <input
                    value={editingScene.end_timestamp}
                    onChange={e => setEditingScene({...editingScene, end_timestamp: e.target.value})} 
                    className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-red-600 focus:outline-none" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs text-gray-500 mb-1 ml-1">Videó URL</label>
                   <input
                     value={editingScene.video_url}
                     onChange={e => setEditingScene({...editingScene, video_url: e.target.value})} 
                     className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-red-600 focus:outline-none text-sm" 
                   />
                </div>
                <div>
                   <label className="block text-xs text-gray-500 mb-1 ml-1">Címkék</label>
                   <input
                     value={editingScene.tags}
                     onChange={e => setEditingScene({...editingScene, tags: e.target.value})} 
                     className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-red-600 focus:outline-none" 
                   />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1 ml-1">Leírás</label>
                <textarea
                  value={editingScene.description}
                  onChange={e => setEditingScene({...editingScene, description: e.target.value})} 
                  className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-red-600 focus:outline-none h-32" 
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                 <button
                   type="button"
                   onClick={() => setEditingScene(null)}
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

      {/* --- SCENES LIST --- */}
      {loading ? <p>Betöltés...</p> : (
        <div style={{ display: 'grid', gap: '2rem' }}>
          {scenes.map(scene => {
            const embedUrl = getEmbedUrl(scene.video_url);

            return (
              <div key={scene.id} style={{ border: '1px solid #eee', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                {/* Video or Image Header */}
                {embedUrl ? (
                  <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                    <iframe
                      src={embedUrl}
                      title={scene.title}
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                      allowFullScreen
                    />
                  </div>
                ) : scene.image_url ? (
                  <img src={scene.image_url} alt={scene.title} style={{ width: '100%', height: '300px', objectFit: 'cover' }} />
                ) : null}

                <div style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{scene.title}</h2>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ background: '#e9ecef', padding: '0.4rem 0.8rem', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.9rem' }}>
                        {scene.start_timestamp} - {scene.end_timestamp || '?'}
                      </span>

                      {/* EDIT AND DELETE BUTTON (for Admin or Owner*/}
                      {user && (user.is_admin || user.id === scene.created_by) && (
                        <>
                          <button
                            onClick={() => setEditingScene(scene)}
                            style={{ background: '#ffc107', color: 'black', border: 'none', borderRadius: '4px', padding: '0.4rem 0.8rem', cursor: 'pointer' }}
                            title="Szerkesztés"
                          >
                            ✏️
                          </button>

                          <button
                            onClick={() => handleDelete(scene.id)}
                            style={{ background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', padding: '0.4rem 0.8rem', cursor: 'pointer' }}
                            title="Törlés"
                          >
                            🗑️
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <h4 style={{ color: '#007bff', margin: '0 0 1rem 0' }}>🎬 {getMovieTitle(scene.movie_id)}</h4>

                  <p style={{ lineHeight: '1.6', color: '#555' }}>{scene.description}</p>

                  {/* TAGS SECTION: CLICKABLE */}
                  {scene.tags && (
                    <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {scene.tags.split(',').map((tag, idx) => (
                        <span
                          key={idx}
                          onClick={() => handleTagClick(tag)}
                          style={{
                            background: '#ffc107',
                            color: '#333',
                            padding: '0.2rem 0.6rem',
                            borderRadius: '4px',
                            fontSize: '0.8rem',
                            cursor: 'pointer'
                          }}
                        >
                          #{tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* PAGINATION CONTROLS */}
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