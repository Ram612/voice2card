# Voice → Visiting Card (Client-only)

This is a small web app that records voice (via Web Speech API), extracts contact and profile details using JavaScript heuristics, and builds a downloadable visiting card (PNG/PDF). No backend, no API key.

## How to use

1. Create a new GitHub repo and add these files: `index.html`, `script.js`, `style.css`, `README.md`.
2. Push to the `main` branch and enable **GitHub Pages** (Settings → Pages → Main branch).
3. Open the site URL served by GitHub Pages.
4. Allow microphone access and click **Start Transcription**. Speak clearly:  
   _Example:_ “Hi, I’m Ram Kumar, Technical Architect at Alpha Solutions. Email ram@alpha.com, phone +91 900000000. I specialise in AI, Odoo and React.”
5. Stop recording and click **Extract Profile & Generate Card**. The visiting card preview will populate.
6. Click **Download PNG** or **Download PDF** to save the card.

## Notes

- Web Speech API works best in Chrome and Edge. Safari support can be limited.
- If the browser doesn't support speech recognition, paste your transcript in the text box.
- Extraction is heuristic-based (regex + rules). For more accurate extraction, consider adding a client-side LLM (WebLLM), but that increases browser download size.

## Optional improvements

- Add QR/vCard export
- Add color templates and layout options
- Allow saving cards to GitHub Gists (requires OAuth)
- Replace heuristics with an on-device LLM for better parsing

## License
MIT
