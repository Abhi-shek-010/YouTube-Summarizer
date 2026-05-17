import re
from youtube_transcript_api import YouTubeTranscriptApi

def extract_video_id(url: str) -> str:
    """
    Extracts the 11-character YouTube video ID from various URL formats.
    e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ -> dQw4w9WgXcQ
    """
    pattern = r'(?:v=|\/v\/|youtu\.be\/|\/embed\/)([a-zA-Z0-9_-]{11})'
    match = re.search(pattern, url)
    if match:
        return match.group(1)
    raise ValueError("Invalid YouTube URL format.")

def get_youtube_transcript(url: str) -> str:
    """
    Fetches the full text transcript of a YouTube video.
    """
    try:
        video_id = extract_video_id(url)
        # Fetch the transcript data list
        ytt_api = YouTubeTranscriptApi()
        transcript_pieces = ytt_api.fetch(video_id)
        # transcript_pieces = YouTubeTranscriptApi.get_transcript(video_id)
        
        # The API returns a list of dicts: [{'text': 'Hello', 'start': 0.1, 'duration': 1.0}, ...]
        # We join all individual text pieces into a single continuous string
        full_text = " ".join([item.text for item in transcript_pieces])
        return full_text
        
    except Exception as e:
        raise RuntimeError(f"Could not retrieve transcript: {str(e)}")