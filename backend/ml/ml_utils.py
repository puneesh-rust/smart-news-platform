# ml/ml_utils.py

import pickle
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

vectorizer = pickle.load(open(os.path.join(BASE_DIR, "vectorizer_news.pkl"), "rb"))
similarity = pickle.load(open(os.path.join(BASE_DIR, "similarity_news.pkl"), "rb"))
df = pickle.load(open(os.path.join(BASE_DIR, "model_news.pkl"), "rb"))


def find_best_match(title):
    """Exact match pehle try karo, phir normalized match"""
    
    # Step 1 — Exact match
    if title in df["title"].values:
        return df[df["title"] == title].index[0]
    
    # Step 2 — Normalize karke match karo
    # (strip spaces, lowercase, curly quotes → straight quotes)
    def normalize(t):
        return (
            t.lower()
            .strip()
            .replace("\u2018", "'")   # curly left quote → straight
            .replace("\u2019", "'")   # curly right quote → straight
            .replace("\u201c", '"')   # curly left double quote
            .replace("\u201d", '"')   # curly right double quote
            .replace("\u2013", "-")   # em dash
            .replace("\u2014", "-")
        )
    
    normalized_title = normalize(title)
    df["_normalized"] = df["title"].apply(normalize)
    
    match = df[df["_normalized"] == normalized_title]
    
    if not match.empty:
        return match.index[0]
    
    # Step 3 — Partial match (title ka koi part match kare)
    partial = df[df["_normalized"].str.contains(normalized_title[:50], regex=False)]
    
    if not partial.empty:
        return partial.index[0]
    
    return None  # Koi match nahi mila


def recommend_news(title, top_n=5):
    idx = find_best_match(title)
    
    if idx is None:
        print(f"❌ No match found for: {title}")  # Server logs mein dikhega
        return []
    
    print(f"✅ Match found at index {idx}: {df.iloc[idx]['title']}")  # Debug log

    similarity_scores = list(enumerate(similarity[idx]))
    similarity_scores = sorted(similarity_scores, key=lambda x: x[1], reverse=True)

    top_articles = similarity_scores[1:top_n + 1]

    recommended = []
    for i in top_articles:
        article = df.iloc[i[0]]
        recommended.append({
            "title": article["title"],
            "description": article.get("description", ""),
            "category": article.get("category", ""),
            "link": article.get("link", "")
        })

    return recommended