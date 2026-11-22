# TubeMind — YouTube AI Analyzer

A Next.js web application for extracting available YouTube captions, understanding video content, and studying natural spoken-English patterns. It also exposes an MCP endpoint for compatible AI clients.

## Features

- Paste a YouTube URL and retrieve accessible captions.
- View video metadata and transcript segments.
- Analyze summaries, speaking-style observations, English expressions, grammar patterns, idea development, and practice exercises.
- xAI Grok-powered analysis through the OpenAI-compatible Chat Completions API.
- MCP tools exposed at `/api/mcp`: `get_video_info`, `get_transcript`, `analyse_speaking_style`, `extract_english_patterns`, and `search_transcript`.

## Requirements

- Node.js 20+
- npm

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Set `XAI_API_KEY` to an xAI API key. Defaults are `AI_BASE_URL=https://api.x.ai/v1` and `AI_MODEL=grok-4.7`. Never expose the key in client-side code.

## Deploy to Vercel

Import this repository into Vercel or connect it through the Vercel Git integration. Add `XAI_API_KEY` as an encrypted server-side environment variable for Production and Preview, then redeploy.

## MCP endpoint

`https://YOUR-DEPLOYMENT.vercel.app/api/mcp`

Connect through an MCP client that supports remote Streamable HTTP servers. ChatGPT custom MCP availability depends on plan and workspace settings.

## Important notes

- Public videos do not necessarily have retrievable captions. Transcript retrieval depends on captions being available and accessible.
- YouTube may rate-limit or change its caption interfaces. Retrieval is best-effort.
- This app does not download video/audio or bypass private, age-restricted, or access-controlled content.
- Transcript text alone cannot assess pronunciation, intonation, or vocal delivery; those require audio analysis.
