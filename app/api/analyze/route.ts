import { NextRequest, NextResponse } from "next/server";
import { analyzeTranscript } from "@/lib/analysis";
import { extractVideoId, getTranscript, getVideoMetadata } from "@/lib/youtube";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const videoId = extractVideoId(String(body.url || ""));
    if (!videoId) return NextResponse.json({ error: "Enter a valid YouTube video URL." }, { status: 400 });
    const [video, transcript] = await Promise.all([getVideoMetadata(videoId), getTranscript(videoId)]);
    const analysis = await analyzeTranscript({ title: video.title, author: video.author, text: transcript.text });
    return NextResponse.json({ video, transcript, analysis, source: process.env.AI_API_KEY || process.env.OPENAI_API_KEY ? "ai" : "basic" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to analyze this video.";
    return NextResponse.json({ error: message.includes("transcript") || message.includes("Transcript") || message.includes("caption") ? message : `Analysis failed: ${message}` }, { status: 422 });
  }
}