import os
from google import genai

def main():
    # The client automatically looks for the GEMINI_API_KEY environment variable
    client = genai.Client()

    prompt = "Summarize the top AI and tech news stories from the last 24 hours into 5 concise bullet points."

    try:
        # Using gemini-2.0-flash (stable) or gemini-3-flash (latest)
        response = client.models.generate_content(
            model="gemini-2.0-flash", 
            contents=prompt
        )
        
        summary = response.text
        print("--- News Summary ---")
        print(summary)
        
        # Save results
        with open("news_summary.txt", "w") as f:
            f.write(summary)

    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    main()
