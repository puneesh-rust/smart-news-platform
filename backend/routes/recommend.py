# routes/recommend.py

from fastapi import APIRouter
from services.recommendation_service import recommend_news

router = APIRouter(prefix="/recommend", tags=["Recommendation"])


@router.get("/")
def recommend(title: str):
    # ✅ Returns [] when no results found — does NOT raise 404.
    # Raising HTTPException(404) caused the frontend's !res.ok check
    # to throw and display nothing.
    recommendations = recommend_news(title)
    return recommendations