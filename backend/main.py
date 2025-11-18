from fastapi import FastAPI, HTTPException
from sqlmodel import Session, select
from models import Movie, Scene
from db import engine, create_db

app = FastAPI()

create_db()

# ---------------------
# MOVIES ENDPOINTS
# ---------------------

@app.post("/movies")
def add_movie(movie: Movie):
    with Session(engine) as session:
        session.add(movie)
        session.commit()
        session.refresh(movie)
        return movie

@app.get("/movies")
def list_movies():
    with Session(engine) as session:
        movies = session.exec(select(Movie)).all()
        return movies


# ---------------------
# SCENES ENDPOINTS
# ---------------------

@app.post("/scenes")
def add_scene(scene: Scene):
    # Ellenőrizzük, hogy a movie_id létezik-e
    with Session(engine) as session:
        movie = session.get(Movie, scene.movie_id)
        if not movie:
            raise HTTPException(status_code=400, detail="Movie not found")

        session.add(scene)
        session.commit()
        session.refresh(scene)
        return scene

@app.get("/scenes")
def list_scenes():
    with Session(engine) as session:
        scenes = session.exec(select(Scene)).all()
        return scenes
