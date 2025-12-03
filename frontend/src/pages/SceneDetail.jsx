import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function SceneDetail() {
  const { id } = useParams();
  const [scene, setScene] = useState(null);
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScene = async () => {
      try {
        const allScenesRes = await fetch(`http://localhost:8000/scenes?limit=1000`);
        const allScenesData = await allScenesRes.json();
        const foundScene = allScenesData.data.find(s => s.id === parseInt(id));

        if (foundScene) {
          setScene(foundScene);
          const movieRes = await fetch(`http://localhost:8000/movies/${foundScene.movie_id}`);
          if (movieRes.ok) {
            const movieData = await movieRes.json();
            setMovie(movieData);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchScene();
  }, [id]);

  const getEmbedUrl = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
  };

  if (loading) return <div className="text-center p-10 text-gray-500">Betöltés...</div>;
  if (!scene) return <div className="text-center p-10 text-red-500">Jelenet nem található.</div>;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <Link to="/scenes" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 mb-6">
        ← Vissza a jelenetekhez
      </Link>

      <div className="space-y-6">
        {/* Video Player - Cinema Mode */}
        <div className="relative aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-gray-800">
          {scene.video_url && (
            <iframe
              src={getEmbedUrl(scene.video_url)}
              title={scene.title}
              className="absolute top-0 left-0 w-full h-full"
              allowFullScreen
            />
          )}
        </div>

        {/* Info Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Content */}
          <div className="lg:col-span-2">
            <h1 className="text-3xl font-extrabold text-white mb-2">{scene.title}</h1>

            {movie && (
              <Link to={`/movies/${movie.id}`} className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium mb-6 transition-colors">
                🎬 {movie.title}
              </Link>
            )}

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">Leírás</h3>
              <p className="text-gray-300 leading-relaxed text-lg">
                {scene.description || "Nincs leírás."}
              </p>
            </div>
          </div>

          {/* Sidebar / Metadata */}
          <div className="space-y-4">
             <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h3 className="text-xs font-bold text-gray-500 uppercase mb-4">Adatok</h3>

                <div className="space-y-3">
                  <div className="flex justify-between border-b border-gray-800 pb-2">
                    <span className="text-gray-400">Kezdés</span>
                    <span className="font-mono text-white">{scene.start_timestamp}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-800 pb-2">
                    <span className="text-gray-400">Vége</span>
                    <span className="font-mono text-white">{scene.end_timestamp || '?'}</span>
                  </div>
                </div>

                <div className="mt-6">
                   <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">Címkék</h3>
                   <div className="flex flex-wrap gap-2">
                      {scene.tags ? scene.tags.split(',').map((tag, i) => (
                        <span key={i} className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-2 py-1 rounded text-sm hover:bg-yellow-500/20 cursor-default transition-colors">
                          #{tag.trim()}
                        </span>
                      )) : <span className="text-gray-600">-</span>}
                   </div>
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}