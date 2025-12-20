import os
from google import genai
from google.genai import types

def main():
    client = genai.Client()

    # 针对铝行业的详细提示词
    prompt = """
    Search for the most important news from the last 24 hours regarding the global aluminum industry. 
    Focus on:
    1. LME (London Metal Exchange) aluminum prices and trends.
    2. Major supply chain updates, mining news, and smelter activities.
    3. Sustainability and green aluminum news.
    4. Key corporate announcements from companies like Alcoa, Rio Tinto, or Rusal.
    
    Please provide a concise summary in English with 5-8 bullet points, 
    and include the source links for each news item.
    """

    try:
        # 启用 Google 搜索工具以获取最新行业动态
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                tools=[types.Tool(google_search=types.GoogleSearchRetrieval())]
            )
        )
        
        content = response.text
        
        # 将内容写入文件
        # 使用 'w' 模式覆盖旧内容，如果你想保留历史，请改为 'a' (append)
        with open("aluminum_industry_news.md", "w", encoding="utf-8") as f:
            f.write(f"# Aluminum Industry News Update ({os.popen('date').read().strip()})\n\n")
            f.write(content)
            
        print("News successfully fetched and saved.")

    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    main()
