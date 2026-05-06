"""
SQLAlchemy setup. SQLite for dev/demo; swap DATABASE_URL for PostgreSQL in production.
Each FastAPI request gets its own session via get_db() dependency.
Session is always closed after the request via the finally block.
"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "sqlite:///./safeswitch.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
