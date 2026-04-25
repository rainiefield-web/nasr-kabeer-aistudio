import os
import json
import re
import traceback
import time
import requests
from datetime import datetime, timedelta
from functools import wraps

import anthropic

# --- Core Config ---
MIN_PRICE_THRESHOLD = 2700.0
MAX_RETRIES = 3
RETRY_BASE_DELAY = 2

# MiniMax API config - set via environment variable in GitHub Secrets
_MINIMAX_API_KEY = os.getenv("MINIMAX_API_KEY")  # Must set in GitHub secrets
_MINIMAX_BASE_URL = "https://api.minimax.com/anthropic"
_MINIMAX_MODEL = "MiniMax-M2.7"

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

# Terms used to enforce aluminum industry relevance (beyond a single "aluminum" mention)
NEWSAPI_INDUSTRY_TERMS = [
    "smelter",
    "smelting",
    "smelters",
    "alumina",
    "bauxite",
    "mine",
    "mining",
    "refinery",
    "refining",
    "ingot",
    "billet",
    "extrusion",
    "extrusions",
    "rolling",
    "coil",
    "sheet",
    "foil",
    "recycling",
    "scrap",
    "lme",
    "premium",
    "price",
    "profile",
    "profiles",
    "capacity",
    "production",
    "anode",
    "cathode",
]

NEWSAPI_COMPANY_TERMS = [
    "alcoa",
    "rusal",
    "norsk hydro",
    "hydro",
    "rio tinto",
    "chalco",
    "chinalco",
    "hindalco",
    "nalco",
    "novelis",
    "constellium",
    "ega",
    "emirates global aluminium",
]

# Keywords used to score aluminum relevance for NewsAPI results (title/description/content).
NEWSAPI_KEY_TERMS = [
    "aluminum",
    "aluminium",
    "bauxite",
    "smelter",
    "smelting",
    "billet",
    "extrusion",
    "rolling",
    "anode",
    "cathode",
    "ingot",
    "metal price",
    "lme",
    "alcoa",
    "rusal",
    "hydro",
    "chalco",
    "rio tinto",
    "novelis",
    "constellium",
    "hindalco",
    "aluminum profile",
    "aluminium profile",
    "aluminum extrusion",
    "aluminium extrusion",
    "aluminum price",
    "aluminium price",
    "lme aluminum",
    "lme aluminium",
]

NEWSAPI_FOCUS_PHRASES = [
    "LME aluminium",
    "LME aluminum",
    "aluminum price",
    "aluminium price",
    "aluminum profile",
    "aluminium profile",
    "aluminum extrusion",
    "aluminium extrusion",
]

# -----------------------------
# NewsAPI
# -----------------------------
def fetch_news_from_api(
    query: str,
    domains: str | None,
    language: str = "en",
    page_size: int = 10,
    search_in: str = "title,description,content",
    sort_by: str = "publishedAt",
    from_date: str | None = None,
):
    api_key = os.getenv("NEWS_API_KEY")
    if not api_key:
        print("Warning: NEWS_API_KEY is not set. Skipping NewsAPI fetch.")
        return [], "NEWS_API_KEY missing"

    url = (
        f"https://newsapi.org/v2/everything?"
        f"q={query}&"
        f"language={language}&"
        f"searchIn={search_in}&"
        f"sortBy={sort_by}&"
        f"pageSize={page_size}"
    )
    if domains:
        url += f"&domains={domains}"
    if from_date:
        url += f"&from={from_date}"
    url += f"&apiKey={api_key}"

    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        data = response.json()
        articles = data.get("articles", [])
        if not articles:
            print(f"NewsAPI found no results for query='{query}' within domains='{domains}'.")
            return articles, "NewsAPI returned no articles for given query/domains"
        return articles, None
    except requests.exceptions.RequestException as e:
        print(f"Error fetching NewsAPI articles: {e}")
        return [], f"NewsAPI request failed: {e}"


# -----------------------------
# GNews
# -----------------------------
def fetch_news_from_gnews(
    query: str,
    language: str = "en",
    max_results: int = 10,
    search_in: str = "title,description,content",
    from_date: str | None = None,
    to_date: str | None = None,
    allow_date_fallback: bool = True,
):
    api_key = os.getenv("GNEWS")
    if not api_key:
        print("Warning: GNEWS API key is not set. Skipping GNews fetch.")
        return [], "GNEWS key missing"

    # Defensive: some GNews plans are strict about query length. Keep a diagnostic.
    if len(query) > 200:
        print(f"Warning: GNews query length is {len(query)} (>200). This may cause 400. Query: {query[:200]}...")

    # Defensive: set max<=10 to avoid plan-based cap issues.
    if max_results > 10:
        max_results = 10

    params = {
        "q": query,
        "lang": language,
        "in": search_in,
        "max": max_results,
        "sortby": "publishedAt",
        "apikey": api_key,
    }
    if from_date:
        params["from"] = from_date
    if to_date:
        params["to"] = to_date

    try:
        response = requests.get("https://gnews.io/api/v4/search", params=params, timeout=30)
        
        # Handle rate limiting (429) with retry
        if response.status_code == 429:
            for attempt in range(MAX_RETRIES):
                delay = RETRY_BASE_DELAY * (2 ** attempt)
                print(f"GNews 429 rate limited. Retry {attempt + 1}/{MAX_RETRIES} after {delay}s...")
                time.sleep(delay)
                response = requests.get("https://gnews.io/api/v4/search", params=params, timeout=30)
                if response.status_code != 429:
                    break
            
        response.raise_for_status()
        data = response.json()
        articles = data.get("articles", [])
        if not articles:
            print(f"GNews found no results for query='{query}'.")
            return articles, "GNews returned no articles for query"
        return articles, None
    except requests.exceptions.HTTPError as e:
        status = e.response.status_code if e.response else None
        body_preview = ""
        if e.response is not None:
            body_preview = e.response.text[:300].replace("\n", " ")

        # Retry once without date filters (many tiers reject from/to or strict parsing)
        if status in (400, 422) and (from_date or to_date) and allow_date_fallback:
            print("GNews returned a client error with date filters; retrying without from/to parameters.")
            return fetch_news_from_gnews(
                query=query,
                language=language,
                max_results=max_results,
                search_in=search_in,
                from_date=None,
                to_date=None,
                allow_date_fallback=False,
            )

        error_detail = f"HTTP {status}; body: {body_preview}" if status else str(e)
        print(f"Error fetching GNews articles: {error_detail}")
        return [], f"GNews request failed: {error_detail}"
    except requests.exceptions.RequestException as e:
        print(f"Error fetching GNews articles: {e}")
        return [], f"GNews request failed: {e}"


def fetch_gnews_aggregated(
    queries: list[str],
    from_date: str | None,
    max_total: int = 12,
    per_query_max: int = 10,
):
    """
    Runs multiple shorter GNews queries, aggregates results, de-duplicates by URL,
    and returns up to max_total articles.
    """
    all_articles: list[dict] = []
    errors: list[str] = []

    for q in queries:
        if not q.strip():
            continue
        try:
            arts, err = fetch_news_from_gnews(
                query=q,
                max_results=per_query_max,
                from_date=from_date,
                to_date=None,
            )
            if err:
                # Log error but continue to next query (skip failed ones)
                print(f"GNews query skipped due to error: {err}")
                errors.append(err)
            if arts:
                all_articles.extend(arts)
        except Exception as e:
            print(f"GNews query exception, skipping: {e}")
            errors.append(str(e))

    # Deduplicate by URL
    seen = set()
    deduped = []
    for a in all_articles:
        u = (a or {}).get("url")
        if not u:
            continue
        if u in seen:
            continue
        seen.add(u)
        deduped.append(a)

    # Keep newest-ish order (API already sortBy=publishedAt, but merged lists can interleave).
    # We’ll do a safe sort on publishedAt when present.
    def _ts(item: dict):
        t = (item or {}).get("publishedAt", "") or ""
        return t

    deduped.sort(key=_ts, reverse=True)
    deduped = deduped[:max_total]

    combined_error = None
    if errors and not deduped:
        # Only return an error if we got nothing at all
        combined_error = "; ".join(errors[:3])
    elif errors:
        # Partial errors are non-fatal
        combined_error = f"Partial errors: {'; '.join(errors[:3])}"

    return deduped, combined_error


def _parse_published_at(article: dict) -> datetime | None:
    value = (article or {}).get("publishedAt") or ""
    if not isinstance(value, str):
        return None
    value = value.strip()
    if not value:
        return None
    try:
        # NewsAPI uses ISO 8601 with Z sometimes; normalize to offset-aware.
        return datetime.fromisoformat(value.replace("Z", "+00:00"))
    except Exception:
        return None


def _compute_newsapi_relevance(article: dict) -> int:
    """
    Lightweight relevance scoring to prioritize true aluminum stories.
    Counts keyword hits across title/description/content.
    """
    text = _article_text(article)

    score = 0
    for term in NEWSAPI_KEY_TERMS:
        if term in text:
            # Core metal terms count more than company names.
            if term in ("aluminum", "aluminium", "bauxite", "smelter", "smelting", "lme"):
                score += 3
            else:
                score += 1
    for phrase in NEWSAPI_FOCUS_PHRASES:
        if phrase.lower() in text:
            score += 4
    return score


def _is_aluminum_industry_article(article: dict) -> bool:
    """
    Filter out consumer/electronics noise by requiring aluminum + industry/company cues.
    """
    text = _article_text(article)
    if not text.strip():
        return False

    # Allow direct pass-through if highly focused phrase is present
    if any(phrase.lower() in text for phrase in NEWSAPI_FOCUS_PHRASES):
        return True

    aluminum_hits = any(t in text for t in ("aluminum", "aluminium", "alumina", "bauxite"))
    industry_hits = any(term in text for term in NEWSAPI_INDUSTRY_TERMS)
    company_hits = any(term in text for term in NEWSAPI_COMPANY_TERMS)

    if not (aluminum_hits or company_hits):
        return False

    if aluminum_hits and (industry_hits or company_hits):
        return True

    if company_hits and industry_hits:
        return True

    return False


def _article_text(article: dict) -> str:
    """
    Combine title/description/content for consistent filtering and scoring.
    """
    title = (article or {}).get("title") or ""
    desc = (article or {}).get("description") or ""
    content = (article or {}).get("content") or ""
    return f"{title} {desc} {content}".lower()


def dedupe_and_rank_newsapi(articles: list[dict], top_n: int = 12) -> list[dict]:
    seen_urls = set()
    deduped: list[dict] = []

    for art in articles:
        url = (art or {}).get("url")
        if url and url in seen_urls:
            continue
        if url:
            seen_urls.add(url)
        if _is_aluminum_industry_article(art):
            deduped.append(art)

    def _sort_key(item: dict):
        score = _compute_newsapi_relevance(item)
        ts = _parse_published_at(item)
        ts_val = ts.timestamp() if ts else 0
        return (-score, -ts_val)

    deduped.sort(key=_sort_key)
    return deduped[:top_n]


# -----------------------------
# Helpers
# -----------------------------
def retry_with_backoff(max_retries=MAX_RETRIES, base_delay=RETRY_BASE_DELAY, backoff_factor=2, retriable_codes=None):
    """Retry decorator with exponential backoff for API calls."""
    if retriable_codes is None:
        retriable_codes = {429, 500, 502, 503, 504}

    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            last_exception = None
            for attempt in range(max_retries):
                try:
                    result = func(*args, **kwargs)
                    # Check if result indicates failure
                    if isinstance(result, tuple):
                        articles, error = result
                        if error and any(code in str(error) for code in ["429", "503", "500", "Too Many Requests", "UNAVAILABLE"]):
                            delay = base_delay * (backoff_factor ** attempt)
                            print(f"Retryable error {attempt + 1}/{max_retries}: {error}. Waiting {delay}s...")
                            time.sleep(delay)
                            continue
                        return result
                    return result
                except Exception as e:
                    last_exception = e
                    delay = base_delay * (backoff_factor ** attempt)
                    print(f"Exception {attempt + 1}/{max_retries}: {e}. Waiting {delay}s...")
                    time.sleep(delay)
            if last_exception:
                raise last_exception
            return func(*args, **kwargs)
        return wrapper
    return decorator
def clean_text(text: str) -> str:
    if not text:
        return ""
    text = text.replace("\\\\", "")
    text = re.sub(r"\\\[\\d+\\\]", "", text)
    text = re.sub(r"hypothetical\\S+", "", text, flags=re.IGNORECASE)
    return text.strip()


def extract_json(text: str):
    if not text:
        return None

    cleaned = text.strip()
    cleaned = cleaned.replace("```json", "").replace("```JSON", "").replace("```", "").strip()

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
    env_model = os.getenv("GEMINI_MODEL")
    if env_model:
        return env_model

    try:
        models = client.models.list()
        preferred_keywords = ["gemini-3-flash", "gemini-2.5-flash", "gemini-2.0-flash", "gemini"]
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
# Gemini content fetch
# -----------------------------
def build_tools_if_supported():
    try:
        tool_cls = getattr(genai.types, "Tool", None)
        search_cls = getattr(genai.types, "GoogleSearch", None)
        if tool_cls and search_cls:
            return [tool_cls(google_search=search_cls())]
    except Exception:
        return None
    return None


def fetch_content_from_genai(prompt: str):
    """Fetch content - tries Gemini first, then MiniMax fallback."""
    from google import genai
    
    # Try Gemini first
    gemini_key = os.environ.get("GEMINI_API_KEY")
    if gemini_key:
        print("Trying Gemini primary...")
        result = _fetch_from_gemini(prompt, gemini_key)
        if result:
            return result
        print("Gemini failed. Trying MiniMax fallback...")
    else:
        print("GEMINI_API_KEY not set. Trying MiniMax fallback...")
    
    # Fallback to MiniMax
    return _fetch_from_minimax(prompt)


def _fetch_from_gemini_fallback(prompt: str):
    """Gemini fallback if MiniMax fails."""
    from google import genai
    
    gemini_key = os.environ.get("GEMINI_API_KEY")
    if not gemini_key:
        print("Warning: GEMINI_API_KEY not set. Skipping Gemini fallback.")
        return None
    
    try:
        client = genai.Client(api_key=gemini_key)
        model_name = "models/gemini-2.5-flash"
        
        response = client.models.generate_content(
            model=model_name,
            contents=prompt,
            config=genai.types.GenerateContentConfig(response_mime_type="application/json"),
        )
        
        response_text = getattr(response, "text", None)
        if response_text:
            data = extract_json(response_text)
            if data is not None:
                return data
            print(f"Gemini fallback returned (first 300 chars): {response_text[:300]}...")
    except Exception as e:
        print(f"Gemini fallback error: {e}")
    
    return None


def _fetch_from_gemini(prompt: str, api_key: str):
    """Primary: Gemini fetch."""
    from google import genai
    
    try:
        client = genai.Client(api_key=api_key)
        model_name = "models/gemini-2.5-flash"
        
        response = client.models.generate_content(
            model=model_name,
            contents=prompt,
            config=genai.types.GenerateContentConfig(response_mime_type="application/json"),
        )
        
        response_text = getattr(response, "text", None)
        if response_text:
            data = extract_json(response_text)
            if data is not None:
                return data
            print(f"Gemini response (first 300 chars): {response_text[:300]}...")
    except Exception as e:
        print(f"Gemini error: {e}")
    
    return None


def _fetch_from_minimax(prompt: str):
    """Fallback: MiniMax fetch."""
    import anthropic
    
    minimax_key = os.getenv("MINIMAX_API_KEY")
    if not minimax_key:
        print("Warning: MINIMAX_API_KEY not set. Skipping MiniMax fallback.")
        return None
    
    minimax_models = [
        "MiniMax-M2.7",
        "MiniMax-M2.7-highspeed",
        "MiniMax-M2.5",
    ]
    
    for model_name in minimax_models:
        for attempt in range(MAX_RETRIES):
            try:
                client = anthropic.Anthropic(
                    api_key=minimax_key,
                    base_url=_MINIMAX_BASE_URL,
                    max_retries=2,
                )
                
                response = client.messages.create(
                    model=model_name,
                    max_tokens=4096,
                    messages=[{"role": "user", "content": prompt}],
                )
                
                response_text = None
                if hasattr(response, 'content') and response.content:
                    for block in response.content:
                        if hasattr(block, 'text') and block.text:
                            response_text = block.text
                            break
                
                if response_text:
                    data = extract_json(response_text)
                    if data is not None:
                        return data
                    print(f"MiniMax {model_name} returned non-JSON")

            except Exception as e:
                error_msg = str(e)
                if "503" in error_msg or "429" in error_msg or "rate_limit" in error_msg.lower():
                    delay = RETRY_BASE_DELAY * (2 ** attempt)
                    print(f"MiniMax {model_name} rate limited. Retry {attempt + 1}/{MAX_RETRIES} after {delay}s...")
                    time.sleep(delay)
                    continue
                print(f"MiniMax {model_name} error: {e}")
                break
        
        print(f"Failed with {model_name}, trying next model...")
    
    return None


# -----------------------------
# Rendering
# -----------------------------
def render_md(data, current_time_utc: str, status: dict) -> str:
    lines = [
        "# Aluminum Global Intelligence Report",
        f"Last Updated (UTC): `{current_time_utc}`",
        f"Data Status: LME={status.get('lme_status')} | GeminiNews={status.get('gemini_news_status')} | NewsAPI={status.get('newsapi_status')} | GNews={status.get('gnews_status')}",
        "",
        "## Global English Report",
        ""
    ]

    sections = [
        ("lme", "LME Primary Aluminum Data"),
        ("newsapi_headlines", "Latest Headlines (from NewsAPI)"),
        ("gnews_headlines", "Latest Headlines (from GNews)"),
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
            elif key == "gnews_headlines":
                # GNews format: {title, description, url, publishedAt, source:{name,url}}
                source_name = (item.get("source", {}) or {}).get("name", "N/A")
                url = item.get("url")
                headline = (item.get("title") or "").strip()
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
    # Gemini is primary (required), MiniMax is fallback (optional)
    gemini_key = os.environ.get("GEMINI_API_KEY")
    if not gemini_key:
        print("Error: GEMINI_API_KEY is not set. Exiting.")
        raise SystemExit(1)

    now = datetime.utcnow()
    current_time_utc = now.strftime("%Y-%m-%d %H:%M:%S")

    prompt = f"""
Get the CURRENT/LATEST LME Primary Aluminum (High Grade) Cash Settlement Price from TODAY {current_time_utc} AND scan latest aluminum industry news.

IMPORTANT: 
- You MUST get real-time data from TODAY {current_time_utc}, not cached/historical data
- The date in the response MUST be today's date: {now.strftime('%Y-%m-%d')}
- If you cannot find today's price, explicitly state the data is unavailable

Pricing Requirements:
- Source: Investing.com, Fastmarkets, or Reuters.
- Price > $2700.

News Requirements:
- Portals: {CORE_SITES}
- Focus: smelter production, bauxite supply, ESG, automotive demand.
- Extract 8 high-quality bullets across corporate/trends/factors.
- Use REAL URLs.

Return ONLY valid JSON (no markdown, no extra text):
{{
  "en": {{
    "lme": [{{ "price": "$xxxx.xx", "change": "±x.x%", "date": "YYYY-MM-DD", "url": "https://..." }}],
    "corporate": [{{ "bullet": "...", "url": "https://..." }}],
    "trends": [{{ "bullet": "...", "url": "https://..." }}],
    "factors": [{{ "bullet": "...", "url": "https://..." }}]
  }}
}}
""".strip()

    # -----------------------------
    # NewsAPI fetch (same approach)
    # -----------------------------
    print("Fetching latest English news via NewsAPI (restricted domains)...")
    focus_phrase_block = (
        "\"LME aluminium\" OR \"LME aluminum\" OR \"aluminum price\" OR \"aluminium price\" OR "
        "\"aluminum profile\" OR \"aluminium profile\" OR \"aluminum extrusion\" OR \"aluminium extrusion\""
    )
    company_block = "Alcoa OR Rusal OR Hydro OR Chalco OR \"Rio Tinto\" OR Novelis OR Constellium OR Hindalco"
    primary_query = (
        f"({focus_phrase_block}) OR "
        f"((aluminum OR aluminium) AND (smelter OR bauxite OR extrusion OR profile OR rolling OR billet OR {company_block}))"
    )
    fallback_query = (
        f"({focus_phrase_block}) OR "
        f"(aluminum OR aluminium OR \"aluminum alloy\" OR \"aluminum extrusion\" OR \"aluminum profile\" OR smelter OR bauxite "
        f"OR billet OR rolling OR {company_block})"
    )
    from_date = (now.date() - timedelta(days=3)).isoformat()

    newsapi_articles: list[dict] = []
    newsapi_raw_articles: list[dict] = []
    newsapi_error = None
    newsapi_attempts_log = []
    attempts = [
        ("primary", primary_query, NEWSAPI_DOMAINS),
        ("fallback-narrow", fallback_query, NEWSAPI_DOMAINS),
        ("fallback-broad-domains", fallback_query, None),
    ]
    for label, q, domains in attempts:
        articles, err = fetch_news_from_api(
            query=q,
            domains=domains,
            page_size=12,
            from_date=from_date,
        )
        newsapi_attempts_log.append((label, err, len(articles)))
        if err:
            newsapi_error = err
        if articles:
            newsapi_raw_articles.extend(articles)

    if newsapi_raw_articles:
        newsapi_articles = dedupe_and_rank_newsapi(newsapi_raw_articles, top_n=12)
        if not newsapi_articles:
            print(
                f"NewsAPI relevance filter removed {len(newsapi_raw_articles)} articles; "
                "consider adjusting query or terms if this persists."
            )
    else:
        print("NewsAPI attempts summary:")
        for label, err, count in newsapi_attempts_log:
            print(f"- {label} query -> {count} articles; error: {err}")

    # -----------------------------
    # GNews fetch (FIXED: split queries + aggregate)
    # -----------------------------
    print("Fetching latest English news via GNews (broad Google News index)...")

    # Keep each query short to avoid GNews q length limits
    gnews_queries = [
        '("aluminum" OR "aluminium") AND (smelter OR bauxite OR billet)',
        '("aluminum" OR "aluminium") AND (extrusion OR "aluminum extrusion" OR rolling)',
        '("Alcoa" OR "Rusal" OR "Hydro" OR "Chalco" OR "Rio Tinto") AND (aluminum OR aluminium)',
        '("Novelis" OR "Constellium" OR "Hindalco") AND (aluminum OR aluminium)',
    ]

    gnews_from = (now - timedelta(days=5)).strftime("%Y-%m-%dT00:00:00Z")
    gnews_articles, gnews_error = fetch_gnews_aggregated(
        queries=gnews_queries,
        from_date=gnews_from,
        max_total=12,
        per_query_max=10,
    )
    gnews_api_key_provided = bool(os.getenv("GNEWS"))

    # -----------------------------
    # Gemini fetch (core) - with fallback if unavailable
    # -----------------------------
    print("Fetching combined price and deep news via MiniMax M2.7...")
    combined_data = None
    
    try:
        combined_data = fetch_content_from_genai(prompt)
    except Exception as e:
        print(f"MiniMax fetch failed: {e}")
    
    lme_data = combined_data
    news_data = combined_data

    news_api_key_provided = bool(os.getenv("NEWS_API_KEY"))

    # Status markers
    status = {
        "newsapi_status": "OK" if newsapi_articles else "EMPTY/FAIL",
        "gnews_status": "OK" if gnews_articles else "EMPTY/FAIL",
        "lme_status": "OK" if lme_data else "FAIL",
        "minimax_news_status": "OK" if news_data else "FAIL",
    }

    # -----------------------------
    # Graceful degradation:
    # If Gemini fails, generate report with available data (news headlines only).
    # No longer hard-fail on API errors - this prevents workflow crashes.
    # -----------------------------
    if not lme_data and not news_data:
        print("Warning: Both Gemini LME and news failed. Proceeding with available news data only.")
        print("Note: LME price data will be empty, but headlines from NewsAPI/GNews will still be included.")

    # Soft warnings for external news APIs (non-fatal)
    if news_api_key_provided and (not newsapi_articles or newsapi_error):
        msg = "Warning: NewsAPI returned no articles or had an error."
        if newsapi_error:
            msg += f" Detail: {newsapi_error}"
        print(msg)

    if gnews_api_key_provided and (not gnews_articles or gnews_error):
        msg = "Warning: GNews returned no articles or had an error."
        if gnews_error:
            msg += f" Detail: {gnews_error}"
        print(msg)

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
            "gnews_headlines": gnews_articles,
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
