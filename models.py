from database import Base
from sqlalchemy import create_engine, Column, Integer, String, Boolean

class Task(Base):
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    completed = Column(Boolean, default=False)
    priority = Column(Integer)
    up_to_date = Column(String)
    note = Column(String, nullable=True)