from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import src.db_models  # noqa: F401  (registers all ORM models before any request)

from src.users.router import router as users_router
from src.tasks.router import router as tasks_router
from src.pomodoro.router import router as pomodoro_router

from src.exceptions import TokenExpiredException, token_expire_handler

ObserverTasker = FastAPI(title="ObserverTasker API", version="2.0.0")


ObserverTasker.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

ObserverTasker.include_router(users_router)
ObserverTasker.include_router(tasks_router)
ObserverTasker.include_router(pomodoro_router)

ObserverTasker.add_exception_handler(TokenExpiredException, token_expire_handler)