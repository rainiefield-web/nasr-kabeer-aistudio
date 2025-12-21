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
    """极致容错解析器：确保从混合文本中提取 JSON"""
    if not text: return None
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
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("Error: GEMINI_API_KEY is not set.")
        exit(1)

    client = genai.Client(api_key=api_key)
    
    # --- 策略优化：极度宽泛且高质量的搜索引导 ---
    prompt = """
    CRITICAL MISSION: Generate a high-quality global aluminum industry intelligence report.
    
    STEP 1: GET LME DATA (MANDATORY)
    Search for the MOST RECENT LME Aluminum official settlement/cash price. 
    Look at: LME official site, Reuters Commodities, Fastmarkets, or Investing.com.
    Requirement: Capture the numeric price (e.g., $2,250.50) and the daily change percentage.

    STEP 2: SCAN GLOBAL NEWS (BROAD SOURCES)
    Search these domains and general news for "Aluminum market", "Bauxite mining", "Alumina refinery news":
    - Industry Sites: aluminium-journal.com, aluminiumtoday.com, metal.com, alcircle.com
    - Financial News: Reuters, Bloomberg (Commodities), Financial Times, CNBC.
    - Corporate: Rio Tinto, Alcoa, Rusal, Hydro, EGA.

    STEP 3: OUTPUT REQUIREMENTS
    - 'lme': Must contain the specific cash price, date of price, and intraday move.
    - 'corporate' & 'trends': Minimum 2-3 high-quality bullets each. 
    - No generic filler. Every bullet MUST end with its specific source URL.
    - Professional Arabic translation for all points.

    Structure (STRICT JSON):
    {
      "date": "YYYY-MM-DD",
      "en": { "lme": [], "corporate": [], "trends": [], "factors": [] },
      "ar": { "lme": [], "corporate": [], "trends": [], "factors": [] }
    }
    """

    try:
        # 使用 Gemini 2.0 Flash 的增强搜索能力
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
            print("Error: API output is unparseable.")
            exit(1)

        # --- 校验逻辑优化：确保 LME 优先 ---
        lme_found = len(data.get("en", {}).get("lme", [])) > 0
        news_found = False
        
        # 自动补齐缺失部分，防止后续渲染报错
        for lang in ["en", "ar"]:
            if lang not in data: data[lang] = {}
            for sec in ["lme", "corporate", "trends", "factors"]:
                if sec not in data[lang] or not isinstance(data[lang][sec], list):
                    data[lang][sec] = []
                if len(data[lang][sec]) > 0: news_found = True

        # 如果连 LME 都没有，尝试做一次最后的“软补救”：从正文中找数字
        if not lme_found:
            print("Warning: LME specific field empty, scanning other sections for price...")
            # 这里的逻辑是即使 LME 字段空了，只要其他新闻里有货也行

        if not news_found and not lme_found:
            print("Error: No data retrieved at all. Check API search tool status.")
            exit(0)

        # 强制更新日期为当前北京/伦敦时间
        data["date"] = time.strftime('%Y-%m-%d')

        # --- 文件生成逻辑 ---
        base_dir = os.path.dirname(os.path.abspath(__file__))
        public_dir = os.path.join(base_dir, "public")
        os.makedirs(public_dir, exist_ok=True)

        # 1. 保存 JSON 数据
        with open(os.path.join(public_dir, "news_data.json"), "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        # 2. 生成渲染精美的 Markdown
        md_content = f"# 🛠️ Aluminum Industry Intelligence ({data['date']})\n"
        md_content += f"> **Auto-Update:** {time.strftime('%Y-%m-%d %H:%M:%S')} UTC\n\n"
        
        def render_lang(lang_code, title_suffix):
            lines = [f"## {title_suffix}"]
            mapping = [
                ("lme", "💰 LME Market Data" if lang_code == 'en' else "📊 بيانات بورصة لندن"),
                ("corporate", "🏢 Corporate & M&A" if lang_code == 'en' else "🏢 أخبار الشركات"),
                ("trends", "📈 Market Trends" if lang_code == 'en' else "📈 اتجاهات السوق"),
                ("factors", "🌍 Macro Factors" if lang_code == 'en' else "🌍 عوامل استراتيجية")
            ]
            for key, title in mapping:
                lines.append(f"### {title}")
                items = data[lang_code].get(key, [])
                if items:
                    for item in items: lines.append(f"- {item}")
                else:
                    lines.append("- No significant updates available for this cycle.")
                lines.append("")
            return lines

        md_content += "\n".join(render_lang("en", "Global English Report"))
        md_content += "\n---\n"
        md_content += "\n".join(render_lang("ar", "التقرير العربي المحترف"))

        # 写入文件
        for path in [os.path.join(base_dir, "aluminum_industry_news.md"), 
                     os.path.join(public_dir, "aluminum_industry_news.md")]:
            with open(path, "w", encoding="utf-8") as f:
                f.write(md_content)

        print(f"Update Success: LME {'Captured' if lme_found else 'Missing'}")

    except Exception as e:
        traceback.print_exc()
        exit(1)

if __name__ == "__main__":
    main()
