# routes/headlines.py

from fastapi import APIRouter
from typing import Optional
from db.database import get_connection
from models.headline import HeadlineResponse

router = APIRouter(prefix="/headlines", tags=["Headlines"])

@router.get("/", response_model=list[HeadlineResponse])
def get_headlines(date: Optional[str] = None, category: Optional[str] = None):

    conn = get_connection()
    cur = conn.cursor()

    query = """
    SELECT id, title, link, date, category, description, source
    FROM headlines
    WHERE 1=1
    """

    params = []

    if date:
        query += " AND DATE(date AT TIME ZONE 'Asia/Kolkata') = %s"
        params.append(date)

    if category:
        query += " AND LOWER(category) = LOWER(%s)"
        params.append(category)

    query += " ORDER BY date DESC"

    cur.execute(query, tuple(params))
    rows = cur.fetchall()

    headlines = [
        {
            "id": row[0],
            "title": row[1],
            "link": row[2],
            "date": row[3],
            "category": row[4],
            "description": row[5],
            "source": row[6],
        }
        for row in rows
    ]

    return headlines