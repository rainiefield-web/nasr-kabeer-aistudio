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
    """极致容错解析器：从 API 返回文本中剥离并解析 JSON"""
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
    
    # --- 1. 极其严格的 Prompt：限定品类、数值范围、排除旧预测 ---
    prompt = """
    CRITICAL: High-accuracy LME Aluminum Intelligence Required.
    
    STEP 1: LME PRIMARY ALUMINUM PRICE (STRICT)
    Search for "LME Aluminium (Primary) Cash Settlement". 
    - DISCARD "Aluminium Alloy" (usually ~$2400-2500) or old 2024 forecasts.
    - EXPECT value for Dec 2025: $2,800 - $3,200.
    - Sources: LME.com, Reuters (LME news), Investing.com (Aluminum Futures).
    
    STEP 2: BROAD NEWS SCAN
    Search for "Aluminum market", "Bauxite mining" from Reuters, Bloomberg, and Industry sites.

    STEP 3: OUTPUT FORMAT (STRICT JSON)
    {
      "date": "YYYY-MM-DD",
      "en": { 
          "lme": [{"price": "$xxx.xx", "change": "±x.x%", "date": "YYYY-MM-DD", "type": "PRIMARY"}],
          "corporate": [{"bullet": "...", "url": "..."}],
          "trends": [], "factors": [] 
      },
      "ar": { "lme": [], "corporate": [], "trends": [], "factors": [] }
    }
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

        data = extract_json_payload(response.text if response.text else "")
        if not data:
            print("Error: Failed to parse JSON.")
            exit(1)

        # --- 2. 硬代码过滤逻辑：数值范围安全检查 ---
        lme_list = data.get("en", {}).get("lme", [])
        valid_lme = []
        for entry in lme_list:
            price_str = entry.get("price", "0").replace("$", "").replace(",", "")
            try:
                price_val = float(price_str)
                # 过滤逻辑：如果价格低于 $2600，判定为抓取到了合金价或错误数据，丢弃
                if price_val < 2600:
                    print(f"Filtered out suspicious price: ${price_val} (Likely Alloy or Outdated)")
                    continue
                valid_lme.append(entry)
            except ValueError:
                continue
        
        data["en"]["lme"] = valid_lme
        # 如果 LME 数据全被过滤，为了不中断程序，我们会打警告
        lme_found = len(valid_lme) > 0

        # --- 3. 渲染与文件保存 ---
        def render_report(lang_code, title_suffix):
            lines = [f"## {title_suffix}"]
            mapping = [("lme", "💰 LME Market Data"), ("corporate", "🏢 Corporate & M&A"), 
                       ("trends", "📈 Market Trends"), ("factors", "🌍 Strategic Factors")]
            
            for key, title in mapping:
                t = title if lang_code == 'en' else title.split()[-1] # 简单处理阿拉伯语标题
                lines.append(f"### {t}")
                items = data[lang_code].get(key, [])
                if not items:
                    lines.append("- *No data verified for this cycle.*")
                else:
                    for item in items:
                        if isinstance(item, dict):
                            if key == "lme":
                                p, c, d = item.get('price','N/A'), item.get('change','0%'), item.get('date','')
                                icon = "🔴" if "-" in str(c) else "🟢"
                                lines.append(f"> **Price:** `{p}` | **Change:** {icon} `{c}` | **Date:** {d} (Primary Aluminum)")
                            else:
                                txt, url = (item.get('bullet') or item.get('text')), item.get('url')
                                lines.append(f"- {txt} ([Source]({url}))" if url else f"- {txt}")
                        else:
                            lines.append(f"- {str(item)}")
                lines.append("")
            return "\n".join(lines)

        final_md = f"# 🛠️ Aluminum Industry Intelligence ({time.strftime('%Y-%m-%d')})\n"
        final_md += f"> **Verification:** LME Primary Aluminum Cash Price Focus\n\n"
        final_md += render_report("en", "Global English Report")
        final_md += "\n---\n"
        final_md += render_report("ar", "التقرير العربي المحترف")

        # 写入文件
        base_dir = os.path.dirname(os.path.abspath(__file__))
        public_dir = os.path.join(base_dir, "public")
        os.makedirs(public_dir, exist_ok=True)
        
        for path in [os.path.join(base_dir, "aluminum_industry_news.md"),
                     os.path.join(public_dir, "aluminum_industry_news.md")]:
            with open(path, "w", encoding="utf-8") as f:
                f.write(final_md)

        print(f"Update Success. LME Data Validated: {lme_found}")

    except Exception as e:
        traceback.print_exc()
        exit(1)

if __name__ == "__main__":
    main()
