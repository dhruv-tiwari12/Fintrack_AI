# # # backend/auth/routes.py

# # from fastapi import APIRouter, Depends, HTTPException, Request
# # from sqlalchemy.orm import Session
# # from fastapi.security import OAuth2PasswordRequestForm
# # from backend.auth.models import User
# # from backend.auth.schemas import UserCreate, UserOut, Token
# # from backend.auth.auth_utils import (
# #     hash_password,
# #     verify_password,
# #     create_access_token,
# # )
# # from backend.dependencies import get_current_user
# # from backend.database.db import get_db
# # from backend.utils.logger import logger
# # from google.oauth2 import id_token
# # from google.auth.transport import requests
# # import uuid
# # import os
# # from datetime import timedelta
# # from dotenv import load_dotenv
# # load_dotenv()

# # router = APIRouter(prefix="/auth", tags=["Auth"])


# # # ------------------------- NORMAL SIGNUP ------------------------- #
# # @router.post("/signup", response_model=UserOut)
# # def signup(user: UserCreate, db: Session = Depends(get_db)):
# #     logger.info(f"Signup attempt: {user.email}")

# #     if db.query(User).filter(User.email == user.email).first():
# #         raise HTTPException(status_code=400, detail="Email already registered")

# #     if db.query(User).filter(User.username == user.username).first():
# #         raise HTTPException(status_code=400, detail="Username already taken")

# #     new_user = User(
# #         id=str(uuid.uuid4()),
# #         username=user.username,
# #         email=user.email,
# #         hashed_password=hash_password(user.password),
# #     )
# #     db.add(new_user)
# #     db.commit()
# #     db.refresh(new_user)

# #     return new_user


# # # -------------------------- NORMAL LOGIN ------------------------- #
# # @router.post("/login", response_model=Token)
# # def login(
# #     form_data: OAuth2PasswordRequestForm = Depends(),
# #     db: Session = Depends(get_db),
# # ):
# #     logger.info(f"Login attempt: {form_data.username}")

# #     user = db.query(User).filter(User.email == form_data.username).first()
# #     if not user or not verify_password(form_data.password, user.hashed_password):
# #         raise HTTPException(status_code=400, detail="Incorrect email or password")

# #     access_token = create_access_token(
# #         data={"sub": user.id},
# #         expires_delta=timedelta(hours=24),
# #     )
# #     return {
# #         "access_token": access_token,
# #         "token_type": "bearer",
# #         "user_uuid": user.id,
# #     }


# # # ----------------------- GOOGLE LOGIN ---------------------------- #
# # @router.post("/google", response_model=Token)
# # async def google_auth(request: Request, db: Session = Depends(get_db)):
# #     """
# #     Accepts Google ID token from frontend (field: `credential`),
# #     verifies it, creates/fetches user, and returns our JWT.
# #     """
# #     try:
# #         body = await request.json()
# #         print("=" * 60)
# #         print("DEBUG: Full request body:", body)
# #         print("DEBUG: Body type:", type(body))
# #         print("=" * 60)
# #     except Exception as e:
# #         print(f"ERROR: Could not parse JSON: {e}")
# #         raise HTTPException(status_code=400, detail=f"Invalid JSON: {str(e)}")

# #     credential = body.get("credential")
# #     print(f"DEBUG: Credential extracted: {credential[:50] if credential else 'None'}...")
    
# #     if not credential:
# #         logger.error("Missing credential field from Google")
# #         raise HTTPException(
# #             status_code=422,
# #             detail="Missing Google credential",
# #         )

# #     try:
# #         client_id = os.getenv("GOOGLE_CLIENT_ID")
# #         print(f"DEBUG: GOOGLE_CLIENT_ID from env: {client_id}")
        
# #         if not client_id:
# #             logger.error("GOOGLE_CLIENT_ID not set in environment")
# #             raise HTTPException(
# #                 status_code=500,
# #                 detail="Google OAuth not configured",
# #             )

# #         print("DEBUG: About to verify token with Google...")
# #         idinfo = id_token.verify_oauth2_token(
# #             credential,
# #             requests.Request(),
# #             client_id,
# #         )
# #         print("DEBUG: Token verified successfully!")
# #         print(f"DEBUG: User email from Google: {idinfo.get('email')}")

# #         email = idinfo["email"]
# #         name = idinfo.get("name", email.split("@")[0])

# #     except ValueError as ve:
# #         print(f"ERROR: Token verification failed (ValueError): {ve}")
# #         logger.error(f"Google ID token verification failed: {ve}")
# #         raise HTTPException(
# #             status_code=400,
# #             detail=f"Invalid Google token: {str(ve)}",
# #         )
# #     except Exception as e:
# #         print(f"ERROR: Token verification failed (General): {e}")
# #         logger.error(f"Google ID token verification failed: {e}")
# #         raise HTTPException(
# #             status_code=400,
# #             detail=f"Invalid Google token: {str(e)}",
# #         )

# #     # Find or create user
# #     user = db.query(User).filter(User.email == email).first()

# #     if not user:
# #         user = User(
# #             id=str(uuid.uuid4()),
# #             username=name,
# #             email=email,
# #             # random password, user won't use it for Google login
# #             hashed_password=hash_password(uuid.uuid4().hex),
# #         )
# #         db.add(user)
# #         db.commit()
# #         db.refresh(user)
# #         logger.info(f"Created new user via Google: {email}")
# #     else:
# #         logger.info(f"Existing user logged in via Google: {email}")

# #     access_token = create_access_token(
# #         data={"sub": user.id},
# #         expires_delta=timedelta(hours=24),
# #     )

# #     return {
# #         "access_token": access_token,
# #         "token_type": "bearer",
# #         "user_uuid": user.id,
# #     }


# # # -------------------------- CURRENT USER ------------------------- #
# # @router.get("/me", response_model=UserOut)
# # def read_current_user(current_user: User = Depends(get_current_user)):
# #     return current_user

# # backend/auth/routes.py

# from fastapi import APIRouter, Depends, HTTPException, Request
# from sqlalchemy.orm import Session
# from fastapi.security import OAuth2PasswordRequestForm
# from backend.auth.models import User
# from backend.auth.schemas import UserCreate, UserOut, Token
# from backend.auth.auth_utils import (
#     hash_password,
#     verify_password,
#     create_access_token,
# )
# from backend.dependencies import get_current_user
# from backend.database.db import get_db
# from backend.utils.logger import logger
# from google.oauth2 import id_token
# from google.auth.transport import requests
# import uuid
# import os
# from datetime import timedelta
# from dotenv import load_dotenv
# load_dotenv()

# router = APIRouter(prefix="/auth", tags=["Auth"])


# # ------------------------- NORMAL SIGNUP ------------------------- #
# @router.post("/signup", response_model=UserOut)
# def signup(user: UserCreate, db: Session = Depends(get_db)):
#     logger.info(f"Signup attempt: {user.email}")

#     if db.query(User).filter(User.email == user.email).first():
#         logger.warning(f"Signup failed: Email already registered - {user.email}")
#         raise HTTPException(status_code=400, detail="Email already registered")

#     if db.query(User).filter(User.username == user.username).first():
#         logger.warning(f"Signup failed: Username already taken - {user.username}")
#         raise HTTPException(status_code=400, detail="Username already taken")

#     new_user = User(
#         id=str(uuid.uuid4()),
#         username=user.username,
#         email=user.email,
#         hashed_password=hash_password(user.password),
#     )
#     db.add(new_user)
#     db.commit()
#     db.refresh(new_user)
    
#     logger.info(f"✅ User created successfully: {new_user.email} (ID: {new_user.id})")
#     return new_user


# # -------------------------- NORMAL LOGIN ------------------------- #
# @router.post("/login", response_model=Token)
# def login(
#     form_data: OAuth2PasswordRequestForm = Depends(),
#     db: Session = Depends(get_db),
# ):
#     logger.info(f"Login attempt: {form_data.username}")

#     user = db.query(User).filter(User.email == form_data.username).first()
#     if not user or not verify_password(form_data.password, user.hashed_password):
#         logger.warning(f"Login failed: Incorrect credentials for {form_data.username}")
#         raise HTTPException(status_code=400, detail="Incorrect email or password")

#     access_token = create_access_token(
#         data={"sub": user.id},
#         expires_delta=timedelta(hours=24),
#     )
    
#     logger.info(f"✅ User logged in successfully: {user.email}")
#     return {
#         "access_token": access_token,
#         "token_type": "bearer",
#         "user_uuid": user.id,
#     }


# # ----------------------- GOOGLE LOGIN ---------------------------- #
# @router.post("/google", response_model=Token)
# async def google_auth(request: Request, db: Session = Depends(get_db)):
#     """
#     Accepts Google ID token from frontend (field: `credential`),
#     verifies it, creates/fetches user, and returns our JWT.
#     """
#     logger.info("🔵 Google OAuth attempt started")
    
#     try:
#         body = await request.json()
#         logger.debug(f"Request body received: {list(body.keys())}")
#     except Exception as e:
#         logger.error(f"❌ Failed to parse JSON request: {e}")
#         raise HTTPException(status_code=400, detail=f"Invalid JSON: {str(e)}")

#     credential = body.get("credential")
    
#     if not credential:
#         logger.error("❌ Missing credential field from Google")
#         raise HTTPException(
#             status_code=422,
#             detail="Missing Google credential",
#         )
    
#     logger.info(f"Credential received (length: {len(credential)})")

#     try:
#         client_id = os.getenv("GOOGLE_CLIENT_ID")
        
#         if not client_id:
#             logger.error("❌ GOOGLE_CLIENT_ID not set in environment")
#             raise HTTPException(
#                 status_code=500,
#                 detail="Google OAuth not configured",
#             )
        
#         logger.info(f"Using GOOGLE_CLIENT_ID: {client_id[:20]}...")

#         logger.info("Verifying token with Google...")
#         idinfo = id_token.verify_oauth2_token(
#             credential,
#             requests.Request(),
#             client_id,
#         )
#         logger.info("✅ Token verified successfully!")

#         email = idinfo["email"]
#         name = idinfo.get("name", email.split("@")[0])
#         google_id = idinfo.get("sub")
        
#         logger.info(f"Google user info - Email: {email}, Name: {name}, Google ID: {google_id}")

#     except ValueError as ve:
#         logger.error(f"❌ Token verification failed (ValueError): {ve}")
#         raise HTTPException(
#             status_code=400,
#             detail=f"Invalid Google token: {str(ve)}",
#         )
#     except Exception as e:
#         logger.error(f"❌ Token verification failed (General): {e}")
#         raise HTTPException(
#             status_code=400,
#             detail=f"Invalid Google token: {str(e)}",
#         )

#     # Find or create user
#     logger.info(f"Checking if user exists with email: {email}")
#     user = db.query(User).filter(User.email == email).first()

#     if not user:
#         logger.info(f"User not found. Creating new user for {email}...")
        
#         new_user_id = str(uuid.uuid4())
#         user = User(
#             id=new_user_id,
#             username=name,
#             email=email,
#             # random password, user won't use it for Google login
#             hashed_password=hash_password(uuid.uuid4().hex),
#         )
        
#         logger.info(f"Adding user to database: ID={new_user_id}, Email={email}, Username={name}")
#         db.add(user)
        
#         try:
#             db.commit()
#             logger.info("✅ Database commit successful")
#         except Exception as commit_error:
#             logger.error(f"❌ Database commit failed: {commit_error}")
#             db.rollback()
#             raise HTTPException(status_code=500, detail="Failed to create user")
        
#         db.refresh(user)
#         logger.info(f"✅ NEW USER CREATED via Google: {email} (ID: {user.id})")
        
#         # Verify user was created
#         verify_user = db.query(User).filter(User.email == email).first()
#         if verify_user:
#             logger.info(f"✅ Verification: User found in database after creation")
#         else:
#             logger.error(f"❌ Verification FAILED: User NOT found in database after creation!")
#     else:
#         logger.info(f"✅ EXISTING USER logged in via Google: {email} (ID: {user.id})")

#     # Generate access token
#     logger.info(f"Generating access token for user: {user.email}")
#     access_token = create_access_token(
#         data={"sub": user.id},
#         expires_delta=timedelta(hours=24),
#     )

#     logger.info(f"✅ Google OAuth completed successfully for {email}")
    
#     return {
#         "access_token": access_token,
#         "token_type": "bearer",
#         "user_uuid": user.id,
#     }


# # -------------------------- CURRENT USER ------------------------- #
# @router.get("/me", response_model=UserOut)
# def read_current_user(current_user: User = Depends(get_current_user)):
#     logger.info(f"Current user fetched: {current_user.email}")
#     return current_user


from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from backend.auth.models import User
from backend.auth.schemas import UserCreate, UserOut, Token
from backend.auth.auth_utils import (
    hash_password,
    verify_password,
    create_access_token,
)
from backend.dependencies import get_current_user
from backend.database.db import get_db
from backend.utils.logger import logger
from google.oauth2 import id_token
from google.auth.transport import requests
import uuid
import os
from datetime import timedelta
from dotenv import load_dotenv
load_dotenv()

router = APIRouter(prefix="/auth", tags=["Auth"])


# ------------------------- NORMAL SIGNUP ------------------------- #
@router.post("/signup", response_model=UserOut)
def signup(user: UserCreate, db: Session = Depends(get_db)):
    logger.info(f"Signup attempt: {user.email}")

    if db.query(User).filter(User.email == user.email).first():
        logger.warning(f"Signup failed: Email already registered - {user.email}")
        raise HTTPException(status_code=400, detail="Email already registered")

    if db.query(User).filter(User.username == user.username).first():
        logger.warning(f"Signup failed: Username already taken - {user.username}")
        raise HTTPException(status_code=400, detail="Username already taken")

    new_user = User(
        id=str(uuid.uuid4()),
        username=user.username,
        email=user.email,
        hashed_password=hash_password(user.password),
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    logger.info(f"✅ User created successfully: {new_user.email} (ID: {new_user.id})")
    return new_user


# -------------------------- NORMAL LOGIN ------------------------- #
@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    logger.info(f"Login attempt: {form_data.username}")

    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        logger.warning(f"Login failed: Incorrect credentials for {form_data.username}")
        raise HTTPException(status_code=400, detail="Incorrect email or password")

    access_token = create_access_token(
        data={"sub": user.id},
        expires_delta=timedelta(hours=24),
    )
    
    logger.info(f"✅ User logged in successfully: {user.email}")
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_uuid": user.id,
    }


# ----------------------- GOOGLE LOGIN ---------------------------- #
@router.post("/google", response_model=Token)
async def google_auth(request: Request, db: Session = Depends(get_db)):
    """
    Accepts Google ID token from frontend (field: `credential`),
    verifies it, creates/fetches user, and returns our JWT.
    """
    logger.info("🔵 Google OAuth attempt started")
    
    try:
        body = await request.json()
        logger.debug(f"Request body received: {list(body.keys())}")
    except Exception as e:
        logger.error(f"❌ Failed to parse JSON request: {e}")
        raise HTTPException(status_code=400, detail=f"Invalid JSON: {str(e)}")

    credential = body.get("credential")
    
    if not credential:
        logger.error("❌ Missing credential field from Google")
        raise HTTPException(
            status_code=422,
            detail="Missing Google credential",
        )
    
    logger.info(f"Credential received (length: {len(credential)})")

    try:
        client_id = os.getenv("GOOGLE_CLIENT_ID")
        
        if not client_id:
            logger.error("❌ GOOGLE_CLIENT_ID not set in environment")
            raise HTTPException(
                status_code=500,
                detail="Google OAuth not configured",
            )
        
        logger.info(f"Using GOOGLE_CLIENT_ID: {client_id[:20]}...")

        logger.info("Verifying token with Google...")
        idinfo = id_token.verify_oauth2_token(
            credential,
            requests.Request(),
            client_id,
        )
        logger.info("✅ Token verified successfully!")

        email = idinfo["email"]
        full_name = idinfo.get("name", email.split("@")[0])
        # Extract first name from full name, or use email username as fallback
        first_name = full_name.split()[0] if full_name else email.split("@")[0]
        google_id = idinfo.get("sub")
        
        logger.info(f"Google user info - Email: {email}, Full Name: {full_name}, First Name: {first_name}, Google ID: {google_id}")

    except ValueError as ve:
        logger.error(f"❌ Token verification failed (ValueError): {ve}")
        raise HTTPException(
            status_code=400,
            detail=f"Invalid Google token: {str(ve)}",
        )
    except Exception as e:
        logger.error(f"❌ Token verification failed (General): {e}")
        raise HTTPException(
            status_code=400,
            detail=f"Invalid Google token: {str(e)}",
        )

    # Find or create user
    logger.info(f"Checking if user exists with email: {email}")
    user = db.query(User).filter(User.email == email).first()

    if not user:
        logger.info(f"User not found. Creating new user for {email}...")
        
        new_user_id = str(uuid.uuid4())
        user = User(
            id=new_user_id,
            username=first_name,  # Use first name only
            email=email,
            # random password, user won't use it for Google login
            hashed_password=hash_password(uuid.uuid4().hex),
        )
        
        logger.info(f"Adding user to database: ID={new_user_id}, Email={email}, Username={first_name}")
        db.add(user)
        
        try:
            db.commit()
            logger.info("✅ Database commit successful")
        except Exception as commit_error:
            logger.error(f"❌ Database commit failed: {commit_error}")
            db.rollback()
            raise HTTPException(status_code=500, detail="Failed to create user")
        
        db.refresh(user)
        logger.info(f"✅ NEW USER CREATED via Google: {email} (ID: {user.id})")
        
        # Verify user was created
        verify_user = db.query(User).filter(User.email == email).first()
        if verify_user:
            logger.info(f"✅ Verification: User found in database after creation")
        else:
            logger.error(f"❌ Verification FAILED: User NOT found in database after creation!")
    else:
        logger.info(f"✅ EXISTING USER logged in via Google: {email} (ID: {user.id})")

    # Generate access token
    logger.info(f"Generating access token for user: {user.email}")
    access_token = create_access_token(
        data={"sub": user.id},
        expires_delta=timedelta(hours=24),
    )

    logger.info(f"✅ Google OAuth completed successfully for {email}")
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_uuid": user.id,
    }


# -------------------------- CURRENT USER ------------------------- #
@router.get("/me", response_model=UserOut)
def read_current_user(current_user: User = Depends(get_current_user)):
    logger.info(f"Current user fetched: {current_user.email}")
    return current_user