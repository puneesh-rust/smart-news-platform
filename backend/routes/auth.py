from fastapi import APIRouter, HTTPException
from models.user import RegisterUser, LoginUser
from db.database import get_connection
from passlib.context import CryptContext
import jwt
from datetime import datetime, timedelta
from config import SECRET_KEY, ALGORITHM

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain, hashed):
    return pwd_context.verify(plain, hashed)

def create_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=60)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

@router.post("/register")
def register(user: RegisterUser):
    conn = get_connection()
    cursor = conn.cursor()

    hashed = hash_password(user.password)

    try:
        cursor.execute("""
            INSERT INTO users (username, email, password)
            VALUES (%s, %s, %s)
        """, (user.username, user.email, hashed))
        conn.commit()
    except Exception:
        raise HTTPException(status_code=400, detail="User already exists")

    cursor.close()
    conn.close()

    return {"message": "User registered successfully"}

@router.post("/login")
def login(user: LoginUser):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id, username, email, password
        FROM users
        WHERE email = %s OR username = %s
    """, (user.email, user.username))

    db_user = cursor.fetchone()
    cursor.close()
    conn.close()

    if not db_user or not verify_password(user.password, db_user[3]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_token({"user_id": db_user[0]})

    return {"access_token": token, "token_type": "bearer"}
     