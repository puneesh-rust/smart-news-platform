import os
import time
import requests
from dotenv import load_dotenv
from db.database import get_connection  # ✅ FIXED

load_dotenv()

API_KEY = os.getenv("OPENROUTER_API_KEY")

# ✅ mistral-7b-instruct:free removed — permanently retired (404), no point retrying
FALLBACK_MODELS = [
    "meta-llama/llama-3.3-70b-instruct:free",
    "qwen/qwen3-next-80b-a3b-instruct:free",
]


def call_openrouter(model, content):
    response = requests.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type": "application/json",
        },
        json={
            "model": model,
            "messages": [
                {"role": "user", "content": f"Summarize this news in 3 lines:\n{content[:1500]}"}
            ]
            # ✅ provider.ignore hata diya — Venice hi inka sirf provider hai
        },
        timeout=30,
    )
    return response.json()

def summarize_text(content, max_retries=1):
    if not content:
        print("⚠️ Skipping summarization: content is empty/None")
        return None

    for model in FALLBACK_MODELS:
        attempt = 0
        while attempt <= max_retries:
            try:
                data = call_openrouter(model, content)

                if data and "choices" in data:
                    return data["choices"][0]["message"]["content"]

                error = data.get("error", {}) if data else {}
                code = error.get("code")

                # 429 = rate limited -> wait the suggested time and retry same model once
                if code == 429 and attempt < max_retries:
                    wait_time = error.get("metadata", {}).get("retry_after_seconds", 10)
                    print(f"⏳ {model} rate-limited, waiting {wait_time}s before retry...")
                    time.sleep(wait_time)
                    attempt += 1
                    continue

                print(f"❌ API Error with {model}:", data)
                break  # move to next model in fallback list

            except Exception as e:
                print(f"Error with {model}:", e)
                break

    print("❌ All fallback models failed for this content")
    return None


def process_pending_news():
    conn = get_connection()  # ✅ FIXED
    cursor = conn.cursor()

    cursor.execute(
        "SELECT id, content FROM headlines WHERE summary IS NULL AND content IS NOT NULL AND content <> '' LIMIT 5"
    )
    rows = cursor.fetchall()

    for news_id, content in rows:
        summary = summarize_text(content)

        if summary:
            cursor.execute(
                "UPDATE headlines SET summary=%s, summary_status='done' WHERE id=%s",
                (summary, news_id),
            )
        else:
            cursor.execute(
                "UPDATE headlines SET summary_status='failed' WHERE id=%s",
                (news_id,),
            )

        conn.commit()  # ✅ commit per row, so partial progress isn't lost if later rows fail
        time.sleep(2)  # ✅ small delay between rows to avoid hammering the free-tier rate limit

    cursor.close()
    conn.close()