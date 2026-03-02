from fastapi import FastAPI
from routes import auth, headlines

app = FastAPI()

app.include_router(auth.router)
app.include_router(headlines.router)

@app.get("/")
def home():
    return {"message": "News API running 🚀"}