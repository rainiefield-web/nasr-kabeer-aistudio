import os
import time
import json
import re
import traceback

try:
    from google import genai
    from google.genai import types
except ImportError as e:
    print(f"ImportError: {e}. 请确保安装了 google-genai 库。")
    exit(1)

def extract_json_payload(text):
    """
    极致容错版解析器：
    1. 移除 Markdown 标签和搜索引用。
    2. 解析文本中的第一个有效 JSON 对象。
    3. 处理 JSON 内部的非法换行和多余逗号。
    """
    if not text:
        return None
    
    # 预清洗：剥离 Markdown 符号和搜索来源引用 [1], [2] 等
    cleaned = text.replace("```json", "").replace("```", "")
    cleaned = re.sub(r'\[\d+\]', '', cleaned)
    cleaned = cleaned.strip()

    # 核心提取：使用 JSONDecoder 抽取第一个完整对象
    decoder = json.JSONDecoder()
    start = cleaned.find("{")
    while start != -1 and start < len(cleaned):
        try:
            obj, _ = decoder.raw_decode(cleaned[start:])
            return obj
        except json.JSONDecodeError:
            start = cleaned.find("{", start + 1)

    # 兜底：简单正则修复
    try:
        start = cleaned.find("{")
        end = cleaned.rfind("}")
        if start != -1 and end != -1:
            json_str = cleaned[start:end + 1]
            sanitized_str = re.sub(r'\n\s*', ' ', json_str)
            sanitized_str = re.sub(r',\s*([\]}])', r'\1', sanitized_str)
            return json.loads(sanitized_str)
    except:
        return None
    return None

def main():
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("Error: GEMINI_API_KEY is not set.")
        exit(1)

    client = genai.Client(api_key=api_key)
    
    # 优化 Prompt：强调“最大化获取”，并明确 LME 格式
    prompt = """
    Search for TODAY'S real, verifiable global aluminum industry news and market data.
    
    Target Sources:
    - https://www.aluminium-journal.com/news
    - https://www.investing.com/commodities/aluminum-news
    - https://aluminiumtoday.com/news
    - https://news.metal.com/list/latest/aluminium

    Requirements:
    1. LME: Find the latest LME Aluminum Cash Price and daily % change. 
    2. CONTENT: Extract real corporate moves (Alcoa, Rio Tinto, Emirates Global Aluminium, etc.), trends, and strategic factors.
    3. NO PLACEHOLDERS: Do not use "Company A" or "Project X". If a specific name isn't found, describe the event accurately.
    4. LINKS: Every news bullet MUST include a source URL (https://...).
    5. TRANSLATION: Translate every English point into professional Arabic in the 'ar' section.

    Structure (STRICT JSON):
    {
      "date": "YYYY-MM-DD",
      "en": { "lme": [], "corporate": [], "trends": [], "factors": [] },
      "ar": { "lme": [], "corporate": [], "trends": [], "factors": [] }
    }
    """

    try:
        # 使用 Gemini 2.0 Flash 获取实时数据
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                tools=[types.Tool(google_search=types.GoogleSearch())]
            )
        )

        text_content = response.text if response.text else ""
        data = extract_json_payload(text_content)

        if not data:
            print("Error: Failed to extract a valid JSON object from API response.")
            exit(1)

        # --- 优化后的校验与清洗逻辑 ---
        required_sections = ["lme", "corporate", "trends", "factors"]
        valid_content_found = False
        url_pattern = re.compile(r"https?://\S+")

        for lang in ["en", "ar"]:
            if lang not in data: data[lang] = {}
            for section in required_sections:
                entries = data[lang].get(section, [])
                
                # 容错：如果 API 返回的不是列表（如字符串），强转列表
                if not isinstance(entries, list):
                    entries = [str(entries)] if entries else []
                
                # 清洗条目：过滤掉无效占位符，保留有内容的项
                cleaned = []
                for item in entries:
                    item_str = str(item)
                    # 过滤掉明显的虚假占位符
                    if "Company A" in item_str or "placeholder" in item_str.lower():
                        continue
                    if len(item_str) > 10:  # 长度过滤，确保不是空话
                        cleaned.append(item_str)
                        valid_content_found = True
                
                data[lang][section] = cleaned

        # 特殊检查：LME 数据预警但不中断
        lme_entries = data.get("en", {}).get("lme", [])
        if not any(re.search(r"\d", str(e)) for e in lme_entries):
            print("Warning: No numeric LME price found. Proceeding with other news.")

        if not valid_content_found:
            print("Warning: No valid industry news entries found. Skipping file update to avoid empty reports.")
            exit(0)

        # 校验日期
        if not data.get("date") or "YYYY" in str(data["date"]):
            data["date"] = time.strftime('%Y-%m-%d')

        # --- 文件保存逻辑 ---
        base_dir = os.path.dirname(os.path.abspath(__file__))
        public_dir = os.path.join(base_dir, "public")
        os.makedirs(public_dir, exist_ok=True)

        # 1. 保存 JSON
        json_path = os.path.join(public_dir, "news_data.json")
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        # 2. 生成 Markdown 报告
        updated_at = time.strftime('%Y-%m-%d %H:%M:%S')
        md_lines = [
            f"# Aluminum Industry News Summary ({data['date']})",
            f"Last Updated: {updated_at} UTC",
            "\n> *This report is automatically generated using Gemini 2.0 Flash with real-time web search.*",
            "",
            "## 🌐 English Analysis",
        ]
        
        section_map = [
            ("lme", "📈 LME Price & Market"),
            ("corporate", "🏢 Corporate Updates"), 
            ("trends", "📊 Industry Trends"), 
            ("factors", "💡 Strategic Factors")
        ]

        for key, title in section_map:
            md_lines.append(f"### {title}")
            items = data["en"].get(key, [])
            if not items:
                md_lines.append("- No major updates found in this category for today.")
            else:
                for item in items:
                    md_lines.append(f"- {item}")
            md_lines.append("")

        md_lines.append("---")
        md_lines.append("## 🌍 Arabic Summary (الملخص العربي)")
        
        ar_section_map = [
            ("lme", "تحليل بورصة لندن (LME)"),
            ("corporate", "تحديثات الشركات"), 
            ("trends", "توجهات الصناعة"), 
            ("factors", "العوامل الاستراتيجية")
        ]
        
        for key, title in ar_section_map:
            md_lines.append(f"### {title}")
            items = data["ar"].get(key, [])
            if not items:
                md_lines.append("- لا توجد تحديثات رئيسية في هذا القسم اليوم.")
            else:
                for item in items:
                    md_lines.append(f"- {item}")
            md_lines.append("")

        # 写入两个位置确保同步
        targets = [
            os.path.join(base_dir, "aluminum_industry_news.md"),
            os.path.join(public_dir, "aluminum_industry_news.md")
        ]
        for target in targets:
            with open(target, "w", encoding="utf-8") as f:
                f.write("\n".join(md_lines))
        
        print(f"Successfully updated news for {data['date']}.")

    except Exception as e:
        if "429" in str(e):
            print("Status: QUOTA_EXHAUSTED. Gemini Free tier limit reached. Please try again later.")
            exit(0)
        else:
            traceback.print_exc()
            exit(1)

if __name__ == "__main__":
    main()
