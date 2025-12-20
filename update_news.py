import os
import google.generativeai as genai
import feedparser
from datetime import datetime

# 1. 配置 AI
genai.configure(api_key=os.environ["GEMINI_API_KEY"])
model = genai.GenerativeModel('gemini-pro')

# 2. 抓取铝行业新闻 (使用 SMM 英文版 RSS)
news_feed = feedparser.parse("https://rss.metal.com/news/industry_news.xml")
entries = news_feed.entries[:5]  # 只取前 5 条最新的

news_text = ""
for entry in entries:
    news_text += f"Title: {entry.title}\nLink: {entry.link}\n\n"

# 3. 让 AI 总结
prompt = f"You are a professional Aluminum Industry Analyst. Summarize the following news into a clean, professional English report for international readers. Use bullet points and include the original links. \n\nNews:\n{news_text}"
response = model.generate_content(prompt)

# 4. 把结果写入文件
now = datetime.now().strftime("%Y-%m-%d %H:%M")
header = f"# Global Aluminum Industry Daily Update\n*Last updated: {now} (UTC)*\n\n"
with open("AL_NEWS.md", "w", encoding="utf-8") as f:
    f.write(header + response.text)
