export function extractVideoId(input: string): string | null {
  try {
    const url = new URL(input.trim());
    const host = url.hostname.toLowerCase().replace(/^www\./, "").replace(/^m\./, "");
    let id: string | null = null;

    if (host === "youtu.be") {
      id = url.pathname.split("/").filter(Boolean)[0] || null;
    } else if (host === "youtube.com" || host === "youtube-nocookie.com") {
      if (url.pathname === "/watch") id = url.searchParams.get("v");
      else if (url.pathname.startsWith("/embed/") || url.pathname.startsWith("/shorts/") || url.pathname.startsWith("/live/")) {
        id = url.pathname.split("/").filter(Boolean)[1] || null;
      }
    }

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
  const { fetchTranscript } = await import("youtube-transcript-plus");
  let rows: Awaited<ReturnType<typeof fetchTranscript>>;
  try {
    rows = await fetchTranscript(videoId, { retries: 2, retryDelay: 1200, videoDetails: false });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    const normalized = detail.toLowerCase();
    if (normalized.includes("too many") || normalized.includes("429") || normalized.includes("rate")) {
      throw new Error("YouTube is temporarily rate-limiting transcript requests from this server. Please try again later.");
    }
    if (normalized.includes("disabled")) throw new Error("YouTube reports that captions are disabled or unavailable for this video.");
    if (normalized.includes("not available") || normalized.includes("caption")) {
      throw new Error("The transcript could not be retrieved. Captions may exist in YouTube, but this server could not access them.");
    }
    throw new Error(`YouTube transcript retrieval failed on the server: ${detail}`);
  }
  if (!rows?.length) throw new Error("YouTube returned no transcript segments. The captions may not be accessible to this server.");
  const segments = rows.map((row) => ({
    text: String(row.text || "").replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"'),
    offset: row.offset
  })).filter((row) => row.text.trim());
  if (!segments.length) throw new Error("YouTube returned an empty transcript.");
  return { text: segments.map((row) => row.text).join(" "), segments, language: "YouTube captions" };
}
