import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Scenes() {
  const { token, user } = useAuth();
  const [scenes, setScenes] = useState([]);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 6;

  const [editingScene, setEditingScene] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const [newScene, setNewScene] = useState({
    movie_id: '', title: '', description: '', start_timestamp: '', end_timestamp: '', video_url: '', image_url: '', tags: ''
  });
  const [message, setMessage] = useState('');

  const fetchData = async (query = '', pageNum = 1) => {
    setLoading(true);
    try {
      const skip = (pageNum - 1) * limit;
      let scenesUrl = `http://localhost:8000/scenes?skip=${skip}&limit=${limit}`;
      if (query) {
        scenesUrl = `http://localhost:8000/scenes/search?q=${encodeURIComponent(query)}&skip=${skip}&limit=${limit}`;
      }

      const [scenesRes, moviesRes] = await Promise.all([
        fetch(scenesUrl), fetch('http://localhost:8000/movies?limit=100')
      ]);

      if (scenesRes.ok && moviesRes.ok) {
        const scenesData = await scenesRes.json();
        const moviesData = await moviesRes.json();
        setScenes(scenesData.data);
        setTotalPages(Math.ceil(scenesData.total / limit));
        setMovies(moviesData.data);
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(searchQuery, page); }, [page]);

  const handleSearch = (e) => { e.preventDefault(); setPage(1); fetchData(searchQuery, 1); };
  const handleTagClick = (tag) => { const t = tag.trim(); setSearchQuery(t); setPage(1); fetchData(t, 1); };
  const getMovieTitle = (id) => { const m = movies.find(m => m.id === id); return m ? m.title : `Ismeretlen`; };
  const getEmbedUrl = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return alert("Jelentkezz be!");
    if (!newScene.movie_id) return alert("Válassz egy filmet!");
    try {
      const res = await fetch('http://localhost:8000/scenes', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(newScene)
      });
      if (res.ok) {
        setMessage('Jelenet hozzáadva!');
        setNewScene({ movie_id: newScene.movie_id, title: '', description: '', start_timestamp: '', end_timestamp: '', video_url: '', image_url: '', tags: '' });
        fetchData(searchQuery, page);
        setShowAddForm(false);
      } else { setMessage('Hiba történt.'); }
    } catch (err) { setMessage('Szerver hiba.'); }
  };

  const handleUpdateScene = async (e) => {
    e.preventDefault();
    if (!editingScene) return;
    try {
      const res = await fetch(`http://localhost:8000/scenes/${editingScene.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(editingScene)
      });
      if (res.ok) { alert("Sikeres frissítés!"); setEditingScene(null); fetchData(searchQuery, page); }
      else { alert("Hiba történt."); }
    } catch (err) { alert("Hálózati hiba"); }
  };

  const handleDelete = async (sceneId) => {
    if (!window.confirm("Biztosan törölni szeretnéd?")) return;
    try {
      const res = await fetch(`http://localhost:8000/scenes/${sceneId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) { fetchData(searchQuery, page); }
    } catch (err) { alert("Hiba."); }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-white">Jelenetek</h1>
        {token && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className={`px-6 py-2 rounded-lg font-bold text-white transition-all ${showAddForm ? 'bg-gray-700' : 'bg-red-600 hover:bg-red-700 shadow-lg'}`}
          >
            {showAddForm ? '✕ Mégse' : '+ Új jelenet'}
          </button>
        )}
      </div>

      <form onSubmit={handleSearch} className="mb-8 flex gap-2">
        <input type="text" placeholder="Keresés cím, leírás vagy címke (#tag)..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1 bg-gray-900 border border-gray-800 rounded-lg p-4 text-white focus:border-red-600 focus:outline-none" />
        <button type="submit" className="px-8 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-lg border border-gray-700">Keresés</button>
        {searchQuery && <button type="button" onClick={() => { setSearchQuery(''); setPage(1); fetchData('', 1); }} className="flex-1 bg-gray-900 border border-gray-700 rounded-lg p-4 text-white placeholder-gray-500 focus:border-red-600 focus:outline-none">✕</button>}
      </form>

      {/* ADD FORM */}
      {showAddForm && (
        <div className="mb-8 bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-2xl animate-fade-in">
          <h3 className="text-xl font-bold text-white mb-6">Új jelenet hozzáadása</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2"><select value={newScene.movie_id} onChange={e => setNewScene({...newScene, movie_id: e.target.value})} required className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white"><option value="">-- Válassz filmet --</option>{movies.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}</select></div>
            <div className="md:col-span-2"><input placeholder="Cím" value={newScene.title} onChange={e => setNewScene({...newScene, title: e.target.value})} required className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white" /></div>
            <input placeholder="Kezdés" value={newScene.start_timestamp} onChange={e => setNewScene({...newScene, start_timestamp: e.target.value})} className="bg-black border border-gray-700 rounded-lg p-3 text-white" />
            <input placeholder="Vége" value={newScene.end_timestamp} onChange={e => setNewScene({...newScene, end_timestamp: e.target.value})} className="bg-black border border-gray-700 rounded-lg p-3 text-white" />
            <input placeholder="YouTube URL" value={newScene.video_url} onChange={e => setNewScene({...newScene, video_url: e.target.value})} className="bg-black border border-gray-700 rounded-lg p-3 text-white" />
            <input placeholder="Kép URL" value={newScene.image_url} onChange={e => setNewScene({...newScene, image_url: e.target.value})} className="bg-black border border-gray-700 rounded-lg p-3 text-white" />
            <div className="md:col-span-2"><input placeholder="Címkék" value={newScene.tags} onChange={e => setNewScene({...newScene, tags: e.target.value})} className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white" /></div>
            <div className="md:col-span-2"><textarea placeholder="Leírás" value={newScene.description} onChange={e => setNewScene({...newScene, description: e.target.value})} className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white h-24" /></div>
            <div className="md:col-span-2 flex justify-end"><button type="submit" className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg">Mentés</button></div>
          </form>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingScene && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-gray-900 border border-gray-800 rounded-xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-6 border-b border-gray-800 pb-2">Jelenet szerkesztése</h2>
            <form onSubmit={handleUpdateScene} className="space-y-4">
              <input value={editingScene.title} onChange={e => setEditingScene({...editingScene, title: e.target.value})} required className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white" />
              <div className="grid grid-cols-2 gap-4">
                <input value={editingScene.start_timestamp} onChange={e => setEditingScene({...editingScene, start_timestamp: e.target.value})} className="bg-black border border-gray-700 rounded-lg p-3 text-white" />
                <input value={editingScene.end_timestamp} onChange={e => setEditingScene({...editingScene, end_timestamp: e.target.value})} className="bg-black border border-gray-700 rounded-lg p-3 text-white" />
              </div>
              <input value={editingScene.video_url} onChange={e => setEditingScene({...editingScene, video_url: e.target.value})} className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white" />
              <input value={editingScene.tags} onChange={e => setEditingScene({...editingScene, tags: e.target.value})} className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white" />
              <textarea value={editingScene.description} onChange={e => setEditingScene({...editingScene, description: e.target.value})} className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white h-24" />
              <div className="flex gap-3 justify-end pt-4"><button type="button" onClick={() => setEditingScene(null)} className="px-4 py-2 text-gray-400 hover:text-white">Mégse</button><button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg">Frissítés</button></div>
            </form>
          </div>
        </div>
      )}

      {/* SCENES LIST */}
      {loading ? <p className="text-center text-gray-500">Betöltés...</p> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scenes.map(scene => {
            const embedUrl = getEmbedUrl(scene.video_url);
            return (
              <div key={scene.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-lg hover:border-gray-600 transition-colors flex flex-col">
                <div className="relative aspect-video bg-black">
                  {embedUrl ? (
                    <iframe src={embedUrl} className="w-full h-full border-none" allowFullScreen title={scene.title} />
                  ) : scene.image_url ? (
                    <img src={scene.image_url} alt={scene.title} className="w-full h-full object-cover" />
                  ) : <div className="w-full h-full flex items-center justify-center text-3xl">▶️</div>}

                  {user && (user.is_admin || user.id === scene.created_by) && (
                    <div className="absolute top-2 right-2 flex gap-2">
                       <button onClick={() => setEditingScene(scene)} className="bg-black/70 hover:bg-yellow-600 text-white p-2 rounded backdrop-blur transition-colors" title="Szerkesztés">✏️</button>
                       <button onClick={() => handleDelete(scene.id)} className="bg-black/70 hover:bg-red-600 text-white p-2 rounded backdrop-blur transition-colors" title="Törlés">🗑️</button>
                    </div>
                  )}
                </div>

                <div className="p-4 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <Link to={`/scenes/${scene.id}`} className="font-bold text-white text-lg hover:text-blue-400 transition-colors line-clamp-1">{scene.title}</Link>
                    <span className="text-xs font-mono bg-black text-gray-400 px-2 py-1 rounded whitespace-nowrap">{scene.start_timestamp}</span>
                  </div>

                  <Link to={`/movies/${scene.movie_id}`} className="text-sm text-blue-500 hover:text-blue-400 mb-2 block font-medium">🎬 {getMovieTitle(scene.movie_id)}</Link>
                  <p className="text-gray-400 text-sm line-clamp-2 mb-4 flex-1">{scene.description}</p>

                  <div className="flex flex-wrap gap-2 mt-auto">
                    {scene.tags && scene.tags.split(',').map((tag, idx) => (
                      <span key={idx} onClick={() => handleTagClick(tag)} className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-2 py-1 rounded text-xs hover:bg-yellow-500/20 cursor-pointer transition-colors">#{tag.trim()}</span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* PAGINATION */}
      {!loading && totalPages > 1 && (
        <div className="mt-12 flex justify-center items-center gap-4">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className={`px-4 py-2 rounded-lg font-medium transition-colors ${page === 1 ? 'text-gray-600 cursor-not-allowed' : 'bg-gray-800 hover:bg-gray-700 text-white'}`}>← Előző</button>
          <span className="text-gray-400 text-sm"><span className="text-white font-bold">{page}</span> / {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className={`px-4 py-2 rounded-lg font-medium transition-colors ${page >= totalPages ? 'text-gray-600 cursor-not-allowed' : 'bg-gray-800 hover:bg-gray-700 text-white'}`}>Következő →</button>
        </div>
      )}
    </div>
  );
}