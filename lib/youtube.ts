export function extractVideoId(input: string): string | null {
  try {
    const url = new URL(input);
    let id = url.searchParams.get("v");
    if (url.hostname === "youtu.be" || url.hostname.endsWith(".youtu.be")) id = url.pathname.slice(1);
    if (url.pathname.startsWith("/embed/") || url.pathname.startsWith("/shorts/")) id = url.pathname.split("/")[2];
    return id && /^[\w-]{11}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}

export async function getVideoMetadata(videoId: string) {
  const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`, { next: { revalidate: 3600 } });
  if (!response.ok) throw new Error("YouTube could not provide details for this video. Check that the video is public.");
  const data = await response.json();
  return {
    id: videoId,
    title: String(data.title || "YouTube video"),
    author: String(data.author_name || "Unknown channel"),
    thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    url: `https://www.youtube.com/watch?v=${videoId}`
  };
}

export async function getTranscript(videoId: string) {
  const mod = await import("youtube-transcript");
  const rows = await mod.YoutubeTranscript.fetchTranscript(videoId);
  if (!rows?.length) throw new Error("No captions were returned for this video.");
  const segments = rows.map((row: { text: string; offset?: number; duration?: number }) => ({
    text: String(row.text || "").replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"'),
    offset: row.offset
  })).filter((row: {text:string}) => row.text.trim());
  return { text: segments.map((row: {text:string}) => row.text).join(" "), segments, language: "YouTube captions" };
}