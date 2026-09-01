from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
import jwt
from sqlalchemy.orm import Session

from backend import models
from backend import security
from backend import schemas
from backend.database import engine, get_db
from backend.routes import auth, tasks

ObserverTasker = FastAPI()
models.Base.metadata.create_all(bind=engine)

ObserverTasker.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ObserverTasker.include_router(auth.router)
ObserverTasker.include_router(tasks.router)


