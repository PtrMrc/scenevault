import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function MovieDetail() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [scenes, setScenes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const movieRes = await fetch(`http://localhost:8000/movies/${id}`);
        const scenesRes = await fetch(`http://localhost:8000/movies/${id}/scenes`);

        if (movieRes.ok && scenesRes.ok) {
          setMovie(await movieRes.json());
          setScenes(await scenesRes.json());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="text-center p-10 text-gray-500">Betöltés...</div>;
  if (!movie) return <div className="text-center p-10 text-red-500">Film nem található.</div>;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <Link to="/movies" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 mb-6">
        ← Vissza a filmekhez
      </Link>

      {/* Movie Info Section */}
      <div className="flex flex-col md:flex-row gap-8 bg-gray-900/50 p-8 rounded-2xl border border-gray-800 shadow-xl">
        {/* Poster */}
        <div className="flex-shrink-0 mx-auto md:mx-0">
          {movie.poster_url ? (
            <img
              src={movie.poster_url}
              alt={movie.title}
              className="w-64 rounded-lg shadow-2xl border border-gray-800"
            />
          ) : (
             <div className="w-64 h-96 bg-gray-800 rounded-lg flex items-center justify-center text-4xl">🎬</div>
          )}
        </div>

        {/* Details */}
        <div className="flex-1">
          <h1 className="text-4xl font-extrabold text-white mb-2">
            {movie.title} <span className="text-gray-500 font-normal text-3xl">({movie.year})</span>
          </h1>
          <p className="text-red-500 font-medium mb-6">{movie.director}</p>

          <div className="bg-black/30 p-6 rounded-xl border border-gray-800">
            <h3 className="text-sm font-bold text-gray-400 uppercase mb-2">Történet</h3>
            <p className="text-gray-300 leading-relaxed text-lg">
              {movie.description || "Nincs leírás."}
            </p>
          </div>
        </div>
      </div>

      <div className="my-12 border-t border-gray-800"></div>

      {/* Linked Scenes Section */}
      <div className="flex justify-between items-end mb-6">
        <h2 className="text-2xl font-bold text-white">
          Jelenetek ebből a filmből
          <span className="ml-3 text-sm bg-gray-800 text-gray-400 py-1 px-3 rounded-full">{scenes.length}</span>
        </h2>
      </div>

      {scenes.length === 0 ? (
        <p className="text-gray-500 italic">Nincsenek feltöltött jelenetek ehhez a filmhez.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {scenes.map(scene => (
            <Link key={scene.id} to={`/scenes/${scene.id}`} className="group">
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-gray-600 hover:bg-gray-800 transition-all duration-300">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors">
                    {scene.title}
                  </h3>
                  <span className="text-xs font-mono bg-black text-gray-400 px-2 py-1 rounded">
                    {scene.start_timestamp}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                  {scene.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}