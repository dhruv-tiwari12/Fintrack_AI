from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: str
    username: str
    email: EmailStr
    model_config = {
        "from_attributes": True 
    }

class Token(BaseModel):
    access_token: str
    token_type: str
    user_uuid: str