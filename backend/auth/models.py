# from sqlalchemy import Column, String, Boolean
# from backend.database.db import Base

# class User(Base):
#     __tablename__ = "users"

#     id = Column(String, primary_key=True, index=True)      # uuid
#     username = Column(String, unique=True, nullable=False)
#     email = Column(String, unique=True, nullable=False, index=True)
#     hashed_password = Column(String, nullable=False)
#     disabled = Column(Boolean, default=False)

from sqlalchemy import Column, String, Boolean
from backend.database.db import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    username = Column(String, nullable=False)  # Remove unique=True
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    disabled = Column(Boolean, default=False)