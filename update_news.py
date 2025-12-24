import os
import json
import re
import traceback
import requests
from datetime import datetime, timedelta

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
        arts, err = fetch_news_from_gnews(
            query=q,
            max_results=per_query_max,
            from_date=from_date,
            to_date=None,
        )
        if err:
            errors.append(err)
        if arts:
            all_articles.extend(arts)

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


# -----------------------------
# Helpers
# -----------------------------
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


def fetch_content_from_genai(client, prompt: str):
    model_name = select_model_name(client)
    tools = build_tools_if_supported()

    try:
        if tools:
            generation_config = genai.types.GenerateContentConfig(tools=tools)
        else:
            generation_config = genai.types.GenerateContentConfig(response_mime_type="application/json")

        response = client.models.generate_content(
            model=model_name,
            contents=prompt,
            config=generation_config,
        )

        response_text = getattr(response, "text", None)
        data = extract_json(response_text) if response_text else None
        if data is not None:
            return data

        print(f"Gemini returned non-JSON or unparsable output for model={model_name}.")
        if response_text:
            snippet = response_text[:500].replace("\n", "\\n")
            print(f"Response snippet (first 500 chars): {snippet}")

    except Exception as e:
        print(f"Error using model {model_name}: {e}")

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
    gemini_api_key = os.environ.get("GEMINI_API_KEY")
    if not gemini_api_key:
        print("Error: GEMINI_API_KEY is not set. Exiting.")
        raise SystemExit(1)

    client = genai.Client(api_key=gemini_api_key)

    now = datetime.utcnow()
    current_time_utc = now.strftime("%Y-%m-%d %H:%M:%S")

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

    # -----------------------------
    # NewsAPI fetch (same approach)
    # -----------------------------
    print("Fetching latest English news via NewsAPI (restricted domains)...")
    primary_query = (
        "(aluminum OR aluminium) AND "
        "(smelter OR bauxite OR extrusion OR profile OR \"aluminum profile\" OR \"aluminum extrusion\" OR rolling OR billet "
        "OR Alcoa OR Rusal OR Hydro OR Chalco OR Rio Tinto OR Novelis OR Constellium OR Hindalco)"
    )
    fallback_query = (
        "aluminum OR aluminium OR \"aluminum alloy\" OR \"aluminum extrusion\" OR \"aluminum profile\" OR smelter OR bauxite "
        "OR billet OR rolling OR Alcoa OR Rusal OR Hydro OR Chalco OR \"Rio Tinto\" OR Novelis OR Constellium OR Hindalco"
    )
    from_date = (now.date() - timedelta(days=3)).isoformat()

    newsapi_articles = []
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
        if articles:
            newsapi_articles = articles
            newsapi_error = err
            break
        newsapi_error = err

    if not newsapi_articles:
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
    # Gemini fetch (core)
    # -----------------------------
    print("Fetching price and deep news via Gemini...")
    lme_data = fetch_content_from_genai(client, lme_prompt)
    news_data = fetch_content_from_genai(client, news_prompt)

    news_api_key_provided = bool(os.getenv("NEWS_API_KEY"))

    # Status markers
    status = {
        "newsapi_status": "OK" if newsapi_articles else "EMPTY/FAIL",
        "gnews_status": "OK" if gnews_articles else "EMPTY/FAIL",
        "lme_status": "OK" if lme_data else "FAIL",
        "gemini_news_status": "OK" if news_data else "FAIL",
    }

    # -----------------------------
    # Hard fail policy (FIXED):
    # Only fail if Gemini core outputs are missing.
    # NewsAPI/GNews are best-effort and should not break the workflow.
    # -----------------------------
    errors = []
    if not lme_data:
        errors.append("Gemini LME request returned no usable data. Check GEMINI_API_KEY and model availability.")
    if not news_data:
        errors.append("Gemini news request returned no usable data. Verify GEMINI_API_KEY, network, or model quota.")

    # Soft warnings for external news APIs
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

    if errors:
        print("Fatal validation errors detected (Gemini core only):")
        for err in errors:
            print(f"- {err}")
        raise SystemExit(1)

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
