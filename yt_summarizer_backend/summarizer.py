import os
from google import genai
from dotenv import load_dotenv

# Load variables from the .env file
load_dotenv()

# Initialize the Gemini Client using the environment variable
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def generate_summary(transcript_text: str) -> str:
    """
    Sends the transcript text to Gemini and asks for a structured summary.
    """
    prompt = (
        "You are an expert content summarizer. Analyze the following YouTube video transcript "
        "and provide a highly structured summary. Use an overview paragraph, followed by bullet points "
        "highlighting key takeaways, actionable insights, and core conclusions.\n\n"
        f"Transcript:\n{transcript_text}"
    )
    
    try:
        # Utilizing gemini-2.5-flash for rapid text summarization tasks
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        return response.text
    except Exception as e:
        raise RuntimeError(f"AI Generation failed: {str(e)}")