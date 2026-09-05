"""
Database configuration and connection management.
Sets up the SQLite engine and provides the session dependency for FastAPI routes.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base, Session

# The URL for the SQLite database file (created in the root directory)
DATABASE_URL = "sqlite:///./observertasker.db"


engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

# SessionLocal is a factory that generates new database sessions for each request
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Base class that all database models will inherit from to be mapped to tables
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()