"use client";

import { useMemo, useState } from "react";
import { Activity, ArrowRight, AudioLines, BookOpen, Check, ChevronDown, Clock3, FileText, Film, Globe2, History, Languages, Link2, LoaderCircle, Mic2, Play, Search, Sparkles, Subtitles, Youtube } from "lucide-react";

type Analysis = {
  video: { id: string; title: string; author: string; thumbnail: string; url: string };
  transcript: { text: string; segments: { text: string; offset?: number }[]; language?: string };
  analysis: { summary: string; speakingStyle: string[]; expressions: string[]; grammar: string[]; ideas: string[]; practice: string[] };
  source: string;
};

const examples = [
  { label: "Speaking style", detail: "How does the speaker naturally communicate?", icon: Mic2 },
  { label: "English patterns", detail: "Everyday expressions and useful grammar", icon: Languages },
  { label: "Video understanding", detail: "A clear summary and key ideas", icon: BookOpen }
];

export default function Home() {
  const [url, setUrl] = useState("");
  const [mode, setMode] = useState("complete");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Analysis | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [history, setHistory] = useState<string[]>([]);

  const videoId = useMemo(() => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?.*v=|embed\/|shorts\/))([\w-]{11})/);
    return match?.[1] ?? "";
  }, [url]);

  async function analyze() {
    setError("");
    setResult(null);
    if (!videoId) {
      setError("Please enter a valid YouTube video URL.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, mode })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to analyze this video.");
      setResult(data);
      setHistory((old) => [data.video.title, ...old.filter((item) => item !== data.video.title)].slice(0, 5));
      setActiveTab("overview");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#"><span className="brand-mark"><AudioLines size={21}/></span><span>tubemind<span className="brand-dot">.</span></span></a>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="side-nav">
          <a className="nav-item active" href="#"><Sparkles size={17}/> Analyzer <span className="nav-pill">AI</span></a>
          <a className="nav-item" href="#results"><History size={17}/> Recent videos</a>
          <a className="nav-item" href="#features"><BookOpen size={17}/> Learning studio</a>
        </nav>
        <div className="sidebar-bottom">
          <div className="side-card"><div className="side-card-icon"><Globe2 size={16}/></div><strong>One link. More insight.</strong><p>Turn video content into useful knowledge and practical English.</p></div>
          <div className="profile"><div className="avatar">TM</div><div><strong>Your workspace</strong><span>Personal edition</span></div><ChevronDown size={15}/></div>
        </div>
      </aside>

      <section className="main-area">
        <header className="topbar"><div className="breadcrumb">Workspace <span>/</span> <b>Video analyzer</b></div><div className="top-actions"><span className="status-dot"/> All systems ready <span className="top-divider"/> <span className="avatar small">TM</span></div></header>
        <div className="content">
          <div className="hero">
            <div className="eyebrow"><span className="eyebrow-line"/> YOUR VIDEO RESEARCH STUDIO</div>
            <h1>Understand more than<br/><span>what you watch.</span></h1>
            <p className="hero-copy">Bring any YouTube video. Get the transcript, understand the ideas, and discover how people communicate.</p>
          </div>

          <section className="analyzer-card">
            <div className="card-heading"><div className="youtube-icon"><Youtube size={20}/></div><div><h2>Analyze a YouTube video</h2><p>Paste a video link to get started</p></div><span className="secure-label"><span/> PRIVATE BY DESIGN</span></div>
            <div className="url-field"><Link2 size={18}/><input value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key === "Enter" && analyze()} placeholder="https://www.youtube.com/watch?v=..." aria-label="YouTube video URL"/><button className="clear-btn" onClick={() => { setUrl(""); setError(""); }}>Clear</button></div>
            <div className="analyzer-footer"><div className="mode-select"><span>ANALYSIS MODE</span><select value={mode} onChange={(e) => setMode(e.target.value)}><option value="complete">Complete analysis</option><option value="speaking">Speaking style</option><option value="english">English learning</option><option value="summary">Video summary</option></select></div><button className="analyze-btn" onClick={analyze} disabled={loading}>{loading ? <><LoaderCircle className="spin" size={17}/> Analyzing...</> : <>Analyze video <ArrowRight size={17}/></>}</button></div>
            {error && <div className="error-message">{error}</div>}
            <div className="input-note"><Subtitles size={14}/> Works with videos that have accessible captions or subtitles.</div>
          </section>

          {!result && !loading && <section className="feature-row" id="features">{examples.map(({label, detail, icon: Icon}) => <div className="feature" key={label}><div className="feature-icon"><Icon size={18}/></div><div><strong>{label}</strong><p>{detail}</p></div><ArrowRight size={15} className="feature-arrow"/></div>)}</section>}

          {loading && <div className="loading-panel"><div className="loader-orbit"><LoaderCircle size={27}/></div><h3>Working through your video</h3><p>Finding captions and preparing the analysis. This can take a little while.</p><div className="loading-steps"><span className="done"><Check size={13}/> Checking video</span><span><span className="tiny-pulse"/> Retrieving transcript</span><span>Preparing insights</span></div></div>}

          {result && <section className="results" id="results">
            <div className="result-header"><div><div className="eyebrow">ANALYSIS COMPLETE</div><h2>Your video insights</h2></div><button className="text-button" onClick={() => {setResult(null); setUrl("");}}>New analysis <ArrowRight size={15}/></button></div>
            <div className="video-summary-card"><img src={result.video.thumbnail} alt="Video thumbnail"/><div className="video-meta"><span className="video-label"><Youtube size={13}/> YOUTUBE VIDEO</span><h3>{result.video.title}</h3><p>{result.video.author}</p><a href={result.video.url} target="_blank" rel="noreferrer"><Play size={13}/> Watch on YouTube</a></div></div>
            <div className="tabs">{[["overview","Overview"],["speaking","Speaking style"],["english","English patterns"],["transcript","Transcript"]].map(([key,label]) => <button key={key} className={activeTab === key ? "tab active-tab" : "tab"} onClick={() => setActiveTab(key)}>{label}</button>)}</div>
            {activeTab === "overview" && <div className="result-grid"><article className="insight-card wide"><div className="insight-title"><Sparkles size={17}/> <h3>Video summary</h3></div><p>{result.analysis.summary}</p><div className="source-note">Generated from the available transcript · {result.transcript.language || "Caption language detected"}</div></article><article className="insight-card"><div className="insight-title"><Mic2 size={17}/><h3>Speaking observations</h3></div><ul>{result.analysis.speakingStyle.slice(0,4).map((x,i)=><li key={i}>{x}</li>)}</ul></article><article className="insight-card"><div className="insight-title"><Languages size={17}/><h3>Useful expressions</h3></div><ul>{result.analysis.expressions.slice(0,5).map((x,i)=><li key={i}>{x}</li>)}</ul></article></div>}
            {activeTab === "speaking" && <article className="insight-card full"><div className="insight-title"><AudioLines size={17}/><h3>How this speaker communicates</h3></div><ul>{result.analysis.speakingStyle.map((x,i)=><li key={i}>{x}</li>)}</ul><div className="insight-title sub-title"><Activity size={17}/><h3>How ideas are developed</h3></div><ul>{result.analysis.ideas.map((x,i)=><li key={i}>{x}</li>)}</ul></article>}
            {activeTab === "english" && <div className="result-grid"><article className="insight-card"><div className="insight-title"><Languages size={17}/><h3>Everyday expressions</h3></div><ul>{result.analysis.expressions.map((x,i)=><li key={i}>{x}</li>)}</ul></article><article className="insight-card"><div className="insight-title"><BookOpen size={17}/><h3>Grammar patterns</h3></div><ul>{result.analysis.grammar.map((x,i)=><li key={i}>{x}</li>)}</ul></article><article className="insight-card wide"><div className="insight-title"><Mic2 size={17}/><h3>Speaking practice</h3></div><ol>{result.analysis.practice.map((x,i)=><li key={i}>{x}</li>)}</ol></article></div>}
            {activeTab === "transcript" && <article className="insight-card transcript-card"><div className="insight-title"><FileText size={17}/><h3>Video transcript</h3><span className="transcript-count">{result.transcript.segments.length} segments</span></div><div className="transcript-text">{result.transcript.segments.map((s,i)=><p key={i}>{s.text}</p>)}</div></article>}
          </section>}

          {!result && !loading && <section className="bottom-grid"><div className="bottom-card" id="results"><div className="bottom-card-heading"><Clock3 size={16}/><strong>Recent activity</strong></div>{history.length ? history.map((item,i)=><div className="history-item" key={i}><Film size={15}/><span>{item}</span><Check size={14}/></div>) : <div className="empty-history"><History size={21}/><span>Your analyzed videos will appear here.</span></div>}</div><div className="bottom-card mcp-card"><div className="mcp-symbol"><Activity size={19}/></div><div><strong>Connect your AI tools</strong><p>TubeMind includes an MCP endpoint for compatible AI clients.</p><code>/api/mcp</code></div></div></section>}
          <footer className="footer"><span>TubeMind <b>·</b> YouTube research, made clearer.</span><span>Built for learning and discovery</span></footer>
        </div>
      </section>
    </main>
  );
}