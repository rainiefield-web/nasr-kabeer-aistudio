import os
import json
import re
import traceback
import requests
from datetime import datetime

from google import genai

# --- Core Config ---
MIN_PRICE_THRESHOLD = 2700.0

CORE_SITES = (
    "Reuters, Bloomberg, Fastmarkets, AlCircle, Aluminium Insider, Mining.com, "
    "S&P Global, Aluminium Today, Metal.com, Investing.com, Trading Economics, "
    "Harbor Aluminum, SteelOnTheNet, LME"
)

NEWSAPI_DOMAINS = (
    "reuters.com,bloomberg.com,fastmarkets.com,alcircle.com,aluminiuminsider.com,"
    "mining.com,spglobal.com,aluminiumtoday.com,metal.com,investing.com,"
    "tradingeconomics.com,harboraluminum.com,steelonthenet.com,lme.com"
)

# -----------------------------
# NewsAPI (no change required)
# -----------------------------
def fetch_news_from_api(query: str, domains: str, language: str = "en", page_size: int = 10):
    api_key = os.getenv("NEWS_API_KEY")
    if not api_key:
        print("Warning: NEWS_API_KEY is not set. Skipping NewsAPI fetch.")
        return []

    url = (
        f"https://newsapi.org/v2/everything?"
        f"q={query}&"
        f"domains={domains}&"
        f"language={language}&"
        f"sortBy=publishedAt&"
        f"pageSize={page_size}&"
        f"apiKey={api_key}"
    )

    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        data = response.json()
        articles = data.get("articles", [])
        if not articles:
            print(f"NewsAPI found no results for query='{query}' within domains='{domains}'.")
        return articles
    except requests.exceptions.RequestException as e:
        print(f"Error fetching NewsAPI articles: {e}")
        return []


# -----------------------------
# Helpers (light improvements)
# -----------------------------
def clean_text(text: str) -> str:
    if not text:
        return ""
    text = text.replace("\\\\", "")
    text = re.sub(r"\\\[\\d+\\\]", "", text)
    text = re.sub(r"hypothetical\\S+", "", text, flags=re.IGNORECASE)
    return text.strip()


def extract_json(text: str):
    """
    Attempts to extract the first valid JSON object from a text blob.
    Handles cases where the model adds pre/post text or Markdown fences.
    """
    if not text:
        return None

    cleaned = text.strip()

    # Remove common fenced code blocks (```json ... ```), if any
    cleaned = cleaned.replace("```json", "").replace("```JSON", "").replace("```", "").strip()

    # Heuristic: find first "{" then attempt raw_decode from there; if fails, keep searching
    start = cleaned.find("{")
    while start != -1:
        try:
            obj, _ = json.JSONDecoder().raw_decode(cleaned[start:])
            return obj
        except Exception:
            start = cleaned.find("{", start + 1)

    return None


# -----------------------------
# Gemini model selection
# -----------------------------
def select_model_name(client) -> str:
    """
    Picks a model that supports generateContent.
    Priority: env GEMINI_MODEL -> gemini-2.5-flash -> gemini-2.0-flash -> any generateContent model.
    """
    env_model = os.getenv("GEMINI_MODEL")
    if env_model:
        return env_model

    try:
        models = client.models.list()
        preferred_keywords = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini"]
        for keyword in preferred_keywords:
            for model in models:
                name = getattr(model, "name", "") or ""
                supported_methods = getattr(model, "supported_generation_methods", []) or []
                if keyword in name and "generateContent" in supported_methods:
                    return name

        for model in models:
            name = getattr(model, "name", "") or ""
            supported_methods = getattr(model, "supported_generation_methods", []) or []
            if "generateContent" in supported_methods:
                return name

    except Exception as e:
        print(f"Model listing failed; fallback to models/gemini-2.5-flash. Error: {e}")

    return "models/gemini-2.5-flash"


# -----------------------------
# Gemini content fetch (KEY FIX HERE)
# -----------------------------
def build_tools_if_supported():
    """
    Attempts to enable GoogleSearch tool if supported by the installed SDK.
    Returns tools list or None.
    """
    try:
        tool_cls = getattr(genai.types, "Tool", None)
        search_cls = getattr(genai.types, "GoogleSearch", None)
        if tool_cls and search_cls:
            return [tool_cls(google_search=search_cls())]
    except Exception:
        return None
    return None


def fetch_content_from_genai(client, prompt: str):
    """
    Scheme A:
    - If tools are enabled: do NOT set response_mime_type to application/json (prevents 400 error).
    - If tools are not available: you may set response_mime_type="application/json".
    - Always parse JSON from response.text using extract_json().
    """
    model_name = select_model_name(client)
    tools = build_tools_if_supported()

    try:
        if tools:
            # IMPORTANT: Do NOT set response_mime_type when tool use is enabled
            generation_config = genai.types.GenerateContentConfig(
                tools=tools
            )
        else:
            generation_config = genai.types.GenerateContentConfig(
                response_mime_type="application/json"
            )

        response = client.models.generate_content(
            model=model_name,
            contents=prompt,
            config=generation_config,
        )

        response_text = getattr(response, "text", None)
        data = extract_json(response_text) if response_text else None
        if data is not None:
            return data

        # If parsing fails, print a short diagnostic (avoid dumping huge text)
        print(f"Gemini returned non-JSON or unparsable output for model={model_name}.")
        if response_text:
            snippet = response_text[:500].replace("\n", "\\n")
            print(f"Response snippet (first 500 chars): {snippet}")

    except Exception as e:
        print(f"Error using model {model_name}: {e}")
        # Optional: print stack for debugging
        # traceback.print_exc()

    return None


# -----------------------------
# Rendering
# -----------------------------
def render_md(data, current_time_utc: str, status: dict) -> str:
    lines = [
        "# Aluminum Global Intelligence Report",
        f"Last Updated (UTC): `{current_time_utc}`",
        f"Data Status: LME={status.get('lme_status')} | GeminiNews={status.get('gemini_news_status')} | NewsAPI={status.get('newsapi_status')}",
        "",
        "## Global English Report",
        ""
    ]

    sections = [
        ("lme", "LME Primary Aluminum Data"),
        ("newsapi_headlines", "Latest Headlines (from NewsAPI)"),
        ("corporate", "Industry & Corporate Insights (from Gemini)"),
        ("trends", "Market Trends (from Gemini)"),
        ("factors", "Strategic Factors (from Gemini)"),
    ]

    for key, title in sections:
        items = data["en"].get(key, [])
        if not items:
            continue

        lines.append(f"### {title}")
        for item in items:
            if key == "lme":
                lines.append(
                    f"- LME Cash: `{item.get('price')}` | Change: `{item.get('change')}` | Ref Date: {item.get('date')}"
                )
            elif key == "newsapi_headlines":
                source_name = item.get("source", {}).get("name", "N/A")
                url = item.get("url")
                headline = item.get("title", "").strip()
                if url and headline:
                    lines.append(f"- {headline} (Source: {source_name}) [Link]({url})")
                elif headline:
                    lines.append(f"- {headline} (Source: {source_name})")
            else:
                bullet = item.get("bullet", "").strip()
                url = item.get("url", "")
                if bullet:
                    if url and "http" in url:
                        lines.append(f"- {bullet} [Source]({url})")
                    else:
                        lines.append(f"- {bullet}")

        lines.append("")

    return "\n".join(lines)


# -----------------------------
# Main
# -----------------------------
def main():
    gemini_api_key = os.environ.get("GEMINI_API_KEY")
    if not gemini_api_key:
        print("Error: GEMINI_API_KEY is not set. Exiting.")
        raise SystemExit(1)

    client = genai.Client(api_key=gemini_api_key)

    now = datetime.utcnow()
    current_time_utc = now.strftime("%Y-%m-%d %H:%M:%S")

    # Stronger JSON-only instruction to improve parse stability
    lme_prompt = f"""
Get LME Primary Aluminum (High Grade) Cash Settlement Price from the last 4 hours.
Strict requirements:
- Price must be over $2700.
- Use real sources; prefer Investing.com, Fastmarkets, or Reuters.
Return ONLY valid JSON (no markdown, no extra text):
{{ "en": {{ "lme": [{{ "price": "$xxxx.xx", "change": "±x.x%", "date": "YYYY-MM-DD", "url": "https://..." }}] }} }}
""".strip()

    news_prompt = f"""
Deep scan English-language aluminum industry news from these portals:
{CORE_SITES}

Constraints:
- Must be in English.
- Focus: smelter production, bauxite supply, ESG, automotive demand.
- Extract 8 high-quality bullets across corporate/trends/factors.
- Use REAL URLs.

Return ONLY valid JSON (no markdown, no extra text):
{{ "en": {{ "corporate": [{{"bullet":"...", "url":"https://..."}}], "trends": [{{"bullet":"...", "url":"https://..."}}], "factors": [{{"bullet":"...", "url":"https://..."}}] }} }}
""".strip()

    # Fetch NewsAPI
    print("Fetching latest English news via NewsAPI (restricted domains)...")
    newsapi_articles = fetch_news_from_api(
        query="aluminum OR aluminium",
        domains=NEWSAPI_DOMAINS,
        page_size=8
    )

    # Fetch Gemini content
    print("Fetching price and deep news via Gemini...")
    lme_data = fetch_content_from_genai(client, lme_prompt)
    news_data = fetch_content_from_genai(client, news_prompt)

    # Status markers
    status = {
        "newsapi_status": "OK" if newsapi_articles else "EMPTY/FAIL",
        "lme_status": "OK" if lme_data else "FAIL",
        "gemini_news_status": "OK" if news_data else "FAIL",
    }

    # Validate and normalize LME
    valid_lme = []
    if lme_data and isinstance(lme_data, dict) and "en" in lme_data and "lme" in lme_data["en"]:
        for entry in lme_data["en"]["lme"]:
            try:
                p_raw = str(entry.get("price", "")).replace("$", "").replace(",", "").strip()
                p_val = float(p_raw)
                if p_val >= MIN_PRICE_THRESHOLD:
                    valid_lme.append(entry)
            except Exception:
                continue

    # Build final data structure
    final_data = {
        "date": now.strftime("%Y-%m-%d"),
        "en": {
            "lme": valid_lme,
            "newsapi_headlines": newsapi_articles,
            "corporate": [],
            "trends": [],
            "factors": [],
        },
    }

    # Normalize Gemini news items
    if news_data and isinstance(news_data, dict) and "en" in news_data:
        for sec in ["corporate", "trends", "factors"]:
            raw_items = news_data["en"].get(sec, []) or []
            cleaned_items = []
            for i in raw_items:
                if not isinstance(i, dict):
                    continue
                bullet = clean_text(i.get("bullet", ""))
                url = i.get("url", "")
                if bullet and ("hypothetical" not in str(url).lower()):
                    cleaned_items.append({"bullet": bullet, "url": url})
            final_data["en"][sec] = cleaned_items

    # Render markdown
    content = render_md(final_data, current_time_utc=current_time_utc, status=status)

    # Write output
    base_dir = os.path.dirname(os.path.abspath(__file__)) if "__file__" in locals() else os.getcwd()
    output_path = os.path.join(base_dir, "aluminum_industry_news.md")
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    with open(output_path, "w", encoding="utf-8") as f:
        f.write(content)

    print(f"Report generated: {output_path}")


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"Fatal error: {e}")
        traceback.print_exc()
        raise
