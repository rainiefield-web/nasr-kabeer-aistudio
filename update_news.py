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

def extract_json_payload(text):
    """解析 JSON，增加对搜索来源标注的过滤"""
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
    
    # 获取当前 UTC 时间用于 Prompt 和报表
    now_utc = datetime.utcnow()
    current_time_str = now_utc.strftime('%Y-%m-%d %H:%M:%S')

    prompt = f"""
    Search for LME Primary Aluminum Cash Settlement price and industry news.
    Current Time Context: {current_time_str} UTC.
    
    1. LME DATA: Must be 'Primary Aluminum'. If today's price is not out yet, provide the most recent trading day's price.
    2. RANGE: Expect $2,700-$3,200. Discard Alloy prices (~$2400).
    3. NEWS: Provide real bullet points with source URLs.
    4. ARABIC: Professional translation for everything.

    Output STRICT JSON:
    {{
      "date": "{now_utc.strftime('%Y-%m-%d')}",
      "en": {{ "lme": [], "corporate": [], "trends": [], "factors": [] }},
      "ar": {{ "lme": [], "corporate": [], "trends": [], "factors": [] }}
    }}
    """

    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                tools=[types.Tool(google_search=types.GoogleSearch())]
            )
        )

        data = extract_json_payload(response.text)
        if not data:
            print("Error: API output empty or unparseable.")
            exit(1)

        # 数据清洗：过滤不合理的低价
        if "en" in data and "lme" in data["en"]:
            valid_lme = []
            for item in data["en"]["lme"]:
                p_str = str(item.get("price", "0")).replace("$", "").replace(",", "")
                try:
                    if float(p_str) > 2600: valid_lme.append(item)
                except: continue
            data["en"]["lme"] = valid_lme

        # --- 动态渲染逻辑 ---
        def render_section(lang_code, title_suffix):
            lines = [f"## {title_suffix}"]
            mapping = [
                ("lme", "💰 LME Market Data" if lang_code == 'en' else "📊 بيانات بورصة لندن"),
                ("corporate", "🏢 Corporate & M&A" if lang_code == 'en' else "🏢 أخبار الشركات"),
                ("trends", "📈 Market Trends" if lang_code == 'en' else "📈 اتجاهات السوق"),
                ("factors", "🌍 Strategic Factors" if lang_code == 'en' else "🌍 عوامل استراتيجية")
            ]
            
            for key, title in mapping:
                lines.append(f"### {title}")
                items = data.get(lang_code, {}).get(key, [])
                if not items:
                    # 修改这里：不再只是显示 No updates，而是增加动态提示
                    status_msg = "Waiting for market update..." if key == "lme" else "Searching for verified news..."
                    lines.append(f"- *{status_msg}*")
                else:
                    for item in items:
                        if isinstance(item, dict):
                            if key == "lme":
                                p, c, d = item.get('price','N/A'), item.get('change','-'), item.get('date', data['date'])
                                icon = "🔴" if "-" in str(c) else "🟢"
                                lines.append(f"> **LME Cash:** `{p}` | **Change:** {icon} `{c}` | **Date:** {d}")
                            else:
                                txt, url = item.get('bullet', item.get('text', '')), item.get('url', '')
                                lines.append(f"- {txt} [🔗 Source]({url})" if url.startswith('http') else f"- {txt}")
                        else:
                            lines.append(f"- {item}")
                lines.append("")
            return "\n".join(lines)

        # 组装最终 Markdown
        final_md = f"# 🛠️ Aluminum Industry Intelligence ({data['date']})\n\n"
        # 核心修改：这里确保 Last Updated 每次运行都变
        final_md += f"**Last Updated:** `{current_time_str} UTC`  \n"
        final_md += f"**Status:** ⚡ Real-time Data Feed Active\n\n"
        
        final_md += render_section("en", "Global English Report")
        final_md += "\n---\n"
        final_md += render_section("ar", "التقرير العربي المحترف")

        # 保存文件
        base_dir = os.path.dirname(os.path.abspath(__file__))
        public_dir = os.path.join(base_dir, "public")
        os.makedirs(public_dir, exist_ok=True)

        for path in [os.path.join(base_dir, "aluminum_industry_news.md"),
                     os.path.join(public_dir, "aluminum_industry_news.md")]:
            with open(path, "w", encoding="utf-8") as f:
                f.write(final_md)
            print(f"Successfully updated: {path}")

    except Exception:
        traceback.print_exc()
        exit(1)

if __name__ == "__main__":
    main()
