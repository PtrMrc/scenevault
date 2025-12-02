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
        fetchData();
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

      {/* --- ADD SCENE FORM --- */}
      {token && (
        <div style={{ marginBottom: '2rem', padding: '1.5rem', border: '1px solid #ddd', borderRadius: '8px', background: '#f8f9fa' }}>
          <h3>Új jelenet hozzáadása</h3>
          {message && <p style={{ color: message.includes('Hiba') ? 'red' : 'green' }}>{message}</p>}

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <select
                value={newScene.movie_id}
                onChange={e => setNewScene({...newScene, movie_id: e.target.value})}
                required
                style={{ padding: '0.5rem' }}
              >
                <option value="">-- Válassz filmet --</option>
                {movies.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
              </select>

              <input
                placeholder="Jelenet címe"
                value={newScene.title}
                onChange={e => setNewScene({...newScene, title: e.target.value})}
                required
                style={{ padding: '0.5rem' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <input
                placeholder="Kezdés (pl. 01:20:00)"
                value={newScene.start_timestamp}
                onChange={e => setNewScene({...newScene, start_timestamp: e.target.value})}
                style={{ padding: '0.5rem', flex: 1 }}
              />
              <input
                placeholder="Vége (pl. 01:25:00)"
                value={newScene.end_timestamp}
                onChange={e => setNewScene({...newScene, end_timestamp: e.target.value})}
                style={{ padding: '0.5rem', flex: 1 }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <input
                placeholder="YouTube Videó Link"
                value={newScene.video_url}
                onChange={e => setNewScene({...newScene, video_url: e.target.value})}
                style={{ padding: '0.5rem', flex: 1 }}
              />
              <input
                placeholder="Kép URL (Opcionális)"
                value={newScene.image_url}
                onChange={e => setNewScene({...newScene, image_url: e.target.value})}
                style={{ padding: '0.5rem', flex: 1 }}
              />
            </div>

            <input
              placeholder="Címkék (vesszővel elválasztva: akció, vicces, dráma)"
              value={newScene.tags}
              onChange={e => setNewScene({...newScene, tags: e.target.value})}
              style={{ padding: '0.5rem' }}
            />

            <textarea
              placeholder="Rövid leírás a jelenetről..."
              value={newScene.description}
              onChange={e => setNewScene({...newScene, description: e.target.value})}
              style={{ padding: '0.5rem', height: '80px' }}
            />

            <button type="submit" style={{ padding: '0.75rem', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              Mentés
            </button>
          </form>
        </div>
      )}

      {editingScene && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2>Jelenet szerkesztése</h2>
            <form onSubmit={handleUpdateScene} style={{ display: 'grid', gap: '1rem' }}>
              <input placeholder="Cím" value={editingScene.title} onChange={e => setEditingScene({...editingScene, title: e.target.value})} required style={{ padding: '0.5rem' }} />

              <div style={{ display: 'flex', gap: '1rem' }}>
                <input placeholder="Start" value={editingScene.start_timestamp} onChange={e => setEditingScene({...editingScene, start_timestamp: e.target.value})} style={{ flex: 1, padding: '0.5rem' }} />
                <input placeholder="End" value={editingScene.end_timestamp} onChange={e => setEditingScene({...editingScene, end_timestamp: e.target.value})} style={{ flex: 1, padding: '0.5rem' }} />
              </div>

              <input placeholder="Video URL" value={editingScene.video_url} onChange={e => setEditingScene({...editingScene, video_url: e.target.value})} style={{ padding: '0.5rem' }} />
              <input placeholder="Tags" value={editingScene.tags} onChange={e => setEditingScene({...editingScene, tags: e.target.value})} style={{ padding: '0.5rem' }} />
              <textarea placeholder="Leírás" value={editingScene.description} onChange={e => setEditingScene({...editingScene, description: e.target.value})} style={{ padding: '0.5rem', height: '100px' }} />

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setEditingScene(null)} style={{ padding: '0.5rem 1rem', background: '#6c757d', color: 'white', border: 'none' }}>Mégse</button>
                <button type="submit" style={{ padding: '0.5rem 1rem', background: '#007bff', color: 'white', border: 'none' }}>Frissítés</button>
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