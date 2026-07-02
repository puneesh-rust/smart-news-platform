from fastapi import FastAPI
from routes import headlines, recommend, auth
from fastapi.middleware.cors import CORSMiddleware

import asyncio
from services.summarizer import process_pending_news

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(headlines.router)
app.include_router(recommend.router)
app.include_router(auth.router, prefix="/api/v1/users")

# ✅ BACKGROUND WORKER
async def summary_worker():
    while True:
        print("🧠 Running summarization...")
        process_pending_news()
        await asyncio.sleep(60)

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(summary_worker())