import os
import time
from google import genai
from google.genai import types

def main():
    # 自动获取环境变量 GEMINI_API_KEY
    client = genai.Client()

    prompt = """
    Search for the latest news (Dec 20, 2025) about the global aluminum industry.
    Focus on LME prices, green aluminum, and corporate updates (Alcoa, Rio Tinto).
    Provide a summary in English with source links.
    """

    try:
        print("Fetching aluminum industry news...")
        
        # 修正后的 Gemini 2.0 搜索工具语法
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                tools=[types.Tool(google_search=types.GoogleSearch())]
            )
        )
        
        if not response.text:
            print("Received empty response. It might still be 'loading' internally.")
            return

        # 保存到文件
        base_dir = os.path.dirname(os.path.abspath(__file__))
        file_path = os.path.join(base_dir, "aluminum_industry_news.md")

        with open(file_path, "w", encoding="utf-8") as f:
            f.write(f"Last Updated: {time.strftime('%Y-%m-%d %H:%M:%S')} UTC\n\n")
            f.write(response.text)
            
        print("Success: aluminum_industry_news.md updated.")

    except Exception as e:
        if "429" in str(e):
            print("Error: API Quota exhausted (429). Please wait a few minutes before trying again.")
        else:
            print(f"An unexpected error occurred: {e}")

if __name__ == "__main__":
    main()
