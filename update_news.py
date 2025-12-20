import os
import time
import json
import re
import traceback

try:
    from google import genai
    from google.genai import types
except ImportError as e:
    with open("debug_error.log", "w") as f:
        f.write(f"ImportError: {e}")
    print(f"ImportError: {e}")
    exit(1)

def extract_json_payload(text):
    """
    增强版 JSON 提取函数，能够处理 Markdown 标签和搜索引用。
    """
    if not text:
        return None
    
    # 打印原始响应以供 GitHub Actions 调试
    print("\n--- [DEBUG] API Original Response Start ---")
    print(text)
    print("--- [DEBUG] API Original Response End ---\n")

    # 清洗：移除常见的干扰项（如搜索引用标记 [1], [2]）
    cleaned = re.sub(r'\[\d+\]', '', text)
    
    # 策略 1：寻找第一个 { 和最后一个 } 之间的内容
    match = re.search(r'(\{.*\})', cleaned, re.DOTALL)
    if match:
        json_str = match.group(1)
        try:
            return json.loads(json_str)
        except json.JSONDecodeError:
            # 如果解析失败，尝试进一步清洗可能导致失败的换行符
            try:
                # 针对 JSON 内部可能存在的非法控制字符进行处理
                return json.loads(json_str.replace('\n', ' ').replace('\r', ''))
            except:
                pass
    
    return None

def main():
    # 确保 API KEY 存在
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("Error: GEMINI_API_KEY is not set.")
        exit(1)

    client = genai.Client(api_key=api_key)
    
    # 在 Prompt 中增加严格约束
    prompt = """
    Provide a summary of the latest global aluminum industry news (for today's date) including LME prices, corporate updates, industry trends, and strategic factors.
    
    OUTPUT INSTRUCTIONS:
    - You MUST return a valid JSON object.
    - DO NOT include any markdown formatting like ```json.
    - DO NOT include any introductory text or search citations like [1].
    - Use the following structure:
    {
      "date": "YYYY-MM-DD",
      "en": {
        "lme": ["point 1", "point 2"],
        "corporate": ["point 1"],
        "trends": ["point 1"],
        "factors": ["point 1"]
      },
      "ar": {
        "lme": ["Arabic point 1"],
        "corporate": ["Arabic point 1"],
        "trends": ["Arabic point 1"],
        "factors": ["Arabic point 1"]
      }
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
            print("Error: Model did not return valid JSON or parser failed.")
            return

        # 补全日期（如果模型没提供或格式错误）
        if not data.get("date") or "YYYY" in data["date"]:
            data["date"] = time.strftime('%Y-%m-%d')

        base_dir = os.path.dirname(os.path.abspath(__file__))
        
        # 确保 public 目录存在
        public_dir = os.path.join(base_dir, "public")
        os.makedirs(public_dir, exist_ok=True)

        # 写入 JSON
        json_path = os.path.join(public_dir, "news_data.json")
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"Successfully updated: {json_path}")

        # 生成 Markdown 内容
        updated_at = time.strftime('%Y-%m-%d %H:%M:%S')
        lines = [
            "# Aluminum Industry Insights",
            f"Last Updated: {updated_at} UTC",
            "",
            "## English",
        ]
        
        def append_section(target_lines, title, items):
            target_lines.append(f"### {title}")
            for item in items:
                target_lines.append(f"- {item}")
            target_lines.append("")

        append_section(lines, "LME Price Analysis", data["en"].get("lme", []))
        append_section(lines, "Corporate Updates", data["en"].get("corporate", []))
        append_section(lines, "Industry Trends", data["en"].get("trends", []))
        append_section(lines, "Strategic Factors", data["en"].get("factors", []))
        
        lines.append("## Arabic")
        append_section(lines, "تحليل السوق وبورصة لندن (LME)", data["ar"].get("lme", []))
        append_section(lines, "تحديثات الشركات", data["ar"].get("corporate", []))
        append_section(lines, "توجهات الصناعة", data["ar"].get("trends", []))
        append_section(lines, "عوامل استراتيجية", data["ar"].get("factors", []))

        # 保存 Markdown 文件
        md_paths = [
            os.path.join(base_dir, "aluminum_industry_news.md"),
            os.path.join(public_dir, "aluminum_industry_news.md"),
        ]
        for path in md_paths:
            with open(path, "w", encoding="utf-8") as f:
                f.write("\n".join(lines))
        print("Markdown files updated successfully.")

    except Exception as e:
        if "429" in str(e):
            print("QUOTA_EXHAUSTED: Skipping update today.")
        else:
            print(f"Unexpected Error: {e}")
            traceback.print_exc()
            exit(1)

if __name__ == "__main__":
    main()
