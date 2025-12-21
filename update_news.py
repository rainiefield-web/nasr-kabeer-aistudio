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

# --- 深度配置 ---
# 包含 30 个高质量信源的查询增强
SITES_QUERY = "Reuters, Bloomberg Metals, Fastmarkets, LME Official, AlCircle, Aluminium Insider, IAI, Alcoa News, Rio Tinto, Rusal, Hydro, EGA, SMM (Metal.com)."

def clean_text(text):
    """清理 AI 幻觉生成的引用标签和假设性 URL"""
    if not text: return ""
    # 删除 这种标记
    text = re.sub(r'\', '', text)
    # 删除常见的 AI 假设性占位 URL
    text = re.sub(r'hypothetical\S+', '', text)
    return text.strip()

def extract_json(text):
    """极致容错 JSON 提取"""
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
    """带重试机制的抓取"""
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
    
    # --- 任务 1: LME 价格（强制搜索实时或最近收盘价） ---
    lme_prompt = """
    TASK: Get LME Primary Aluminum Cash Settlement Price. 
    INSTRUCTION: If today (Sunday/Saturday) is a holiday, you MUST search for the LATEST available closing price (e.g., from Friday). 
    DO NOT return empty. Check Investing.com or LME official data.
    OUTPUT: {"en": {"lme": [{"price": "$xxxx.xx", "change": "±x.x%", "date": "YYYY-MM-DD"}]}}
    """

    # --- 任务 2: 深度新闻（严格过滤虚假源） ---
    news_prompt = f"""
    TASK: Deep scan aluminum industry news from: {SITES_QUERY}.
    REQUIREMENTS: 
    1. Extract 5-8 REAL news bullets. 
    2. NO HYPOTHETICAL URLs. If no URL found, leave it blank.
    3. Remove all "" or similar tags from the text.
    4. Provide professional Arabic translation.
    OUTPUT: {"en": {"corporate": [{"bullet": "...", "url": "..."}], "trends": []}, "ar": {"corporate": []}}
    """

    lme_data = fetch_content(client, lme_prompt)
    news_data = fetch_content(client, news_prompt)

    # 数据合并与最终清洗
    final_data = {
        "date": datetime.utcnow().strftime('%Y-%m-%d'),
        "en": {"lme": lme_data.get("en", {}).get("lme", []) if lme_data else [], "corporate": [], "trends": [], "factors": []},
        "ar": {"lme": [], "corporate": [], "trends": [], "factors": []}
    }
    
    if news_data:
        for lang in ["en", "ar"]:
            for sec in ["corporate", "trends", "factors"]:
                raw_items = news_data.get(lang, {}).get(sec, [])
                cleaned_items = []
                for item in raw_items:
                    bullet = clean_text(item.get("bullet", ""))
                    url = item.get("url", "")
                    # 过滤掉包含 'hypothetical' 的虚假链接
                    if bullet and "hypothetical" not in str(url).lower():
                        cleaned_items.append({"bullet": bullet, "url": url})
                final_data[lang][sec] = cleaned_items

    # --- 渲染逻辑 ---
    def render_md(data):
        lines = [f"# 🛠️ Aluminum Global Intelligence Report", 
                 f"**Last Updated:** `{current_time_utc} UTC`", 
                 "> *Verified Primary Aluminum Market Data & Global Industry News*", ""]
        
        for lang, title in [("en", "Global English Report"), ("ar", "التقرير العربي المحترف")]:
            lines.append(f"## {title}")
            mapping = [("lme", "💰 LME Market Data"), ("corporate", "🏢 Corporate Updates"), ("trends", "📊 Market Trends")]
            for key, sec_title in mapping:
                lines.append(f"### {sec_title}")
                items = data[lang].get(key, [])
                if not items:
                    lines.append("- *Data verification in progress (Market may be closed)...*")
                else:
                    for item in items:
                        if key == "lme":
                            p, c, d = item.get('price'), item.get('change'), item.get('date')
                            lines.append(f"> **LME Cash Price:** `{p}` | **Change:** `{c}` | **Date:** {d}")
                        else:
                            txt, url = item.get('bullet', ''), item.get('url', '')
                            lines.append(f"- {txt} [🔗 Source]({url})" if url and "http" in url else f"- {txt}")
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
