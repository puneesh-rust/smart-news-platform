from fastapi import FastAPI
from routes import headlines, recommend, auth
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(headlines.router)
app.include_router(recommend.router)
app.include_router(auth.router, prefix="/api/v1/users")  # ✅ prefix add kiya