import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { z } from "zod";
import { analyzeTranscript } from "@/lib/analysis";
import { extractVideoId, getTranscript, getVideoMetadata } from "@/lib/youtube";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function createServer() {
  const server = new McpServer({ name: "tubemind-youtube-analyzer", version: "1.0.0" });

  server.tool("get_video_info", "Get the title, channel, thumbnail and URL for a public YouTube video.", {
    videoUrl: z.string().url().describe("Full YouTube video URL")
  }, async ({ videoUrl }) => {
    const id = extractVideoId(videoUrl);
    if (!id) return { content: [{ type: "text", text: "Invalid YouTube video URL." }], isError: true };
    const info = await getVideoMetadata(id);
    return { content: [{ type: "text", text: JSON.stringify(info, null, 2) }] };
  });

  server.tool("get_transcript", "Retrieve available captions/transcript for a YouTube video.", {
    videoUrl: z.string().url().describe("Full YouTube video URL")
  }, async ({ videoUrl }) => {
    const id = extractVideoId(videoUrl);
    if (!id) return { content: [{ type: "text", text: "Invalid YouTube video URL." }], isError: true };
    const transcript = await getTranscript(id);
    return { content: [{ type: "text", text: JSON.stringify(transcript) }] };
  });

  server.tool("analyse_speaking_style", "Analyze a YouTube transcript for communication structure, conversational style, transitions and idea development. Transcript evidence only; audio features cannot be inferred.", {
    videoUrl: z.string().url().describe("Full YouTube video URL")
  }, async ({ videoUrl }) => {
    const id = extractVideoId(videoUrl);
    if (!id) return { content: [{ type: "text", text: "Invalid YouTube video URL." }], isError: true };
    const [video, transcript] = await Promise.all([getVideoMetadata(id), getTranscript(id)]);
    const analysis = await analyzeTranscript({ title: video.title, author: video.author, text: transcript.text });
    return { content: [{ type: "text", text: JSON.stringify({ video, analysis }, null, 2) }] };
  });

  server.tool("extract_english_patterns", "Extract useful everyday English expressions, grammar patterns and speaking practice from a YouTube video transcript.", {
    videoUrl: z.string().url().describe("Full YouTube video URL")
  }, async ({ videoUrl }) => {
    const id = extractVideoId(videoUrl);
    if (!id) return { content: [{ type: "text", text: "Invalid YouTube video URL." }], isError: true };
    const [video, transcript] = await Promise.all([getVideoMetadata(id), getTranscript(id)]);
    const analysis = await analyzeTranscript({ title: video.title, author: video.author, text: transcript.text });
    return { content: [{ type: "text", text: JSON.stringify({ expressions: analysis.expressions, grammar: analysis.grammar, practice: analysis.practice }, null, 2) }] };
  });

  server.tool("search_transcript", "Find occurrences of a phrase in a YouTube video's transcript and return matching context.", {
    videoUrl: z.string().url().describe("Full YouTube video URL"),
    query: z.string().min(1).describe("Word or phrase to search for")
  }, async ({ videoUrl, query }) => {
    const id = extractVideoId(videoUrl);
    if (!id) return { content: [{ type: "text", text: "Invalid YouTube video URL." }], isError: true };
    const transcript = await getTranscript(id);
    const matches = transcript.segments.filter((segment) => segment.text.toLowerCase().includes(query.toLowerCase()));
    return { content: [{ type: "text", text: matches.length ? matches.map((m) => m.text).join("\n") : `No matches found for "${query}".` }] };
  });

  return server;
}

async function handle(request: Request) {
  const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  const server = createServer();
  await server.connect(transport);
  return transport.handleRequest(request);
}

export async function GET(request: Request) {
  return handle(request);
}
export async function POST(request: Request) {
  return handle(request);
}
export async function DELETE(request: Request) {
  return handle(request);
}