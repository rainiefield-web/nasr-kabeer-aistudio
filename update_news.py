import os
import time
import json
import re
import traceback

try:
    from google import genai
    from google.genai import types
except ImportError as e:
    print(f"ImportError: {e}")
    exit(1)

def extract_json_payload(text):
    """极致容错解析器：从 API 返回的文本中剥离并解析 JSON 对象"""
    if not text: return None
    # 移除 Markdown 代码块标记和搜索引用
    cleaned = text.replace("```json", "").replace("```", "")
    cleaned = re.sub(r'\[\d+\]', '', cleaned).strip()
    
    decoder = json.JSONDecoder()
    start = cleaned.find("{")
    while start != -1:
        try:
            obj, _ = decoder.raw_decode(cleaned[start:])
            return obj
        except json.JSONDecodeError:
            start = cleaned.find("{", start + 1)
    return None

def main():
    # 1. 获取 API Key
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("Error: GEMINI_API_KEY is not set.")
        exit(1)

    client = genai.Client(api_key=api_key)
    
    # 2. 优化 Prompt：采用分层搜索策略
    prompt = """
    CRITICAL MISSION: Generate a high-quality global aluminum industry intelligence report.
    
    STEP 1: LME DATA (MANDATORY)
    Search for the MOST RECENT LME Aluminum official settlement/cash price. 
    Look at LME official site or Reuters/Investing.com. 
    Required: Numeric price and daily change percentage.

    STEP 2: BROAD NEWS SCAN
    Search for "Aluminum market", "Bauxite mining", "Alumina refinery" news from:
    - Reuters, Bloomberg, Mining.com, Aluminium-journal.com, Metal.com.
    
    STEP 3: OUTPUT STRUCTURE (JSON ONLY)
    Every news bullet MUST include a 'bullet' (text) and a 'url' (source link).
    Translate all points into professional Arabic.

    {
      "date": "YYYY-MM-DD",
      "en": { 
          "lme": [{"price": "$xxx", "change": "x%", "date": "YYYY-MM-DD"}],
          "corporate": [{"bullet": "...", "url": "..."}],
          "trends": [], "factors": [] 
      },
      "ar": { "lme": [], "corporate": [], "trends": [], "factors": [] }
    }
    """

    try:
        # 调用 Gemini 2.0 Flash 配合实时搜索
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                tools=[types.Tool(google_search=types.GoogleSearch())]
            )
        )

        data = extract_json_payload(response.text if response.text else "")
        if not data:
            print("Error: Failed to parse JSON from Gemini API.")
            exit(1)

        # 3. 补全缺失字段与数据清洗
        for lang in ["en", "ar"]:
            if lang not in data: data[lang] = {}
            for sec in ["lme", "corporate", "trends", "factors"]:
                if sec not in data[lang]: data[lang][sec] = []

        if not data.get("date") or "YYYY" in str(data["date"]):
            data["date"] = time.strftime('%Y-%m-%d')

        # 4. 生成专业排版的 Markdown
        def render_report(lang_code, title_suffix):
            lines = [f"## {title_suffix}"]
            sections = [
                ("lme", "💰 LME Market Data" if lang_code == 'en' else "📊 بيانات بورصة لندن"),
                ("corporate", "🏢 Corporate & M&A" if lang_code == 'en' else "🏢 أخبار الشركات"),
                ("trends", "📈 Market Trends" if lang_code == 'en' else "📈 اتجاهات السوق"),
                ("factors", "🌍 Strategic Factors" if lang_code == 'en' else "🌍 عوامل استراتيجية")
            ]
            
            for key, title in sections:
                lines.append(f"### {title}")
                items = data[lang_code].get(key, [])
                if not items:
                    lines.append("- *No significant updates found for this cycle.*")
                    continue
                
                for item in items:
                    if isinstance(item, dict):
                        if key == "lme":
                            p, c, d = item.get('price','N/A'), item.get('change','0%'), item.get('date','')
                            icon = "🔴" if "-" in str(c) else "🟢"
                            lines.append(f"> **Price:** `{p}` | **Change:** {icon} `{c}` | **Date:** {d}")
                        else:
                            txt = item.get('bullet') or item.get('text') or ""
                            url = item.get('url') or ""
                            link = f" ([Source]({url}))" if url.startswith("http") else f" ({url})" if url else ""
                            if txt: lines.append(f"- {txt}{link}")
                    else:
                        lines.append(f"- {str(item)}")
                lines.append("")
            return "\n".join(lines)

        # 组装最终文档内容
        final_md = f"# 🛠️ Aluminum Industry Intelligence ({data['date']})\n"
        final_md += f"> **Last Updated:** {time.strftime('%Y-%m-%d %H:%M:%S')} UTC\n\n"
        final_md += render_report("en", "Global English Report")
        final_md += "\n---\n"
        final_md += render_report("ar", "التقرير العربي المحترف")

        # 5. 文件持久化
        base_dir = os.path.dirname(os.path.abspath(__file__))
        public_dir = os.path.join(base_dir, "public")
        os.makedirs(public_dir, exist_ok=True)

        with open(os.path.join(public_dir, "news_data.json"), "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        for path in [os.path.join(base_dir, "aluminum_industry_news.md"),
                     os.path.join(public_dir, "aluminum_industry_news.md")]:
            with open(path, "w", encoding="utf-8") as f:
                f.write(final_md)

        print(f"Report Successfully Generated: {data['date']}")

    except Exception as e:
        traceback.print_exc()
        exit(1)

if __name__ == "__main__":
    main()
