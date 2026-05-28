/* ============================================================
   YouTube AI Summarizer – Popup Logic
   ============================================================ */

(function () {
  'use strict';

  // ── DOM refs ──────────────────────────────────────────────
  const themeToggle  = document.getElementById('theme-toggle');
  const toggleIcon   = document.getElementById('toggle-icon');
  const summarizeBtn = document.getElementById('summarize-btn');
  const btnText      = document.getElementById('btn-text');
  const btnSpinner   = document.getElementById('btn-spinner');
  const videoTitle   = document.getElementById('video-title');
  const channelName  = document.getElementById('channel-name');
  const summaryText  = document.getElementById('summary-text');

  const API_ENDPOINT = '127.0.0.1';

  // ── Theme Management ─────────────────────────────────────
  function applyTheme(theme) {
    if (theme === 'light') {
      document.body.classList.add('light');
      toggleIcon.textContent = '☀️';
    } else {
      document.body.classList.remove('light');
      toggleIcon.textContent = '🌙';
    }
  }

  // Load saved preference (default → dark)
  const savedTheme = localStorage.getItem('yt-summarizer-theme') || 'dark';
  applyTheme(savedTheme);

  themeToggle.addEventListener('click', () => {
    const isDark = !document.body.classList.contains('light');
    const next   = isDark ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem('yt-summarizer-theme', next);
  });

  // ── Loading State helpers ────────────────────────────────
  function showLoading() {
    summarizeBtn.disabled = true;
    btnText.textContent   = 'Summarizing…';
    btnSpinner.classList.remove('hidden');
    summaryText.classList.remove('error');
    summaryText.innerHTML =
      '<div class="skeleton-line" style="width:100%"></div>' +
      '<div class="skeleton-line"></div>' +
      '<div class="skeleton-line"></div>' +
      '<div class="skeleton-line"></div>' +
      '<div class="skeleton-line"></div>';
  }

  function hideLoading() {
    summarizeBtn.disabled = false;
    btnText.textContent   = 'Summarize Video';
    btnSpinner.classList.add('hidden');
  }

  // ── Fetch active YouTube URL ─────────────────────────────
  function getActiveYouTubeUrl() {
    return new Promise((resolve, reject) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (chrome.runtime.lastError) {
          return reject(new Error(chrome.runtime.lastError.message));
        }
        const tab = tabs && tabs[0];
        if (!tab || !tab.url) {
          return reject(new Error('Unable to access the current tab.'));
        }
        if (!tab.url.includes('youtube.com/watch')) {
          return reject(new Error('This is not a YouTube video page.\nPlease navigate to a YouTube video and try again.'));
        }
        resolve(tab.url);
      });
    });
  }

  // ── Format summary text (preserve bullets / newlines) ────
  function formatSummary(raw) {
    // Escape HTML entities
    const escaped = raw
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Convert markdown-style bold **text** → <strong>text</strong>
    const bolded = escaped.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    // Convert lines starting with "- " into styled bullet points
    const bulleted = bolded.replace(
      /^- (.+)$/gm,
      '<span style="display:flex;gap:6px;align-items:flex-start"><span style="color:var(--accent);font-weight:700">•</span><span>$1</span></span>'
    );

    return bulleted;
  }

  // ── Summarize handler ────────────────────────────────────
  summarizeBtn.addEventListener('click', async () => {
    showLoading();

    let url;
    try {
      url = await getActiveYouTubeUrl();
    } catch (err) {
      hideLoading();
      summaryText.classList.add('error');
      summaryText.textContent = err.message;
      return;
    }

    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        let errMsg = `Server error (${response.status})`;
        try {
          const errBody = await response.json();
          if (errBody.detail) errMsg = errBody.detail;
        } catch (_) { /* ignore parse errors */ }
        throw new Error(errMsg);
      }

      const data = await response.json();

      // Populate metadata
      videoTitle.textContent  = data.title   || '—';
      channelName.textContent = data.channel  || '—';

      // Populate formatted summary
      const rawSummary = data.summary || 'No summary returned.';
      summaryText.classList.remove('error');
      summaryText.innerHTML = formatSummary(rawSummary);

    } catch (err) {
      summaryText.classList.add('error');
      summaryText.innerHTML = '';
      summaryText.textContent = `⚠ ${err.message}`;
    } finally {
      hideLoading();
    }
  });
})();
