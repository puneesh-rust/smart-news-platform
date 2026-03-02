from fastapi import FastAPI # type: ignore
from pydantic import BaseModel
from typing import Optional

class RegisterUser (BaseModel):
    username:str
    email:str
    password:str

class LoginUser (BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    password: str