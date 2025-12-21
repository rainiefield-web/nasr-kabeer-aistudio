import os
import time
import json
import re
import traceback
from datetime import datetime

try:
    from google import genai
    from google.genai import types
except ImportError as e:
    print(f"ImportError: {e}")
    exit(1)

# --- 核心过滤配置 ---
SITES_QUERY = "Reuters Metals, Bloomberg Aluminum, Fastmarkets, LME Official Primary Aluminum, Investing.com Aluminum Futures."
MIN_PRICE_THRESHOLD = 2700.0  # 强制过滤掉低于 2700 的价格（避开合金价）

def clean_text(text):
    if not text: return ""
    text = text.replace('"', '')
    text = re.sub(r"hypothetical\S+", "", text)
    return text.strip()

def extract_json(text):
    if not text: return None
    cleaned = re.sub(r'\[\d+\]', '', text.replace("```json", "").replace("```", "")).strip()
    start = cleaned.find("{")
    while start != -1:
        try:
            return json.JSONDecoder().raw_decode(cleaned[start:])[0]
        except:
            start = cleaned.find("{", start + 1)
    return None

def fetch_content(client, prompt):
    for model_name in ["gemini-2.0-flash", "gemini-1.5-pro"]:
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    tools=[types.Tool(google_search=types.GoogleSearch())]
                )
            )
            data = extract_json(response.text)
            if data: return data
        except: continue
    return None

def main():
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key: exit(1)
    client = genai.Client(api_key=api_key)
    
    current_time_utc = datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')
    
    # --- 极其严格的 LME 提示词 ---
    lme_prompt = f"""
    TASK: Get LME PRIMARY ALUMINUM (99.7% purity) Cash Settlement Price.
    WARNING: DO NOT fetch 'Aluminium Alloy' or 'NASAAC' which are around $2400-$2500. 
    EXPECTED RANGE: The price for Primary Aluminum in Dec 2025 is above $2800.
    SEARCH: Look for "LME Aluminium (Primary) Cash" on Investing.com or Reuters.
    OUTPUT: {{ "en": {{ "lme": [{{ "price": "$xxxx.xx", "change": "±x.x%", "date": "YYYY-MM-DD" }}] }} }}
    """

    news_prompt = f"""
    TASK: Deep scan aluminum industry news from: {SITES_QUERY}.
    REQUIREMENTS: Extract 6-10 REAL news bullets. No hypothetical links.
    OUTPUT: {{ "en": {{ "corporate": [{{ "bullet": "...", "url": "..." }}], "trends": [] }}, "ar": {{ "corporate": [] }} }}
    """

    lme_data = fetch_content(client, lme_prompt)
    news_data = fetch_content(client, news_prompt)

    # --- 数值二次校验逻辑 ---
    valid_lme = []
    if lme_data and "en" in lme_data and "lme" in lme_data["en"]:
        for entry in lme_data["en"]["lme"]:
            price_str = str(entry.get("price")).replace("$", "").replace(",", "")
            try:
                price_val = float(price_str)
                if price_val >= MIN_PRICE_THRESHOLD:
                    valid_lme.append(entry)
                else:
                    print(f"Filtered out incorrect alloy price: {price_val}")
            except: continue

    final_data = {
        "date": datetime.utcnow().strftime('%Y-%m-%d'),
        "en": {"lme": valid_lme, "corporate": [], "trends": [], "factors": []},
        "ar": {"lme": [], "corporate": [], "trends": [], "factors": []}
    }
    
    # 新闻数据清洗与合并
    if news_data:
        for lang in ["en", "ar"]:
            for sec in ["corporate", "trends", "factors"]:
                raw_items = news_data.get(lang, {}).get(sec, [])
                final_data[lang][sec] = [{"bullet": clean_text(i.get("bullet","")), "url": i.get("url","")} 
                                         for i in raw_items if "hypothetical" not in str(i.get("url")).lower()]

    # --- 渲染逻辑 ---
    def render_md(data):
        lines = [f"# 🛠️ Aluminum Global Intelligence Report", 
                 f"**Last Updated:** `{current_time_utc} UTC`", 
                 "> *Focus: LME Primary Aluminum (High Purity) Market Data*", ""]
        
        for lang, title in [("en", "Global English Report"), ("ar", "التقرير العربي المحترف")]:
            lines.append(f"## {title}")
            mapping = [("lme", "💰 LME Market Data (Primary)"), ("corporate", "🏢 Corporate Updates"), ("trends", "📊 Market Trends")]
            for key, sec_title in mapping:
                lines.append(f"### {sec_title}")
                items = data[lang].get(key, [])
                if not items:
                    lines.append("- *Market data verification in progress (Primary grade search active)...*")
                else:
                    for item in items:
                        if key == "lme":
                            lines.append(f"> **LME Primary Cash:** `{item.get('price')}` | **Change:** `{item.get('change')}` | **Date:** {item.get('date')}")
                        else:
                            lines.append(f"- {item.get('bullet')} [🔗 Source]({item.get('url')})" if item.get('url') else f"- {item.get('bullet')}")
                lines.append("")
        return "\n".join(lines)

    md_content = render_md(final_data)
    base_dir = os.path.dirname(os.path.abspath(__file__))
    for p in [os.path.join(base_dir, "aluminum_industry_news.md"), 
              os.path.join(base_dir, "public", "aluminum_industry_news.md")]:
        os.makedirs(os.path.dirname(p), exist_ok=True)
        with open(p, "w", encoding="utf-8") as f:
            f.write(md_content)

if __name__ == "__main__":
    main()
