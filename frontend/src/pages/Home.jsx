import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  const [recentMovies, setRecentMovies] = useState([]);
  const [recentScenes, setRecentScenes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch only 4 items for the preview
        const moviesRes = await fetch('http://localhost:8000/movies?limit=4');
        const scenesRes = await fetch('http://localhost:8000/scenes?limit=4');

        if (moviesRes.ok && scenesRes.ok) {
          const moviesData = await moviesRes.json();
          const scenesData = await scenesRes.json();
          setRecentMovies(moviesData);
          setRecentScenes(scenesData);
        }
      } catch (err) {
        console.error("Failed to fetch home data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Betöltés...</div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>

      {/* 1. HERO SECTION */}
      <div style={{ textAlign: 'center', marginBottom: '3rem', padding: '2rem', background: '#f8f9fa', borderRadius: '8px' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Üdv a SceneVault-ban!</h1>
        <p style={{ fontSize: '1.2rem', color: '#666' }}>Gyűjtsd és rendszerezd kedvenc filmes jeleneteidet.</p>
        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link to="/movies" style={buttonStyle}>Böngéssz a Filmek között</Link>
          <Link to="/scenes" style={{ ...buttonStyle, background: '#6c757d' }}>Jelenetek keresése</Link>
        </div>
      </div>

      {/* 2. RECENT MOVIES GRID */}
      <SectionHeader title="Legújabb Filmek" link="/movies" />
      <div style={gridStyle}>
        {recentMovies.map(movie => (
          <div key={movie.id} style={cardStyle}>
            <div style={{ height: '200px', background: '#ddd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {movie.poster_url ? (
                <img src={movie.poster_url} alt={movie.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: '3rem' }}>🎬</span>
              )}
            </div>
            <div style={{ padding: '1rem' }}>
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>{movie.title}</h3>
              <p style={{ fontSize: '0.9rem', color: '#666' }}>{movie.year || 'Ismeretlen év'}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ margin: '3rem 0' }} />

      {/* 3. RECENT SCENES GRID */}
      <SectionHeader title="Legfrissebb Jelenetek" link="/scenes" />
      <div style={gridStyle}>
        {recentScenes.map(scene => (
          <div key={scene.id} style={cardStyle}>
            <div style={{ padding: '1rem' }}>
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>{scene.title}</h3>
              <p style={{ fontSize: '0.9rem', color: '#555' }}>
                <em>"{scene.description ? scene.description.substring(0, 50) + '...' : ''}"</em>
              </p>
              <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#888' }}>
                Idő: {scene.start_timestamp || '00:00'} - {scene.end_timestamp || '?'}
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

// --- Simple Sub-components & Styles ---

function SectionHeader({ title, link }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
      <h2 style={{ margin: 0 }}>{title}</h2>
      <Link to={link} style={{ color: '#007bff', textDecoration: 'none' }}>Összes megtekintése →</Link>
    </div>
  );
}

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
  gap: '1.5rem'
};

const cardStyle = {
  border: '1px solid #ddd',
  borderRadius: '8px',
  overflow: 'hidden',
  background: 'white',
  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
};

const buttonStyle = {
  display: 'inline-block',
  padding: '0.75rem 1.5rem',
  background: '#007bff',
  color: 'white',
  textDecoration: 'none',
  borderRadius: '4px',
  fontWeight: 'bold'
};