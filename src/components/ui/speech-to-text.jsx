import { useState, useEffect, useRef, useCallback } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #0a0a0f;
    --surface: #111118;
    --surface2: #18181f;
    --border: rgba(255,255,255,0.07);
    --accent: #7c6aff;
    --accent2: #e04aff;
    --accent3: #00e5ff;
    --text: #f0f0f8;
    --muted: #6b6b80;
    --danger: #ff4a6e;
    --success: #00e5a0;
  }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'Syne', sans-serif;
    min-height: 100vh;
  }

  .app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
  }

  /* Background grid + glow */
  .app::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image:
      linear-gradient(rgba(124,106,255,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(124,106,255,0.03) 1px, transparent 1px);
    background-size: 48px 48px;
    pointer-events: none;
    z-index: 0;
  }

  .glow-orb {
    position: fixed;
    border-radius: 50%;
    filter: blur(120px);
    pointer-events: none;
    z-index: 0;
    transition: opacity 1.5s ease;
  }
  .glow-orb.a { width: 600px; height: 600px; background: rgba(124,106,255,0.12); top: -200px; right: -100px; }
  .glow-orb.b { width: 400px; height: 400px; background: rgba(224,74,255,0.08); bottom: -100px; left: -100px; }
  .glow-orb.active-a { background: rgba(124,106,255,0.22); }
  .glow-orb.active-b { background: rgba(0,229,255,0.10); }

  /* Header */
  .header {
    position: relative;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24px 40px;
    border-bottom: 1px solid var(--border);
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 18px;
    font-weight: 800;
    letter-spacing: -0.5px;
  }

  .logo-icon {
    width: 32px; height: 32px;
    background: linear-gradient(135deg, var(--accent), var(--accent2));
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px;
  }

  .status-pill {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 14px;
    border-radius: 100px;
    border: 1px solid var(--border);
    font-size: 12px;
    font-family: 'DM Mono', monospace;
    font-weight: 400;
    color: var(--muted);
    background: var(--surface);
    transition: all 0.3s ease;
  }

  .status-pill.listening {
    border-color: rgba(0,229,255,0.3);
    color: var(--accent3);
    background: rgba(0,229,255,0.05);
  }

  .status-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: var(--muted);
    transition: background 0.3s;
  }

  .status-pill.listening .status-dot {
    background: var(--accent3);
    animation: pulse-dot 1.2s ease-in-out infinite;
  }

  @keyframes pulse-dot {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.4; transform: scale(0.7); }
  }

  /* Main layout */
  .main {
    flex: 1;
    position: relative;
    z-index: 10;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 60px 40px 40px;
    gap: 48px;
  }

  /* Mic section */
  .mic-area {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 32px;
  }

  .mic-ring-outer {
    position: relative;
    width: 160px; height: 160px;
    display: flex; align-items: center; justify-content: center;
  }

  .ring {
    position: absolute;
    border-radius: 50%;
    border: 1px solid transparent;
    transition: all 0.4s ease;
  }

  .ring-1 {
    inset: 0;
    border-color: rgba(124,106,255,0.2);
  }

  .ring-2 {
    inset: 12px;
    border-color: rgba(124,106,255,0.15);
  }

  .ring-3 {
    inset: 24px;
    border-color: rgba(124,106,255,0.1);
  }

  .listening .ring-1 {
    border-color: rgba(0,229,255,0.4);
    animation: ring-pulse 1.8s ease-in-out infinite;
  }

  .listening .ring-2 {
    border-color: rgba(0,229,255,0.3);
    animation: ring-pulse 1.8s ease-in-out infinite 0.2s;
  }

  .listening .ring-3 {
    border-color: rgba(0,229,255,0.2);
    animation: ring-pulse 1.8s ease-in-out infinite 0.4s;
  }

  @keyframes ring-pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.06); opacity: 0.6; }
  }

  .mic-btn {
    position: relative;
    z-index: 2;
    width: 96px; height: 96px;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    background: var(--surface2);
    border: 1px solid var(--border);
    transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    box-shadow: 0 0 0 0 rgba(124,106,255,0);
  }

  .mic-btn:hover {
    transform: scale(1.05);
    border-color: rgba(124,106,255,0.4);
    box-shadow: 0 0 32px rgba(124,106,255,0.2);
  }

  .mic-btn:active {
    transform: scale(0.97);
  }

  .mic-btn.active {
    background: linear-gradient(135deg, rgba(0,229,255,0.15), rgba(124,106,255,0.15));
    border-color: rgba(0,229,255,0.5);
    box-shadow: 0 0 40px rgba(0,229,255,0.25);
    animation: btn-breathe 2s ease-in-out infinite;
  }

  @keyframes btn-breathe {
    0%, 100% { box-shadow: 0 0 30px rgba(0,229,255,0.2); }
    50% { box-shadow: 0 0 60px rgba(0,229,255,0.35); }
  }

  .mic-icon {
    font-size: 36px;
    transition: transform 0.2s;
    filter: drop-shadow(0 0 8px rgba(255,255,255,0.2));
  }

  .mic-btn.active .mic-icon {
    filter: drop-shadow(0 0 12px rgba(0,229,255,0.6));
  }

  /* Waveform */
  .waveform {
    display: flex;
    align-items: center;
    gap: 3px;
    height: 32px;
  }

  .wave-bar {
    width: 3px;
    background: var(--muted);
    border-radius: 2px;
    height: 4px;
    transition: background 0.3s;
  }

  .waveform.active .wave-bar {
    background: var(--accent3);
    animation: wave-anim 0.8s ease-in-out infinite;
  }

  .waveform.active .wave-bar:nth-child(1)  { animation-delay: 0.0s; }
  .waveform.active .wave-bar:nth-child(2)  { animation-delay: 0.1s; }
  .waveform.active .wave-bar:nth-child(3)  { animation-delay: 0.2s; }
  .waveform.active .wave-bar:nth-child(4)  { animation-delay: 0.3s; }
  .waveform.active .wave-bar:nth-child(5)  { animation-delay: 0.15s; }
  .waveform.active .wave-bar:nth-child(6)  { animation-delay: 0.05s; }
  .waveform.active .wave-bar:nth-child(7)  { animation-delay: 0.25s; }
  .waveform.active .wave-bar:nth-child(8)  { animation-delay: 0.35s; }
  .waveform.active .wave-bar:nth-child(9)  { animation-delay: 0.1s; }
  .waveform.active .wave-bar:nth-child(10) { animation-delay: 0.2s; }
  .waveform.active .wave-bar:nth-child(11) { animation-delay: 0.0s; }
  .waveform.active .wave-bar:nth-child(12) { animation-delay: 0.3s; }

  @keyframes wave-anim {
    0%, 100% { height: 4px; }
    50% { height: var(--h, 20px); }
  }

  .wave-bar:nth-child(1)  { --h: 12px; }
  .wave-bar:nth-child(2)  { --h: 20px; }
  .wave-bar:nth-child(3)  { --h: 28px; }
  .wave-bar:nth-child(4)  { --h: 16px; }
  .wave-bar:nth-child(5)  { --h: 24px; }
  .wave-bar:nth-child(6)  { --h: 32px; }
  .wave-bar:nth-child(7)  { --h: 18px; }
  .wave-bar:nth-child(8)  { --h: 26px; }
  .wave-bar:nth-child(9)  { --h: 14px; }
  .wave-bar:nth-child(10) { --h: 22px; }
  .wave-bar:nth-child(11) { --h: 10px; }
  .wave-bar:nth-child(12) { --h: 18px; }

  .mic-label {
    font-size: 13px;
    color: var(--muted);
    font-family: 'DM Mono', monospace;
    letter-spacing: 0.05em;
    text-align: center;
  }

  /* Transcript panel */
  .transcript-panel {
    width: 100%;
    max-width: 780px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 20px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    min-height: 280px;
    box-shadow: 0 24px 80px rgba(0,0,0,0.4);
  }

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 24px;
    border-bottom: 1px solid var(--border);
    background: var(--surface2);
  }

  .panel-title {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--muted);
    font-family: 'DM Mono', monospace;
  }

  .panel-actions {
    display: flex;
    gap: 8px;
  }

  .action-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: transparent;
    color: var(--muted);
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .action-btn:hover {
    border-color: rgba(124,106,255,0.4);
    color: var(--text);
    background: rgba(124,106,255,0.08);
  }

  .action-btn.danger:hover {
    border-color: rgba(255,74,110,0.4);
    color: var(--danger);
    background: rgba(255,74,110,0.06);
  }

  .action-btn:active { transform: scale(0.97); }

  .action-btn.speak {
    border-color: rgba(0,229,160,0.3);
    color: var(--success);
    background: rgba(0,229,160,0.05);
  }
  .action-btn.speak:hover {
    border-color: rgba(0,229,160,0.6);
    background: rgba(0,229,160,0.12);
  }
  .action-btn.speak.speaking {
    border-color: rgba(0,229,160,0.7);
    background: rgba(0,229,160,0.15);
    animation: speak-pulse 1.4s ease-in-out infinite;
  }
  @keyframes speak-pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(0,229,160,0.3); }
    50% { box-shadow: 0 0 12px 2px rgba(0,229,160,0.2); }
  }

  /* Transcript body */
  .transcript-body {
    flex: 1;
    padding: 28px;
    overflow-y: auto;
    font-family: 'DM Mono', monospace;
    font-size: 15px;
    line-height: 1.85;
    color: var(--text);
    position: relative;
    min-height: 220px;
  }

  .transcript-body::-webkit-scrollbar { width: 4px; }
  .transcript-body::-webkit-scrollbar-track { background: transparent; }
  .transcript-body::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

  .placeholder {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    color: var(--muted);
    font-size: 13px;
    letter-spacing: 0.05em;
  }

  .placeholder-icon { font-size: 32px; opacity: 0.4; }

  .transcript-content { word-break: break-word; }

  .interim-text {
    color: var(--muted);
    font-style: italic;
    border-left: 2px solid var(--accent);
    padding-left: 12px;
    margin-left: -14px;
    display: inline;
  }

  /* Stats bar */
  .stats-bar {
    width: 100%;
    max-width: 780px;
    display: flex;
    gap: 16px;
  }

  .stat-card {
    flex: 1;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 16px 20px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .stat-label {
    font-size: 10px;
    font-family: 'DM Mono', monospace;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--muted);
  }

  .stat-value {
    font-size: 24px;
    font-weight: 700;
    color: var(--text);
    letter-spacing: -0.5px;
  }

  .stat-value.accent { color: var(--accent); }
  .stat-value.cyan { color: var(--accent3); }

  /* Settings row */
  .settings-row {
    width: 100%;
    max-width: 780px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
  }

  .select-group {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 12px;
    color: var(--muted);
    font-family: 'DM Mono', monospace;
  }

  .styled-select {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    color: var(--text);
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    padding: 7px 12px;
    cursor: pointer;
    outline: none;
    transition: border-color 0.2s;
    appearance: none;
    min-width: 160px;
  }

  .styled-select:focus { border-color: rgba(124,106,255,0.5); }

  .toggle-group {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 12px;
    color: var(--muted);
    font-family: 'DM Mono', monospace;
  }

  .toggle {
    width: 36px; height: 20px;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 100px;
    position: relative;
    cursor: pointer;
    transition: all 0.25s;
  }

  .toggle::after {
    content: '';
    position: absolute;
    width: 14px; height: 14px;
    background: var(--muted);
    border-radius: 50%;
    top: 2px; left: 2px;
    transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .toggle.on {
    background: rgba(124,106,255,0.2);
    border-color: rgba(124,106,255,0.5);
  }

  .toggle.on::after {
    left: 18px;
    background: var(--accent);
  }

  /* Error toast */
  .error-toast {
    position: fixed;
    bottom: 32px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(255,74,110,0.12);
    border: 1px solid rgba(255,74,110,0.3);
    color: var(--danger);
    padding: 12px 24px;
    border-radius: 12px;
    font-family: 'DM Mono', monospace;
    font-size: 13px;
    z-index: 100;
    animation: toast-in 0.3s ease;
  }

  @keyframes toast-in {
    from { opacity: 0; transform: translateX(-50%) translateY(12px); }
    to { opacity: 1; transform: translateX(-50%) translateY(0); }
  }

  /* Copy success flash */
  .copy-flash {
    position: fixed;
    bottom: 32px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0,229,160,0.12);
    border: 1px solid rgba(0,229,160,0.3);
    color: var(--success);
    padding: 12px 24px;
    border-radius: 12px;
    font-family: 'DM Mono', monospace;
    font-size: 13px;
    z-index: 100;
    animation: toast-in 0.3s ease;
  }

  /* No support */
  .no-support {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    color: var(--muted);
    font-family: 'DM Mono', monospace;
    font-size: 14px;
    text-align: center;
  }

  .no-support-icon { font-size: 48px; }

  @media (max-width: 600px) {
    .header { padding: 16px 20px; }
    .main { padding: 40px 16px 24px; gap: 32px; }
    .stats-bar { flex-direction: column; }
    .settings-row { flex-direction: column; align-items: flex-start; }
  }
`;

const LANGUAGES = [
  { code: "en-US", label: "English (US)" },
  { code: "en-GB", label: "English (UK)" },
  { code: "es-ES", label: "Spanish" },
  { code: "fr-FR", label: "French" },
  { code: "de-DE", label: "German" },
  { code: "it-IT", label: "Italian" },
  { code: "pt-BR", label: "Portuguese (BR)" },
  { code: "ja-JP", label: "Japanese" },
  { code: "ko-KR", label: "Korean" },
  { code: "zh-CN", label: "Chinese (Simplified)" },
  { code: "ar-SA", label: "Arabic" },
  { code: "hi-IN", label: "Hindi" },
  { code: "ru-RU", label: "Russian" },
];

export default function SpeechToText() {
  const [isListening, setIsListening] = useState(false);
  const [finalText, setFinalText] = useState("");
  const [interimText, setInterimText] = useState("");
  const [error, setError] = useState("");
  const [copyFlash, setCopyFlash] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [language, setLanguage] = useState("en-US");
  const [autoPunctuation, setAutoPunctuation] = useState(true);
  const [isSupported] = useState(
    () => "webkitSpeechRecognition" in window || "SpeechRecognition" in window
  );

  const recognitionRef = useRef(null);
  const bodyRef = useRef(null);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  // Compute stats
  useEffect(() => {
    const text = finalText.trim();
    setCharCount(text.length);
    setWordCount(text ? text.split(/\s+/).filter(Boolean).length : 0);
  }, [finalText]);

  // Auto-scroll
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [finalText, interimText]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    clearInterval(timerRef.current);
    setIsListening(false);
    setInterimText("");
  }, []);

  const startListening = useCallback(() => {
    if (!isSupported) return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log("recognition.onstart");
      setIsListening(true);
      setError("");
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    };

    recognition.onresult = (e) => {
      console.log("recognition.onresult", e);
      let interim = "";
      let newFinal = "";

      for (let i = e.resultIndex; i < e.results.length; i++) {
        const transcript = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          newFinal += transcript;
        } else {
          interim += transcript;
        }
      }

      if (newFinal) {
        setFinalText((prev) => {
          let text = prev;
          if (text && !text.endsWith(" ")) text += " ";
          text += newFinal;
          return text;
        });
      }

      setInterimText(interim);
    };

    recognition.onerror = (e) => {
      console.log("recognition.onerror", e);
      if (e.error === "no-speech") return;
      if (e.error === "aborted") return;
      const msgs = {
        "not-allowed":
          "Microphone access denied. Please allow microphone permission.",
        network: "Network error. Check your connection.",
        "audio-capture": "No microphone found.",
      };
      setError(msgs[e.error] || `Error: ${e.error}`);
      stopListening();
      setTimeout(() => setError(""), 4000);
    };

    recognition.onend = () => {
      console.log("recognition.onend");
      // Auto-restart if still toggled on
      if (recognitionRef.current === recognition && isListening) {
        try {
          recognition.start();
        } catch (_) {
          stopListening();
        }
      } else {
        clearInterval(timerRef.current);
        setIsListening(false);
        setInterimText("");
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (err) {
      setError("Could not start recognition. Try again.");
    }
  }, [language, isSupported, stopListening, isListening]);

  const speakText = () => {
    const text = finalText.trim();
    if (!text || !("speechSynthesis" in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;

    // Pick a matching voice if available
    const voices = window.speechSynthesis.getVoices();
    const match =
      voices.find((v) => v.lang === language) ||
      voices.find((v) => v.lang.startsWith(language.split("-")[0]));
    if (match) utterance.voice = match;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const copyText = () => {
    const full = finalText + (interimText ? " " + interimText : "");
    if (!full.trim()) return;
    navigator.clipboard.writeText(full.trim()).then(() => {
      setCopyFlash(true);
      setTimeout(() => setCopyFlash(false), 2000);
    });
  };

  const clearText = () => {
    setFinalText("");
    setInterimText("");
    setDuration(0);
  };

  const formatDuration = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const hasContent = finalText || interimText;

  if (!isSupported) {
    return (
      <>
        <style>{styles}</style>
        <div className="no-support">
          <div className="no-support-icon">🎙</div>
          <div>Web Speech API is not supported in this browser.</div>
          <div style={{ fontSize: 12 }}>Try Chrome, Edge, or Safari.</div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        <div className={`glow-orb a ${isListening ? "active-a" : ""}`} />
        <div className={`glow-orb b ${isListening ? "active-b" : ""}`} />

        {/* Header */}
        <header className="header">
          <div className="logo">
            <div className="logo-icon">🎙</div>
            VoiceScribe
          </div>
          <div className={`status-pill ${isListening ? "listening" : ""}`}>
            <span className="status-dot" />
            {isListening ? "Listening..." : "Standby"}
          </div>
        </header>

        <main className="main">
          {/* Mic section */}
          <div className="mic-area">
            <div className={`mic-ring-outer ${isListening ? "listening" : ""}`}>
              <div className="ring ring-1" />
              <div className="ring ring-2" />
              <div className="ring ring-3" />
              <button
                className={`mic-btn ${isListening ? "active" : ""}`}
                onClick={toggleListening}
                aria-label={isListening ? "Stop listening" : "Start listening"}
              >
                <span className="mic-icon">{isListening ? "⏹" : "🎤"}</span>
              </button>
            </div>

            <div className={`waveform ${isListening ? "active" : ""}`}>
              {[...Array(12)].map((_, i) => (
                <div key={i} className="wave-bar" />
              ))}
            </div>

            <div className="mic-label">
              {isListening
                ? `Recording · ${formatDuration(duration)}`
                : "Click the mic to start recording"}
            </div>
          </div>

          {/* Transcript panel */}
          <div className="transcript-panel">
            <div className="panel-header">
              <span className="panel-title">Transcript</span>
              <div className="panel-actions">
                <button
                  className={`action-btn speak ${isSpeaking ? "speaking" : ""}`}
                  onClick={speakText}
                  disabled={!finalText.trim()}
                  title={isSpeaking ? "Stop speaking" : "Read transcript aloud"}
                >
                  {isSpeaking ? "⏹ Stop" : "🔊 Speak"}
                </button>
                <button
                  className="action-btn"
                  onClick={copyText}
                  disabled={!hasContent}
                >
                  ⎘ Copy
                </button>
                <button
                  className="action-btn danger"
                  onClick={clearText}
                  disabled={!hasContent}
                >
                  ✕ Clear
                </button>
              </div>
            </div>
            <div className="transcript-body" ref={bodyRef}>
              {!hasContent ? (
                <div className="placeholder">
                  <div className="placeholder-icon">💬</div>
                  <span>Your transcription will appear here</span>
                </div>
              ) : (
                <div className="transcript-content">
                  {finalText}
                  {interimText && (
                    <>
                      {finalText ? " " : ""}
                      <span className="interim-text">{interimText}</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="stats-bar">
            <div className="stat-card">
              <span className="stat-label">Words</span>
              <span className="stat-value accent">{wordCount}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Characters</span>
              <span className="stat-value">{charCount}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Duration</span>
              <span className="stat-value cyan">
                {formatDuration(duration)}
              </span>
            </div>
          </div>

          {/* Settings */}
          <div className="settings-row">
            <div className="select-group">
              <span>Language</span>
              <select
                className="styled-select"
                value={language}
                onChange={(e) => {
                  setLanguage(e.target.value);
                  if (isListening) {
                    stopListening();
                  }
                }}
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="toggle-group">
              <span>Continuous mode</span>
              <div
                className={`toggle ${autoPunctuation ? "on" : ""}`}
                onClick={() => setAutoPunctuation((p) => !p)}
                role="switch"
                aria-checked={autoPunctuation}
              />
            </div>
          </div>
        </main>

        {error && <div className="error-toast">{error}</div>}
        {copyFlash && <div className="copy-flash">✓ Copied to clipboard</div>}
      </div>
    </>
  );
}
