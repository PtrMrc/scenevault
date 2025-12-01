from typing import Optional
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime, timezone

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True)
    email: Optional[str] = None
    hashed_password: str
    is_admin: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Movie(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    year: Optional[int] = None
    description: Optional[str] = None
    director: Optional[str] = None
    duration: Optional[int] = None
    genres: Optional[str] = None
    poster_url: Optional[str] = None
    imdb_rating: Optional[float] = None

class Scene(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    movie_id: int = Field(foreign_key="movie.id")
    title: str
    timestamp: Optional[str] = None
    description: Optional[str] = None
    created_by: Optional[int] = Field(default=None, foreign_key="user.id")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserRegister(SQLModel):
    username: str
    password: str
    email: Optional[str] = None