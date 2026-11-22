type TranscriptInput = { title: string; author: string; text: string };

const fallback = (input: TranscriptInput) => {
  const text = input.text;
  const sentences = text.split(/[.!?]+/).map((s) => s.trim()).filter((s) => s.length > 20);
  const words = text.toLowerCase().match(/[a-z']+/g) || [];
  const common = ["actually", "basically", "honestly", "probably", "usually", "because", "however", "for example", "I think", "you know"];
  const found = common.filter((term) => text.toLowerCase().includes(term.toLowerCase()));
  const topWords = [...new Set(words.filter((w) => w.length > 5))].slice(0, 8);
  return {
    summary: `This video, “${input.title}” by ${input.author}, contains approximately ${words.length.toLocaleString()} words across ${sentences.length} sentence-like sections. The transcript is available below. Add an xAI API key to generate a deeper summary and contextual language analysis.`,
    speakingStyle: [
      `The transcript contains about ${sentences.length} sentence-like sections; sentence length and punctuation can help reveal the speaker's pace and structure.`,
      "Review repeated transitions and examples to see how the speaker moves from one point to the next.",
      "The transcript alone cannot confirm pronunciation, intonation, pauses, or vocal energy.",
      `Some longer words and recurring terms include: ${topWords.join(", ") || "not enough text to identify"}.`
    ],
    expressions: found.length ? found.map((x) => `“${x}” — found in the transcript; check its surrounding sentence for the exact meaning.`) : ["No common conversational expressions were confidently detected by the basic analysis."],
    grammar: [
      "Look for present simple when the speaker describes routines, facts, or general opinions.",
      "Look for past simple when the speaker tells a completed story or describes an earlier event.",
      "Notice linking words such as because, so, but, and however to understand how ideas connect."
    ],
    ideas: sentences.slice(0, 5).map((s) => s.length > 180 ? s.slice(0, 177) + "..." : s),
    practice: [
      "Choose one short section and explain the same idea in your own words without reading.",
      "Reuse one expression in a new sentence about your own daily life.",
      "Record a one-minute explanation, then listen for clarity and unfinished sentences."
    ]
  };
};

export async function analyzeTranscript(input: TranscriptInput) {
  const apiKey = process.env.XAI_API_KEY || process.env.AI_API_KEY;
  if (!apiKey) return fallback(input);

  const baseUrl = (process.env.AI_BASE_URL || "https://api.x.ai/v1").replace(/\/$/, "");
  const model = process.env.AI_MODEL || "grok-4.7";
  const prompt = `Analyze this YouTube transcript for a learner of natural spoken English. Be evidence-based: do not invent quotes, pronunciation observations, or facts absent from the transcript. Distinguish observable transcript features from uncertain audio features. Return JSON with keys summary (string), speakingStyle (string array), expressions (string array with phrase and meaning), grammar (string array with short examples taken from the transcript where possible), ideas (string array describing idea progression), practice (string array of practical speaking exercises). Video: ${input.title}. Channel: ${input.author}. Transcript (may be truncated):\n${input.text.slice(0, 24000)}`;
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model, temperature: 0.35, response_format: { type: "json_object" }, messages: [{ role: "system", content: "You are a careful transcript analyst and spoken-English coach. Return valid JSON only." }, { role: "user", content: prompt }] })
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`xAI provider request failed (${response.status}). Check your xAI API key, model access and billing. ${detail.slice(0, 300)}`);
  }
  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) return fallback(input);
  try {
    const parsed = JSON.parse(content);
    return {
      summary: String(parsed.summary || ""),
      speakingStyle: Array.isArray(parsed.speakingStyle) ? parsed.speakingStyle.map(String) : [],
      expressions: Array.isArray(parsed.expressions) ? parsed.expressions.map(String) : [],
      grammar: Array.isArray(parsed.grammar) ? parsed.grammar.map(String) : [],
      ideas: Array.isArray(parsed.ideas) ? parsed.ideas.map(String) : [],
      practice: Array.isArray(parsed.practice) ? parsed.practice.map(String) : []
    };
  } catch {
    return fallback(input);
  }
}
