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

# --- 深度配置 ---
SITES_QUERY = "Reuters, Bloomberg Metals, Fastmarkets, LME Official, AlCircle, Aluminium Insider, IAI, Alcoa News, Rio Tinto, Rusal, Hydro, EGA, SMM (Metal.com)."

def clean_text(text):
    """清理 AI 幻觉生成的引用标签和假设性 URL"""
    if not text: return ""
    # 修正后的第 21 行：正确匹配 标签
    text = re.sub(r'\', '', text)
    text = re.sub(r'hypothetical\S+', '', text)
    return text.strip()

def extract_json(text):
    """极致容错 JSON 提取"""
    if not text: return None
    cleaned = re.sub(r'\[\d+\]', '', text.replace("```json", "").replace("```", "")).strip()
    start = cleaned.find("{")
    while start != -1:
        try:
            return json.JSONDecoder().raw_decode(cleaned[start:])[0]
        except:
            start = cleaned.find("{", start + 1)
    return None

def fetch_content(client, prompt):
    """带重试机制的抓取"""
    for model_name in ["gemini-2.0-flash", "gemini-1.5-pro"]:
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    tools=[types.Tool(google_search=types.GoogleSearch())]
                )
            )
            data = extract_json(response.text)
            if data: return data
        except: continue
    return None

def main():
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key: exit(1)
    client = genai.Client(api_key=api_key)
    
    current_time_utc = datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')
    
    # 修复了 JSON 模板中的大括号双写问题
    lme_prompt = f"""
    TASK: Get LME Primary Aluminum Cash Settlement Price. 
    INSTRUCTION: If today is a holiday/weekend, you MUST search for the LATEST available closing price from the most recent trading day. 
    DO NOT return empty. Check Investing.com or LME official data.
    OUTPUT FORMAT (JSON): {{ "en": {{ "lme": [{{ "price": "$xxxx.xx", "change": "±x.x%", "date": "YYYY-MM-DD" }}] }} }}
    """

    news_prompt = f"""
    TASK: Deep scan aluminum industry news from: {SITES_QUERY}.
    REQUIREMENTS: 
    1. Extract 5-8 REAL news bullets. 
    2. NO HYPOTHETICAL URLs. 
    3. Remove all "" or similar tags.
    4. Provide professional Arabic translation.
    OUTPUT FORMAT (JSON): {{ "en": {{ "corporate": [{{ "bullet": "...", "url": "..." }}], "trends": [] }}, "ar": {{ "corporate": [] }} }}
