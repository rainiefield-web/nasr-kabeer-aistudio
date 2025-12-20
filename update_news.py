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
    """
    专门针对 Gemini 返回重复 JSON 或带 Markdown 标签的解析器
    """
    if not text:
        return None
    
    print("\n--- [DEBUG] API Original Response Start ---")
    print(text)
    print("--- [DEBUG] API Original Response End ---\n")

    # 1. 基础清洗：移除 Markdown 标识符
    cleaned = text.replace("```json", "").replace("```", "").strip()
    
    # 2. 移除搜索引用标记如 [1], [2]
    cleaned = re.sub(r'\[\d+\]', '', cleaned)

    # 3. 核心修复逻辑：使用非贪婪匹配 (.*?) 只提取第一个完整的 JSON 对象
    # 这样即使模型返回了两个 {...} {...}，我们也只取第一个
    match = re.search(r'(\{.*?\})', cleaned, re.DOTALL)
    
    if match:
        json_str = match.group(1)
        try:
            # 尝试解析提取出的第一个 JSON 对象
            return json.loads(json_str)
        except json.JSONDecodeError:
            # 最后的尝试：如果解析失败，可能是内部有非法换行或多余逗号
            try:
                # 移除 JSON 键值对之间的多余换行
                fixed_str = re.sub(r'\n\s*', ' ', json_str)
                # 移除 JSON 末尾可能存在的多余逗号 (e.g., [1, 2,])
                fixed_str = re.sub(r',\s*([\]}])', r'\1', fixed_str)
                return json.loads(fixed_str)
            except:
                return None
    return None

def main():
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("Error: GEMINI_API_KEY is not set.")
        exit(1)

    client = genai.Client(api_key=api_key)
    
    # 优化后的 Prompt：增加搜索指令和格式约束
    prompt = """
    Search for the latest global aluminum industry news (LME prices, corporate updates, trends). 
    If today's specific data isn't out yet, use the most recent data from the past 24-48 hours.
    
    OUTPUT INSTRUCTIONS:
    - You MUST return a valid JSON object.
    - DO NOT repeat the JSON object. Output it ONCE.
    - DO NOT use markdown code blocks.
    - Structure:
    {
      "date": "YYYY-MM-DD",
      "en": { "lme": [], "corporate": [], "trends": [], "factors": [] },
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

        text_content = response.text if response.text else ""
        data = extract_json_payload(text_content)

        if not data:
            print("Error: Could not parse a valid JSON object from the response.")
            # 强制抛出异常以便在 GitHub Actions 中标记为失败
            exit(1)

        # 检查并修正日期
        if not data.get("date") or "YYYY" in data["date"]:
            data["date"] = time.strftime('%Y-%m-%d')

        # 路径设置
        base_dir = os.path.dirname(os.path.abspath(__file__))
        public_dir = os.path.join(base_dir, "public")
        os.makedirs(public_dir, exist_ok=True)

        # 1. 保存 JSON
        json_path = os.path.join(public_dir, "news_data.json")
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"JSON data saved to {json_path}")

        # 2. 生成 Markdown
        updated_at = time.strftime('%Y-%m-%d %H:%M:%S')
        lines = [
            f"# Aluminum Industry Insights ({data['date']})",
            f"Last Updated: {updated_at} UTC",
            "",
            "## English",
        ]
        
        def append_section(target_lines, title, items):
            target_lines.append(f"### {title}")
            if not items:
                target_lines.append("- No data available for this section.")
            else:
                for item in items:
                    target_lines.append(f"- {item}")
            target_lines.append("")

        for section in [("LME Analysis", "lme"), ("Corporate", "corporate"), ("Trends", "trends"), ("Factors", "factors")]:
            append_section(lines, section[0], data["en"].get(section[1], []))
        
        lines.append("## Arabic")
        for section in [("تحليل LME", "lme"), ("تحديثات الشركات", "corporate"), ("التوجهات", "trends"), ("العوامل", "factors")]:
            append_section(lines, section[0], data["ar"].get(section[1], []))

        # 写入两个位置的 Markdown 文件
        for path in [os.path.join(base_dir, "aluminum_industry_news.md"), 
                     os.path.join(public_dir, "aluminum_industry_news.md")]:
            with open(path, "w", encoding="utf-8") as f:
                f.write("\n".join(lines))
        
        print("Markdown reports generated successfully.")

    except Exception as e:
        if "429" in str(e):
            print("QUOTA_EXHAUSTED: Free tier limit reached.")
            exit(0)
        else:
            traceback.print_exc()
            exit(1)

if __name__ == "__main__":
    main()
