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
    极致容错版解析器：
    1. 移除 Markdown 标签和搜索引用。
    2. 仅提取第一个闭合的 JSON 对象，防止重复对象干扰。
    3. 处理 JSON 内部的非法换行。
    """
    if not text:
        return None
    
    print("\n--- [DEBUG] API Original Response Start ---")
    print(text)
    print("--- [DEBUG] API Original Response End ---\n")

    # 1. 预清洗：剥离所有 Markdown 符号和搜索来源引用
    # 移除 ```json, ```,, [1] 等
    cleaned = text.replace("```json", "").replace("```", "")
    cleaned = re.sub(r'\', '', cleaned)
    cleaned = re.sub(r'\[\d+\]', '', cleaned)
    cleaned = cleaned.strip()

    # 2. 核心提取：非贪婪匹配第一个 { ... }
    # 使用 (\{.*?\}) 确保在遇到第一个 '}' 时就停止匹配
    match = re.search(r'(\{.*?\})', cleaned, re.DOTALL)
    
    if match:
        json_str = match.group(1)
        try:
            # 尝试标准解析
            return json.loads(json_str)
        except json.JSONDecodeError:
            try:
                # 进阶修复：移除 JSON 内部可能存在的硬回车（换行符）
                sanitized_str = re.sub(r'\n\s*', ' ', json_str)
                # 移除键值对末尾可能多出的逗号
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
    
    # 优化 Prompt：明确要求翻译，不准留空，不准重复
    prompt = """
    Search for today's global aluminum industry news (LME prices, corporate, trends).
    Requirement:
    1. Provide key points in English.
    2. TRANSLATE all English points into professional Arabic. Do NOT leave the 'ar' section empty.
    3. Output ONCE as a single JSON object. No Markdown.
    
    Structure:
    {
      "date": "YYYY-MM-DD",
      "en": { "lme": [], "corporate": [], "trends": [], "factors": [] },
      "ar": { "lme": [], "corporate": [], "trends": [], "factors": [] }
    }
    """

    try:
        # 使用 Gemini 2.0 Flash 配合 Google Search
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
            print("Error: Failed to extract a valid JSON object.")
            exit(1)

        # 校验日期
        if not data.get("date") or "YYYY" in data["date"]:
            data["date"] = time.strftime('%Y-%m-%d')

        # 文件操作
        base_dir = os.path.dirname(os.path.abspath(__file__))
        public_dir = os.path.join(base_dir, "public")
        os.makedirs(public_dir, exist_ok=True)

        # 1. 保存 JSON 数据
        json_path = os.path.join(public_dir, "news_data.json")
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"JSON data successfully updated at: {json_path}")

        # 2. 生成 Markdown 报告
        updated_at = time.strftime('%Y-%m-%d %H:%M:%S')
        md_lines = [
            f"# Aluminum Industry News Summary ({data['date']})",
            f"Last Updated: {updated_at} UTC",
            "",
            "## English Analysis",
        ]
        
        def add_md_section(lines, title, items):
            lines.append(f"### {title}")
            if not items:
                lines.append("- (No specific data found for this section)")
            else:
                for item in items:
                    lines.append(f"- {item}")
            lines.append("")

        sections = [("lme", "LME Price & Market"), ("corporate", "Corporate Updates"), 
                    ("trends", "Industry Trends"), ("factors", "Strategic Factors")]

        for key, title in sections:
            add_md_section(md_lines, title, data["en"].get(key, []))
        
        md_lines.append("## Arabic Summary (الملخص العربي)")
        ar_sections = [("lme", "تحليل بورصة لندن"), ("corporate", "تحديثات الشركات"), 
                       ("trends", "توجهات الصناعة"), ("factors", "العوامل الاستراتيجية")]
        
        for key, title in ar_sections:
            add_md_section(md_lines, title, data["ar"].get(key, []))

        # 写入文件
        for target in [os.path.join(base_dir, "aluminum_industry_news.md"),
                       os.path.join(public_dir, "aluminum_industry_news.md")]:
            with open(target, "w", encoding="utf-8") as f:
                f.write("\n".join(md_lines))
        
        print("Markdown reports updated successfully.")

    except Exception as e:
        if "429" in str(e):
            print("QUOTA_EXHAUSTED: Free tier limit reached. Skipping.")
            exit(0)
        else:
            traceback.print_exc()
            exit(1)

if __name__ == "__main__":
    main()
