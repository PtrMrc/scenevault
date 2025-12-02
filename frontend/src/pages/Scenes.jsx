import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Scenes() {
  const { token } = useAuth();
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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [scenesRes, moviesRes] = await Promise.all([
        fetch('http://localhost:8000/scenes?limit=100'),
        fetch('http://localhost:8000/movies?limit=100')
      ]);

      if (scenesRes.ok && moviesRes.ok) {
        setScenes(await scenesRes.json());
        setMovies(await moviesRes.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
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

  return (
    <div style={{ maxWidth: '900px', margin: '2rem auto', padding: '1rem' }}>
      <h1>Jelenetek</h1>

      {/* --- EXTENDED ADD FORM --- */}
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
                    <span style={{ background: '#e9ecef', padding: '0.4rem 0.8rem', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.9rem' }}>
                      {scene.start_timestamp} - {scene.end_timestamp || '?'}
                    </span>
                  </div>

                  <h4 style={{ color: '#007bff', margin: '0 0 1rem 0' }}>🎬 {getMovieTitle(scene.movie_id)}</h4>

                  <p style={{ lineHeight: '1.6', color: '#555' }}>{scene.description}</p>

                  {/* Tags */}
                  {scene.tags && (
                    <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {scene.tags.split(',').map((tag, idx) => (
                        <span key={idx} style={{ background: '#ffc107', color: '#333', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem' }}>
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
    </div>
  );
}