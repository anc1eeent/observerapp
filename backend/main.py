from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
import jwt
from sqlalchemy.orm import Session

import models
import security
import schemas
from database import engine, get_db
from routes import auth

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

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(status_code=401, detail="Could not validate credentials")
    try:
       payload = jwt.decode(token, security.SECRET_KEY, algorithms=[security.ALGORITHM])
       username = payload.get("sub")
       if username is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception

    db_user = db.query(models.User).filter(models.User.username == username).first()
    if db_user is None:
        raise credentials_exception
    return db_user

@ObserverTasker.get("/tasks")

def get_tasks(current_user: models.User = Depends(get_current_user)):
    return [{"title": "My first task"}]