# TubeMind — YouTube AI Analyzer

A Next.js web application for extracting available YouTube captions, understanding video content, and studying natural spoken-English patterns. It also exposes an MCP endpoint for compatible AI clients.

## Features

- Paste a YouTube URL and retrieve accessible captions.
- View video metadata and transcript segments.
- Analyze summaries, speaking-style observations, English expressions, grammar patterns, idea development, and practice exercises.
- Optional OpenAI-compatible AI provider configuration.
- Basic heuristic analysis works without an AI API key.
- MCP tools exposed at `/api/mcp`:
  - `get_video_info`
  - `get_transcript`
  - `analyse_speaking_style`
  - `extract_english_patterns`
  - `search_transcript`

## Requirements

- Node.js 20+
- npm

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000.

To enable deeper AI analysis, set `AI_API_KEY` in `.env.local`. The default provider is OpenAI-compatible. You can change `AI_BASE_URL` and `AI_MODEL` for another compatible provider. Never expose this key in client-side code.

## Deploy to Vercel

Import this repository into Vercel or connect it through the Vercel Git integration. Add the optional environment variables from `.env.example` in Project Settings → Environment Variables, then deploy.

## Connect an MCP client

Use the deployed endpoint:

```
https://YOUR-DEPLOYMENT.vercel.app/api/mcp
```

The endpoint uses the MCP Streamable HTTP transport. Connect it through an MCP client that supports remote Streamable HTTP servers. Availability of custom MCP connections in ChatGPT depends on the user's ChatGPT plan and workspace settings.

## Important notes

- A public video does not necessarily have retrievable captions. Transcript extraction depends on captions being available and accessible.
- YouTube may rate-limit or change its caption interfaces. Treat transcript retrieval as best-effort.
- This first version does not download video or audio and does not bypass private, age-restricted, or access-controlled content.
- Transcript text is not enough to assess pronunciation, intonation, or vocal delivery. Those require audio analysis.
