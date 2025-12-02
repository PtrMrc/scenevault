from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from typing import List, Optional
from contextlib import asynccontextmanager

from db import engine, create_db_and_tables
from models import User, Movie, Scene, UserRegister
from auth import (
    get_password_hash, verify_password, create_access_token,
    get_current_user, require_admin, oauth2_scheme
)
from fastapi.security import OAuth2PasswordRequestForm

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()  # Startup
    yield

app = FastAPI(title="SceneVault Backend", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- AUTH: register & token ----------
@app.post("/auth/register", response_model=dict)
def register(user_data: UserRegister):
    with Session(engine) as session:
        existing = session.exec(select(User).where(User.username == user_data.username)).first()
        if existing:
            raise HTTPException(status_code=400, detail="Username already registered")

        hashed_pwd = get_password_hash(user_data.password)

        user = User(
            username=user_data.username,
            email=user_data.email,
            hashed_password=hashed_pwd
        )

        session.add(user)
        session.commit()
        session.refresh(user)
        return {"username": user.username, "id": user.id}

@app.post("/auth/token")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    with Session(engine) as session:
        user = session.exec(select(User).where(User.username == form_data.username)).first()
        if not user or not verify_password(form_data.password, user.hashed_password):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect username or password")
        access_token = create_access_token(data={"sub": user.username})
        return {"access_token": access_token, "token_type": "bearer"}

# ---------- USERS ----------
@app.get("/users/me")
def read_users_me(current_user: User = Depends(get_current_user)):
    return {"id": current_user.id, "username": current_user.username, "email": current_user.email, "is_admin": current_user.is_admin}

# Admin-only: list users
@app.get("/users", response_model=List[dict])
def list_users(admin: User = Depends(require_admin)):
    with Session(engine) as session:
        users = session.exec(select(User)).all()
        return [{"id": u.id, "username": u.username, "email": u.email, "is_admin": u.is_admin} for u in users]

# ---------- MOVIES ----------
@app.post("/movies")
def create_movie(movie: Movie, current_user: User = Depends(get_current_user)):
    # allow any logged-in user to create a movie? If you want only admin, change dependency to require_admin
    with Session(engine) as session:
        session.add(movie)
        session.commit()
        session.refresh(movie)
        return movie

@app.get("/movies", response_model=List[Movie])
def get_movies(skip: int = 0, limit: int = 20):
    with Session(engine) as session:
        movies = session.exec(select(Movie).offset(skip).limit(limit)).all()
        return movies

@app.get("/movies/search", response_model=List[Movie])
def search_movies(q: str, skip: int = 0, limit: int = 20):
    with Session(engine) as session:
        # Search in title, description, director, and genres
        movies = session.exec(
            select(Movie).where(
                (Movie.title.contains(q)) |
                (Movie.description.contains(q)) |
                (Movie.director.contains(q)) |
                (Movie.genres.contains(q))
            ).offset(skip).limit(limit)
        ).all()
        return movies

@app.get("/movies/{movie_id}")
def get_movie(movie_id: int):
    with Session(engine) as session:
        movie = session.get(Movie, movie_id)
        if not movie:
            raise HTTPException(status_code=404, detail="Movie not found")
        return movie

# Admin-only delete
@app.delete("/movies/{movie_id}")
def delete_movie(movie_id: int, admin: User = Depends(require_admin)):
    with Session(engine) as session:
        movie = session.get(Movie, movie_id)
        if not movie:
            raise HTTPException(status_code=404, detail="Movie not found")
        session.delete(movie)
        session.commit()
        return {"ok": True}

# ---------- SCENES ----------
@app.post("/scenes")
def create_scene(scene: Scene, current_user: User = Depends(get_current_user)):
    # Attach the creator
    scene.created_by = current_user.id
    with Session(engine) as session:
        movie = session.get(Movie, scene.movie_id)
        if not movie:
            raise HTTPException(status_code=400, detail="Movie not found")
        session.add(scene)
        session.commit()
        session.refresh(scene)
        return scene

@app.get("/scenes", response_model=List[Scene])
def get_scenes(skip: int = 0, limit: int = 50):
    with Session(engine) as session:
        scenes = session.exec(select(Scene).offset(skip).limit(limit)).all()
        return scenes

@app.get("/scenes/search", response_model=List[Scene])
def search_scenes(q: str, skip: int = 0, limit: int = 50):
    with Session(engine) as session:
        # Search in title and description
        scenes = session.exec(
            select(Scene).where(
                (Scene.title.contains(q)) | (Scene.description.contains(q))
            ).offset(skip).limit(limit)
        ).all()
        return scenes

@app.get("/movies/{movie_id}/scenes", response_model=List[Scene])
def get_movie_scenes(movie_id: int):
    with Session(engine) as session:
        scenes = session.exec(select(Scene).where(Scene.movie_id == movie_id)).all()
        return scenes

@app.put("/scenes/{scene_id}")
def update_scene(scene_id: int, updated: Scene, current_user: User = Depends(get_current_user)):
    with Session(engine) as session:
        scene = session.get(Scene, scene_id)
        if not scene:
            raise HTTPException(status_code=404, detail="Scene not found")
        # only owner or admin can edit
        if scene.created_by != current_user.id and not current_user.is_admin:
            raise HTTPException(status_code=403, detail="Not allowed")
        scene.title = updated.title
        scene.description = updated.description
        scene.start_timestamp = updated.start_timestamp
        scene.end_timestamp = updated.end_timestamp
        scene.video_url = updated.video_url
        scene.image_url = updated.image_url
        scene.tags = updated.tags
        session.add(scene)
        session.commit()
        session.refresh(scene)
        return scene

@app.delete("/scenes/{scene_id}")
def delete_scene(scene_id: int, current_user: User = Depends(get_current_user)):
    with Session(engine) as session:
        scene = session.get(Scene, scene_id)
        if not scene:
            raise HTTPException(status_code=404, detail="Scene not found")
        # only owner or admin can delete
        if scene.created_by != current_user.id and not current_user.is_admin:
            raise HTTPException(status_code=403, detail="Not allowed")
        session.delete(scene)
        session.commit()
        return {"ok": True}
