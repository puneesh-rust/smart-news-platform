import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

def get_connection():
    return psycopg2.connect(
        os.getenv("DATABASE_URI"),
        sslmode="require"
    )


def get_all_news():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id, title, description, link, category, source
        FROM headlines
        ORDER BY date DESC
    """)

    rows = cursor.fetchall()

    cursor.close()
    conn.close()

    # 🔥 Convert DB rows → dict (IMPORTANT)
    news_data = []
    for row in rows:
        news_data.append({
            "id": row[0],
            "title": row[1],
            "description": row[2],
            "link": row[3],
            "category": row[4],
            "source": row[5],
        })

    return news_data