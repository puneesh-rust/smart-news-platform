from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from db.database import get_all_news


def recommend_news(title: str):
    try:
        # 🔥 Fetch latest news from DB
        news_data = get_all_news()

        if not news_data:
            return []

        # 🔥 Combine title + description
        documents = [
            (news["title"] or "") + " " + (news["description"] or "")
            for news in news_data
        ]

        # Remove empty
        filtered = [
            (doc, news)
            for doc, news in zip(documents, news_data)
            if doc.strip()
        ]

        if not filtered:
            return []

        docs, filtered_news = zip(*filtered)

        # 🔥 TF-IDF
        vectorizer = TfidfVectorizer(stop_words="english")
        tfidf_matrix = vectorizer.fit_transform(docs)

        # 🔥 Query
        query_vec = vectorizer.transform([title])

        similarities = cosine_similarity(query_vec, tfidf_matrix).flatten()

        # 🔥 Top 5
        indices = similarities.argsort()[-5:][::-1]

        results = [
            filtered_news[i]
            for i in indices
            if similarities[i] > 0
        ]

        return results

    except Exception as e:
        print("❌ Recommendation Error:", e)
        return []