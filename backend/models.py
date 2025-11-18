from sqlmodel import SQLModel, Field
from typing import Optional

class Movie(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    year: Optional[int] = None
    description: Optional[str] = None
    director: Optional[str] = None
    duration: Optional[int] = None  # percben
    genres: Optional[str] = None     # "action, sci-fi"
    poster_url: Optional[str] = None
    imdb_rating: Optional[float] = None

class Scene(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    movie_id: int
    title: str
    timestamp: Optional[str] = None
    description: Optional[str] = None
