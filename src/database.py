"""
Database configuration and connection management.
Sets up the PostgreSQL engine and provides the session dependency for FastAPI routes.
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL environment variable is required.")


engine = create_engine(DATABASE_URL)

# SessionLocal is a factory that generates new database sessions for each request
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Base class that all database models will inherit from to be mapped to tables
Base = declarative_base()

