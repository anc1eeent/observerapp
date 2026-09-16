from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
import jwt
from sqlalchemy.orm import Session
from src.users import models, schemas, security, service
from src.dependencies import get_db
from src.exceptions import TokenExpiredException

router = APIRouter(tags=["Authentication"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="users/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(status_code=401, detail="Could not validate credentials")
    try:
       payload = jwt.decode(token, security.SECRET_KEY, algorithms=[security.ALGORITHM])
       username = payload.get("sub")
       if username is None:
            raise credentials_exception
    except jwt.ExpiredSignatureError:
        raise TokenExpiredException()

    db_user = db.query(models.User).filter(models.User.username == username).first()
    if db_user is None:
        raise credentials_exception
    return db_user
