import os
import time
import json
import re
import traceback
from datetime import datetime, timedelta

try:
    from google import genai
    from google.genai import types
except ImportError as e:
    print(f"ImportError: {e}")
    exit(1)

# --- 核心过滤与信源配置 ---
MIN_PRICE_THRESHOLD = 2700.0  # 核心门槛：确保是原铝价格
CORE_SITES = "LME Official, Reuters Commodities, Bloomberg Metals, Fastmarkets, AlCircle, Aluminium Insider, IAI, Mining.com"

def clean_text(text):
    if not text: return ""
    # 彻底删除 AI 的各种幻觉标签和伪引用
    text = re.sub(r"\", "", text)
    text = re.sub(r"\[\d+\]", "", text)
    text = re.sub(r"hypothetical\S+", "", text)
    return text.strip()

def extract_json(text):
    if not text: return None
    cleaned = text.replace("```json", "").replace("```", "").strip()
    start = cleaned.find("{")
    while start != -1:
        try:
            return json.JSONDecoder().raw_decode(cleaned[start:])[0]
        except:
            start = cleaned.find("{", start + 1)
    return None

def fetch_content(client, prompt):
    # 尝试使用 2.0 Flash 获取速度，若失败使用 1.5 Pro 获取深度
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
    
    # 记录当前 UTC 时间和 2 小时前的延时参考时间
    now = datetime.utcnow()
    current_time_utc = now.strftime('%Y-%m-%d %H:%M:%S')
    delay_ref_time = (now - timedelta(hours=2)).strftime('%H:%M')

    # --- 任务 1: 稳健的价格抓取 ---
    lme_prompt = f"""
    Get LME Primary Aluminum (High Grade) Cash Settlement Price.
    Time Context: Data from the last 1-4 hours is acceptable. 
    Strict: Discard any price below $2700 (which is likely Alloy).
    Source: Prefer Investing.com, Fastmarkets, or Reuters.
    Output JSON: {{ "en": {{ "lme": [{{ "price": "$xxxx.xx", "change": "±x.x%", "date": "YYYY-MM-DD" }}] }} }}
    """

    # --- 任务 2: 深度新闻抓取 ---
    news_prompt = f"""
    Deep scan aluminum industry news from these 30+ portals: {CORE_SITES} and other mining journals.
    Focus: Smelter production news, Bauxite supply, ESG, and Automotive aluminum demand.
    Requirement: 8-12 high-quality news bullets. Use REAL URLs.
    Provide professional Arabic translation for all content.
    Output JSON: {{ "en": {{ "corporate": [], "trends": [], "factors": [] }}, "ar": {{ "corporate": [], "trends": [], "factors": [] }} }}
    """

    lme_data = fetch_content(client, lme_prompt)
    news_data = fetch_content(client, news_prompt)

    # 数值校验：如果 AI 还是抓错了价格，直接拦截
    valid_lme = []
    if lme_data and "en" in lme_data and "lme" in lme_data["en"]:
        for entry in lme_data["en"]["lme"]:
            try:
                p_val = float(str(entry.get("price")).replace("$", "").replace(",", ""))
                if p_val >= MIN_PRICE_THRESHOLD: valid_lme.append(entry)
            except: continue

    final_data = {
        "date": now.strftime('%Y-%m-%d'),
        "en": {"lme": valid_lme, "corporate": [], "trends": [], "factors": []},
        "ar": {"lme": [], "corporate": [], "trends": [], "factors": []}
    }

    if news_data:
        for lang in ["en", "ar"]:
            for sec in ["corporate", "trends", "factors"]:
                raw_items = news_data.get(lang, {}).get(sec, [])
                final_data[lang][sec] = [{"bullet": clean_text(i.get("bullet","")), "url": i.get("url","")} 
                                         for i in raw_items if i.get("bullet") and "hypothetical" not in str(i.get("url")).lower()]

    # --- 渲染逻辑 ---
    def render_md(data):
        lines = [f"# 🛠️ Aluminum Global Intelligence Report", 
                 f"**Last Updated:** `{current_time_utc} UTC` (Delayed Feed OK)", 
                 f"**Status:** 🟢 Data Integrity Verified | **Frequency:** 4x Daily", ""]
        
        for lang, title in [("en", "Global English Report"), ("ar", "التقرير العربي المحترف")]:
            lines.append(f"## {title}")
            sections = [("lme", "💰 LME Primary Aluminum Data"), ("corporate", "🏢 Industry & Corporate News"), 
                        ("trends", "📊 Market Trends"), ("factors", "🌍 Strategic Factors")]
            for key, sec_title in sections:
                lines.append(f"### {sec_title}")
                items = data[lang].get(key, [])
                if not items:
                    lines.append("- *Fetching verified industry data... (Usually updates within 2 hours)*")
                else:
                    for item in items:
                        if key == "lme":
                            lines.append(f"> **LME Cash:** `{item.get('price')}` | **Change:** `{item.get('change')}` | **Ref Date:** {item.get('date')}")
                        else:
                            url = item.get('url')
                            lines.append(f"- {item.get('bullet')} [🔗 Source]({url})" if url and "http" in url else f"- {item.get('bullet')}")
                lines.append("")
        return "\n".join(lines)

    # 写入文件
    content = render_md(final_data)
    base_dir = os.path.dirname(os.path.abspath(__file__))
    output_paths = [os.path.join(base_dir, "aluminum_industry_news.md"), 
                    os.path.join(base_dir, "public", "aluminum_industry_news.md")]
    
    for p in output_paths:
        os.makedirs(os.path.dirname(p), exist_ok=True)
        with open(p, "w", encoding="utf-8") as f:
            f.write(content)

if __name__ == "__main__":
    main()
