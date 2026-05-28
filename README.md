# YouTube AI Summarizer

An AI-powered Chrome/Edge extension that generates structured summaries of YouTube videos using Google's Gemini API.

## Project Structure

```
yt_summarize/
├── extension/                # Browser extension files
│   ├── manifest.json
│   ├── popup.html
│   ├── popup.js
│   └── popup.css
└── yt_summarizer_backend/   # FastAPI backend
    ├── main.py              # API endpoints
    ├── extractor.py         # YouTube transcript extraction
    ├── summarizer.py        # Gemini AI summarization
    ├── requirements.txt
    └── .env.example         # Configuration template
```

## Setup Instructions

### Backend Setup

1. **Create virtual environment:**
   ```powershell
   cd yt_summarizer_backend
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```

2. **Install dependencies:**
   ```powershell
   pip install -r requirements.txt
   ```

3. **Configure environment variables:**
   - Copy `.env.example` to `.env`
   - Add your Gemini API key (get from https://aistudio.google.com/app/apikeys)
   ```
   GEMINI_API_KEY=your-api-key-here
   ```

4. **Run the backend:**
   ```powershell
   uvicorn main:app --reload
   ```
   The API will be available at `http://127.0.0.1:8000`

### Extension Setup

1. **Load unpacked extension in Edge/Chrome:**
   - Open `edge://extensions/` or `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `extension/` folder

2. **Verify connectivity:**
   - Backend must be running at `http://127.0.0.1:8000/api/summarize`
   - Navigate to a YouTube video
   - Click the extension icon and press "Summarize Video"

## Security Notes

- ⚠️ **NEVER commit `.env` files** — they contain API keys
- `.env` is in `.gitignore` for protection
- Use `.env.example` as a template for new developers
- Rotate API keys if exposed

## API Endpoints

- **GET** `/` — Health check
- **POST** `/api/summarize` — Summarize a YouTube video
  - Body: `{ "url": "https://youtube.com/watch?v=..." }`
  - Returns: `{ "success": true, "title": "...", "channel": "...", "summary": "..." }`

## Technologies

- **Frontend:** JavaScript, Chrome Extension API
- **Backend:** FastAPI (Python)
- **AI:** Google Gemini 2.5 Flash
- **Data Extraction:** youtube-transcript-api
