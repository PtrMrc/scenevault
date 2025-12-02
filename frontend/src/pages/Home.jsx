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
          setRecentMovies(moviesData.data);
          setRecentScenes(scenesData.data);
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
    <div className="max-w-7xl mx-auto px-6 py-10">

      {/* 1. HERO SECTION */}
      <div className="relative mb-16 bg-gradient-to-r from-gray-900 to-black rounded-2xl p-12 text-center border border-gray-800 shadow-2xl overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-5xl font-extrabold mb-4 text-white tracking-tight">
            Üdv a <span className="text-red-600">SceneVault</span>-ban
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            A kedvenc filmes pillanataid gyűjteménye. Fedezd fel, mentsd el és rendszerezd a legemlékezetesebb jeleneteket.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/movies" className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-transform hover:scale-105">
              Böngéssz a Filmek között
            </Link>
            <Link to="/scenes" className="px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition-transform hover:scale-105">
              Jelenetek keresése
            </Link>
          </div>
        </div>
      </div>

      {/* 2. RECENT MOVIES GRID */}
      <div className="mb-16">
        <SectionHeader title="Legújabb Filmek" link="/movies" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {recentMovies.map(movie => (
            <Link key={movie.id} to={`/movies/${movie.id}`} className="group block">
              <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 transition-all duration-300 group-hover:scale-105 group-hover:border-gray-600 shadow-lg h-full">
                <div className="h-64 bg-gray-800 relative overflow-hidden">
                  {movie.poster_url ? (
                    <img src={movie.poster_url} alt={movie.title} className="w-full h-full object-cover group-hover:opacity-80 transition-opacity" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">🎬</div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg truncate group-hover:text-red-500 transition-colors">{movie.title}</h3>
                  <p className="text-sm text-gray-500">{movie.year || 'Ismeretlen év'}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div style={{ margin: '3rem 0' }} />

      {/* 3. RECENT SCENES GRID */}
      <div className="mb-12">
        <SectionHeader title="Legfrissebb Jelenetek" link="/scenes" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {recentScenes.map(scene => (
            <Link key={scene.id} to={`/scenes/${scene.id}`} className="group block">
              <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-gray-600 transition-all duration-300 h-full flex flex-col">
                 {/* Preview Image (Placeholder or Actual) */}
                 <div className="h-40 bg-black flex items-center justify-center relative">
                    {scene.image_url ? (
                        <img src={scene.image_url} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                    ) : (
                        <span className="text-3xl">▶️</span>
                    )}
                    <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                        {scene.start_timestamp}
                    </div>
                 </div>

                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-bold text-white mb-2 line-clamp-1 group-hover:text-blue-400 transition-colors">{scene.title}</h3>
                  <p className="text-sm text-gray-400 line-clamp-3 mb-4 flex-1">
                    "{scene.description}"
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}

// --- Simple Sub-components & Styles ---
function SectionHeader({ title, link }) {
  return (
    <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
      <h2 className="text-3xl font-bold text-white tracking-wide border-l-4 border-red-600 pl-4">
        {title}
      </h2>
      <Link
        to={link}
        className="group flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-full text-sm font-medium transition-all"
      >
        Összes megjelenítése
        <span className="group-hover:translate-x-1 transition-transform">→</span>
      </Link>
    </div>
  );
}