import os
import time
import json
try:
    from google import genai
    from google.genai import types
except ImportError as e:
    with open("debug_error.log", "w") as f:
        f.write(f"ImportError: {e}")
    print(f"ImportError: {e}")
    exit(1)

def main():
    client = genai.Client()
    
    # Updated prompt for bilingual JSON output
    prompt = """
    Provide a summary of the latest global aluminum industry news (current date) including LME prices, corporate updates, industry trends, and strategic factors.
    
    Output MUST be a valid JSON object with the following structure:
    {
      "date": "YYYY-MM-DD",
      "en": {
        "lme": ["point 1", "point 2", ...],
        "corporate": ["point 1", "point 2", ...],
        "trends": ["point 1", "point 2", ...],
        "factors": ["point 1", "point 2", ...]
      },
      "ar": {
        "lme": ["point 1 (Arabic)", "point 2 (Arabic)", ...],
        "corporate": ["point 1 (Arabic)", "point 2 (Arabic)", ...],
        "trends": ["point 1 (Arabic)", "point 2 (Arabic)", ...],
        "factors": ["point 1 (Arabic)", "point 2 (Arabic)", ...]
      }
    }
    Ensure the Arabic translation is professional and accurate for the aluminum industry context.
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
        
        if response.text:
            base_dir = os.path.dirname(os.path.abspath(__file__))
            
            # Save JSON to public directory
            json_path = os.path.join(base_dir, "public", "news_data.json")
            
            # Parse to ensure validity before saving (and for pretty printing)
            data = None
            try:
                data = json.loads(response.text)
                # Ensure date is set if model didn't provide it strictly
                if not data.get("date") or data["date"] == "YYYY-MM-DD":
                    data["date"] = time.strftime('%Y-%m-%d')
                
                with open(json_path, "w", encoding="utf-8") as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)
                print(f"Successfully updated news JSON at {json_path}")
                
            except json.JSONDecodeError:
                print("Error: Model did not return valid JSON")
                # Fallback or error handling could go here
                return
                
            # Optional: Keep the markdown file for reference (simplified)
            updated_at = time.strftime('%Y-%m-%d %H:%M:%S')

            def append_section(lines, title, items):
                lines.append(f"### {title}")
                for item in items:
                    lines.append(f"- {item}")
                lines.append("")

            lines = [
                "# Industry Insights",
                f"Last Updated: {updated_at} UTC",
                "",
                "## English",
            ]
            append_section(lines, "LME Price Analysis", data["en"]["lme"])
            append_section(lines, "Corporate Updates", data["en"]["corporate"])
            append_section(lines, "Industry Trends", data["en"]["trends"])
            append_section(lines, "Strategic Factors", data["en"]["factors"])
            lines.append("## Arabic")
            append_section(lines, "تحليل السوق وبورصة لندن (LME)", data["ar"]["lme"])
            append_section(lines, "تحديثات الشركات", data["ar"]["corporate"])
            append_section(lines, "توجهات الصناعة", data["ar"]["trends"])
            append_section(lines, "عوامل استراتيجية", data["ar"]["factors"])

            for md_path in [
                os.path.join(base_dir, "aluminum_industry_news.md"),
                os.path.join(base_dir, "public", "aluminum_industry_news.md"),
            ]:
                with open(md_path, "w", encoding="utf-8") as f:
                    f.write("\n".join(lines))

        else:
            print("API returned empty text.")

    except Exception as e:
        if "429" in str(e):
            print("QUOTA_EXHAUSTED: Today's free limit reached. Skipping update.")
            exit(0) 
        else:
            print(f"Error: {e}")
            exit(1)

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        with open("debug_error.log", "w") as f:
            f.write(str(e))
            import traceback
            f.write(traceback.format_exc())
        print(f"Failed with error: {e}")
