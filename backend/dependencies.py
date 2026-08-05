# from fastapi import Depends, HTTPException, status
# from fastapi.security import OAuth2PasswordBearer
# from jose import JWTError, jwt
# # from backend.auth.auth_utils import get_user_by_email
# from utils.logger import logger
# from backend.database.db import get_db
# from sqlalchemy.orm import Session
# import os

# oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey")
# ALGORITHM = "HS256"

# def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
#     """
#     Validates JWT token and returns the authenticated user object.
#     """
#     try:
#         payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
#         email: str = payload.get("sub")
#         if email is None:
#             raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
#         user = get_user_by_email(db, email=email)
#         if user is None:
#             raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
#         logger.info(f"Authenticated user: {user.email}")
#         return user
#     except JWTError as e:
#         logger.warning(f"JWT decode error: {e}")
#         raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")


from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from backend.database.db import get_db
from backend.auth.models import User
from backend.utils.logger import logger
import os

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey")
ALGORITHM = "HS256"


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    Validates JWT token and returns the authenticated user object.
    Uses `sub` = user.id (NOT email).
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str | None = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError as e:
        logger.warning(f"JWT decode error: {e}")
        raise credentials_exception

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception

    logger.info(f"Authenticated user: {user.email}")
    return user