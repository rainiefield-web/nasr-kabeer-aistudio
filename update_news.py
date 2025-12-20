import os
from google import genai

def main():
    # The client automatically looks for the GEMINI_API_KEY environment variable
    # If you use a different name, use: client = genai.Client(api_key=os.environ['YOUR_VAR'])
    client = genai.Client()

    prompt = "Summarize the latest AI news from the last 24 hours into 5 bullet points."

    try:
        # Switching to gemini-2.0-flash (Faster and more reliable than the old 'pro')
        response = client.models.generate_content(
            model="gemini-2.0-flash", 
            contents=prompt
        )
        
        print(response.text)
        
        # Save to file or proceed with your logic
        with open("news_summary.txt", "w") as f:
            f.write(response.text)

    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    main()
