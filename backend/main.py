from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import jwt
from sqlalchemy.orm import Session

from backend import models
from backend import security
from backend import schemas
from backend.exceptions import TokenExpiredException, token_expire_handler
from backend.database import engine, get_db
from backend.routes import auth, tasks, users, pomodoro

ObserverTasker = FastAPI()
models.Base.metadata.create_all(bind=engine)

ObserverTasker.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

ObserverTasker.include_router(auth.router)
ObserverTasker.include_router(tasks.router)
ObserverTasker.include_router(users.router)
ObserverTasker.include_router(pomodoro.router)
ObserverTasker.add_exception_handler(TokenExpiredException, token_expire_handler)

