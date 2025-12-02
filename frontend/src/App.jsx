import { Routes, Route } from 'react-router-dom';
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Movies from "./pages/Movies";
import Scenes from "./pages/Scenes";
import AdminDashboard from "./pages/AdminDashboard";
import Profile from "./pages/Profile";
import MovieDetail from "./pages/MovieDetail";
import SceneDetail from "./pages/SceneDetail";

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/scenes" element={<Scenes />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/movies/:id" element={<MovieDetail />} />
        <Route path="/scenes/:id" element={<SceneDetail />} />
      </Routes>
    </>
  );
}