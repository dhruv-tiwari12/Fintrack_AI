from sqlalchemy import Column, String, Boolean
from backend.database.db import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)  # UUID
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    disabled = Column(Boolean, default=False)
