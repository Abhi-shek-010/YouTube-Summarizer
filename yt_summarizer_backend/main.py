from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, HttpUrl
from extractor import get_youtube_transcript
from summarizer import generate_summary

app = FastAPI(title="YouTube Video Summarizer AI Backend")

# Define the structure of data our API expects to receive via Pydantic
class VideoRequest(BaseModel):
    url: str

@app.get("/")
def home():
    return {"message": "The AI Video Summarizer Backend is live!"}

@app.post("/api/summarize")
def summarize_video(payload: VideoRequest):
    """
    Accepts a YouTube URL, retrieves its transcript, processes it through 
    the AI engine, and returns a comprehensive structured summary.
    """
    try:
        # Step 1: Extract text transcript
        transcript = get_youtube_transcript(payload.url)
        
        # Step 2: Generate abstractive summary via Gemini
        summary = generate_summary(transcript)
        
        # Step 3: Return payload back to client
        return {
            "success": True,
            "summary": summary
        }
        
    except ValueError as ve:
        # Handles malformed URL inputs specifically
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        # Handles backend failures gracefully without crashing the server
        raise HTTPException(status_code=500, detail=str(e))