"""
Database configuration and connection management.
Sets up the PostgreSQL engine and provides the session dependency for FastAPI routes.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from src.config import settings

DATABASE_URL = settings.database_url


engine = create_engine(DATABASE_URL)

# SessionLocal is a factory that generates new database sessions for each request
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Base class that all database models will inherit from to be mapped to tables
Base = declarative_base()

