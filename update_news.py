import os
import time
from google import genai
from google.genai import types

def main():
    client = genai.Client()
    
    # 铝行业搜索提示词
    prompt = "Provide a summary of the latest global aluminum industry news (Dec 20, 2025) including LME prices and key company updates with source links."

    try:
        # 核心修复：使用正确的 GoogleSearch() 工具
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                tools=[types.Tool(google_search=types.GoogleSearch())]
            )
        )
        
        if response.text:
            base_dir = os.path.dirname(os.path.abspath(__file__))
            file_path = os.path.join(base_dir, "aluminum_industry_news.md")
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(f"Last Updated: {time.strftime('%Y-%m-%d %H:%M:%S')} UTC\n\n")
                f.write(response.text)
            print("Successfully updated news.")
        else:
            print("API returned empty text.")

    except Exception as e:
        if "429" in str(e):
            print("QUOTA_EXHAUSTED: Today's free limit reached. Skipping update.")
            # 正常退出，不触发 GitHub Action 报错红叉
            exit(0) 
        else:
            print(f"Error: {e}")
            exit(1)

if __name__ == "__main__":
    main()
