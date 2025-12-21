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

# --- 深度抓取配置 ---
# 汇总的 30 个高质量信源关键词
SITES_QUERY = "Reuters, Bloomberg Metals, Fastmarkets, AlCircle, Aluminium Insider, IAI (International Aluminium Institute), Alcoa, Rio Tinto, Rusal, Hydro, EGA, SMM (Metal.com), Aluminium Today, Fastmarkets, Platts, European Aluminium, Light Metal Age."

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

def fetch_with_retry(client, prompt):
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
    
    # --- 任务 1: LME 价格精准抓取 ---
    lme_prompt = f"""
    Current Date: {datetime.utcnow().date()}
    Task: Get the EXACT LME Primary Aluminum Cash Settlement Price.
    Filter: Discard Alloy prices. Ensure the price is for 99.7% Primary Aluminum.
    Sources: LME.com, Reuters, Fastmarkets.
    Output: {{"en": {{"lme": [{{"price": "$xxxx", "change": "±x.x%", "date": "YYYY-MM-DD"}}]}}}}
    """

    # --- 任务 2: 深度新闻抓取 (覆盖 30 个信源) ---
    news_prompt = f"""
    Task: Deep scan global aluminum industry news from these SPECIFIC sites: {SITES_QUERY}.
    Requirements:
    1. Extract 5-8 distinct, high-quality news bullets.
    2. Focus on: Production shifts, energy costs impacting smelters, trade sanctions, ESG/Green aluminum, and aerospace/auto demand.
    3. Every bullet MUST have a source URL.
    4. Provide professional Arabic translation for each point.
    Output Structure:
    {{
      "en": {{ "corporate": [{{ "bullet": "...", "url": "..." }}], "trends": [], "factors": [] }},
      "ar": {{ "corporate": [{{ "bullet": "...", "url": "..." }}], "trends": [], "factors": [] }}
    }}
    """

    # 执行抓取
    lme_data = fetch_with_retry(client, lme_prompt)
    news_data = fetch_with_retry(client, news_prompt)

    # 合并数据
    final_data = {
        "date": datetime.utcnow().strftime('%Y-%m-%d'),
        "en": lme_data.get("en", {}) if lme_data else {"lme": []},
        "ar": lme_data.get("ar", {}) if lme_data else {"lme": []}
    }
    
    if news_data:
        for lang in ["en", "ar"]:
            for sec in ["corporate", "trends", "factors"]:
                final_data[lang][sec] = news_data.get(lang, {}).get(sec, [])

    # --- 渲染 Markdown (增强版) ---
    def render_md(data):
        lines = [f"# 🛠️ Aluminum Global Intelligence Report", 
                 f"**Update Frequency:** 4 Times Daily | **Last Updated:** `{current_time_utc} UTC`",
                 f"**Data Sources:** Top 30 Industry Portals (Reuters, LME, AlCircle, etc.)", ""]
        
        for lang, title in [("en", "English Analysis"), ("ar", "التحليل العربي")]:
            lines.append(f"## {title}")
            mapping = [("lme", "💰 LME Market Data"), ("corporate", "🏢 Corporate & Industrial News"), 
                       ("trends", "📊 Global Market Trends"), ("factors", "🌍 Strategic Macro Factors")]
            for key, sec_title in mapping:
                lines.append(f"### {sec_title}")
                items = data[lang].get(key, [])
                if not items:
                    lines.append("- *Searching deeper for verified information...*")
                else:
                    for item in items:
                        if key == "lme":
                            p, c = item.get('price'), item.get('change')
                            lines.append(f"> **LME Cash:** `{p}` | **Change:** `{c}`")
                        else:
                            txt, url = item.get('bullet', ''), item.get('url', '')
                            lines.append(f"- {txt} [🔗 Source]({url})" if url else f"- {txt}")
                lines.append("")
        return "\n".join(lines)

    # 写入文件
    md_content = render_md(final_data)
    base_dir = os.path.dirname(os.path.abspath(__file__))
    for p in [os.path.join(base_dir, "aluminum_industry_news.md"), 
              os.path.join(base_dir, "public", "aluminum_industry_news.md")]:
        os.makedirs(os.path.dirname(p), exist_ok=True)
        with open(p, "w", encoding="utf-8") as f:
            f.write(md_content)

if __name__ == "__main__":
    main()
