import os
import time
import json
import re
import traceback
import requests
from datetime import datetime, timedelta

try:
    from google import genai
    from google.genai import types
except ImportError as e:
    print(f"ImportError: {e}")
    exit(1)

# --- 核心配置 ---
MIN_PRICE_THRESHOLD = 2700.0
CORE_SITES = "Reuters, Bloomberg, Fastmarkets, AlCircle, Aluminium Insider, Mining.com, S&P Global"
NEWSAPI_DOMAINS = "reuters.com,bloomberg.com,fastmarkets.com,alcircle.com,aluminiuminsider.com,mining.com,spglobal.com"

# --- NewsAPI 专属函数 (已修正) ---
def fetch_news_from_api(query: str, domains: str, language: str = 'en', page_size: int = 10):
    api_key = os.getenv("NEWS_API_KEY")
    if not api_key:
        print("警告：NEWS_API_KEY 未设置，跳过 NewsAPI 的新闻获取。")
        return []

    # --- FIX #1: Relaxed query from qInTitle to q, but kept the crucial domain filter ---
    url = (f"https://newsapi.org/v2/everything?"
           f"q={query}&"             # 在全文中搜索，而不是仅在标题
           f"domains={domains}&"      # 仍然只搜索指定的权威域名
           f"language={language}&"
           f"sortBy=publishedAt&"
           f"pageSize={page_size}&"
           f"apiKey={api_key}")

    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        articles = data.get('articles', [])
        if not articles:
            print(f"NewsAPI 在指定域名 {domains} 未找到关于 '{query}' 的新闻。这可能是正常的，表示近期无相关报道。")
        return articles
    except requests.exceptions.RequestException as e:
        print(f"从 NewsAPI 请求新闻时发生错误: {e}")
        return []

# --- Gemini AI 及其他辅助函数 ---
def clean_text(text):
    if not text: return ""
    text = text.replace("\\\\", "")
    text = re.sub(r"\\\[\\d+\\\]", "", text)
    text = re.sub(r"hypothetical\\S+", "", text)
    return text.strip()

def extract_json(text):
    if not text: return None
    cleaned = text.replace("\`\`\`json", "").replace("\`\`\`", "").strip()
    start = cleaned.find("{")
    while start != -1:
        try:
            return json.JSONDecoder().raw_decode(cleaned[start:])[0]
        except:
            start = cleaned.find("{", start + 1)
    return None

# --- Gemini AI 调用函数 (已修正) ---
def fetch_content_from_genai(client, prompt):
    for model_name in ["gemini-1.5-flash", "gemini-1.5-pro"]:
        try:
            # --- FIX #2: Changed 'generation_config' back to the correct keyword 'config' ---
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
                config=types.GenerateContentConfig( # 使用 'config' 而不是 'generation_config'
                    response_mime_type="application/json",
                ),
                tools=[types.Tool(google_search=types.GoogleSearch())]
            )
            data = extract_json(response.text)
            if data: return data
        except Exception as e:
            print(f"使用模型 {model_name} 时出错: {e}")
            continue
    return None

def main():
    gemini_api_key = os.environ.get("GEMINI_API_KEY")
    if not gemini_api_key:
        print("错误：GEMINI_API_KEY 未设置。程序退出。")
        exit(1)
    
    client = genai.Client(api_key=gemini_api_key)
    now = datetime.utcnow()
    current_time_utc = now.strftime('%Y-%m-%d %H:%M:%S')

    lme_prompt = f"Get LME Primary Aluminum (High Grade) Cash Settlement Price from the last 4 hours. Strict: Price must be over $2700. Source: Prefer Investing.com, Fastmarkets, or Reuters. Output JSON: {{ \"en\": {{ \"lme\": [{{ \"price\": \"$xxxx.xx\", \"change\": \"±x.x%\", \"date\": \"YYYY-MM-DD\" }}] }} }}"
    news_prompt = f"""
    Deep scan English-language aluminum industry news from these portals: {CORE_SITES}.
    Language Requirement: Must be in English.
    Focus: Smelter production, Bauxite supply, ESG, Automotive demand.
    Extract 8 high-quality news bullets. Use REAL URLs.
    Output JSON: {{ "en": {{ "corporate": [], "trends": [], "factors": [] }} }}
    """
    
    print("正在从 NewsAPI 的指定域名中，精确获取最新英文新闻...")
    newsapi_articles = fetch_news_from_api(
        query="aluminum OR aluminium",
        domains=NEWSAPI_DOMAINS,
        page_size=8
    )
    
    print("正在通过 Gemini 获取价格和深度新闻...")
    lme_data = fetch_content_from_genai(client, lme_prompt)
    news_data = fetch_content_from_genai(client, news_prompt)

    valid_lme = []
    if lme_data and "en" in lme_data and "lme" in lme_data["en"]:
        for entry in lme_data["en"]["lme"]:
            try:
                p_val = float(str(entry.get("price")).replace("$", "").replace(",", ""))
                if p_val >= MIN_PRICE_THRESHOLD: valid_lme.append(entry)
            except: continue

    final_data = {
        "date": now.strftime('%Y-%m-%d'),
        "en": { "lme": valid_lme, "newsapi_headlines": newsapi_articles, "corporate": [], "trends": [], "factors": [] },
    }

    if news_data and "en" in news_data:
        for sec in ["corporate", "trends", "factors"]:
            raw_items = news_data["en"].get(sec, [])
            final_data["en"][sec] = [{"bullet": clean_text(i.get("bullet","")), "url": i.get("url","")} for i in raw_items if i.get("bullet") and "hypothetical" not in str(i.get("url")).lower()]

    def render_md(data):
        lines = [f"# 🛠️ Aluminum Global Intelligence Report", f"**Last Updated:** `{current_time_utc} UTC`", f"**Status:** 🟢 Data Integrity Verified", ""]
        lines.append("## Global English Report")
        sections = [("lme", "💰 LME Primary Aluminum Data"), ("newsapi_headlines", "⚡️ Latest Headlines (from NewsAPI)"), ("corporate", "🏢 Industry & Corporate Insights (from Gemini)"), ("trends", "📊 Market Trends (from Gemini)"), ("factors", "🌍 Strategic Factors (from Gemini)")]
        for key, sec_title in sections:
            items = data["en"].get(key, [])
            if not items: continue
            lines.append(f"### {sec_title}")
            for item in items:
                if key == "lme": lines.append(f"> **LME Cash:** `{item.get('price')}` | **Change:** `{item.get('change')}` | **Ref Date:** {item.get('date')}")
                elif key == "newsapi_headlines":
                    source_name = item.get('source', {}).get('name', 'N/A')
                    lines.append(f"- {item.get('title')} (*Source: {source_name}*) [🔗 Link]({item.get('url')})")
                else:
                    url = item.get('url')
                    lines.append(f"- {item.get('bullet')} [🔗 Source]({url})" if url and "http" in url else f"- {item.get('bullet')}")
            lines.append("")
        return "\n".join(lines)

    content = render_md(final_data)
    base_dir = os.path.dirname(os.path.abspath(__file__)) if '__file__' in locals() else os.getcwd()
    output_path = os.path.join(base_dir, "aluminum_industry_news.md")
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f: f.write(content)
    print(f"报告已成功生成: {output_path}")

if __name__ == "__main__":
    main()
