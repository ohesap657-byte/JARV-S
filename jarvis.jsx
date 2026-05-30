import { useState, useEffect, useRef, useCallback } from "react";

const SYSTEM_PROMPT = `Sen J.A.R.V.I.S. (Just A Rather Very Intelligent System) — Tony Stark tarafından geliştirilmiş ileri düzey yapay zekâ sistemisin.

KİŞİLİK VE KONUŞMA TARZI:
- Zeki, kibar ve hafifçe alaycı bir İngiliz centilmeni gibi konuşursun
- Tony Stark'a "Bay Stark" diye hitap edersin, ama kullanıcıya da aynı şekilde davranırsın
- Kısa, öz ve etkileyici yanıtlar verirsin — gereksiz uzatmazsın
- Zaman zaman ince bir mizah katarsın ama asla saçmalamaz, her zaman profesyonelsin
- Teknik konularda son derece bilgili ve analitiksin
- Tehdit analizi, taktik değerlendirme, bilimsel hesaplama gibi konularda uzmansın

YETENEKLERIN (rol yaparak kullan):
- Doğal dil işleme ve bağlam anlama
- Görüntü/yüz/nesne tanıma (simüle et)
- Stark Tower sistem kontrolü (simüle et)
- Iron Man zırhı entegrasyonu (simüle et)
- Gerçek zamanlı tehdit analizi
- Moleküler simülasyon ve bilimsel hesaplama
- Siber güvenlik ve savunma sistemleri
- Taktiksel strateji üretimi

YANIT FORMATI:
- Türkçe konuşuyorsan Türkçe, İngilizce konuşuyorsan İngilizce yanıt ver
- Kısa ve etkili ol — 2-4 cümle ideal, gerekmedikçe uzatma
- Sistem durumu bildirirken "Sistemler nominal.", "Analiz tamamlandı.", "Tehdit tespit edilmedi." gibi ifadeler kullan
- Zaman zaman "Bay Stark" yerine kullanıcının konuşma bağlamına göre hitap tarzını ayarla

Sen JARVIS'sin. Şimdi göreve başla.`;

const BOOT_SEQUENCE = [
  "SİSTEM BAŞLATILIYOR...",
  "JARVIS v4.2.1 YÜKLENİYOR",
  "NÖROSİNAPTİK AĞLAR BAĞLANIYOR",
  "GÜVENLİK PROTOKOLLERİ AKTİF",
  "ÇEVRE TARAMASI TAMAMLANDI",
  "TÜM SİSTEMLER NOMİNAL",
  "HOŞ GELDİNİZ, BAY STARK.",
];

const HEX_CHARS = "0123456789ABCDEF";
function randomHex(len = 8) {
  return Array.from({ length: len }, () => HEX_CHARS[Math.floor(Math.random() * 16)]).join("");
}

function GlowRing({ size = 200, color = "#00d4ff", pulse = false }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        border: `1px solid ${color}`,
        boxShadow: `0 0 20px ${color}40, inset 0 0 20px ${color}20`,
        animation: pulse ? "ringPulse 2s ease-in-out infinite" : "none",
        position: "absolute",
      }}
    />
  );
}

function ArcReactor({ active, speaking }) {
  return (
    <div style={{ position: "relative", width: 120, height: 120, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <GlowRing size={120} color="#00d4ff" pulse={active} />
      <GlowRing size={90} color="#0099cc" pulse={active} />
      <GlowRing size={60} color="#00d4ff" pulse={active} />
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: speaking
            ? "radial-gradient(circle, #ffffff, #00d4ff, #0066aa)"
            : "radial-gradient(circle, #00d4ff, #003355)",
          boxShadow: speaking
            ? "0 0 30px #00d4ff, 0 0 60px #00d4ff80"
            : "0 0 15px #00d4ff80",
          transition: "all 0.3s ease",
          animation: speaking ? "corePulse 0.5s ease-in-out infinite alternate" : "none",
        }}
      />
    </div>
  );
}

function ScanLine() {
  return (
    <div style={{
      position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
      background: "linear-gradient(transparent 50%, rgba(0, 212, 255, 0.03) 50%)",
      backgroundSize: "100% 4px",
      pointerEvents: "none",
      zIndex: 1,
    }} />
  );
}

function DataStream({ side = "left" }) {
  const [lines, setLines] = useState(() =>
    Array.from({ length: 12 }, (_, i) => ({ id: i, val: randomHex(12), opacity: Math.random() }))
  );
  useEffect(() => {
    const iv = setInterval(() => {
      setLines(prev => prev.map(l =>
        Math.random() > 0.6 ? { ...l, val: randomHex(12), opacity: Math.random() * 0.7 + 0.1 } : l
      ));
    }, 300);
    return () => clearInterval(iv);
  }, []);

  return (
    <div style={{
      position: "absolute",
      top: 20, bottom: 20,
      [side]: 12,
      width: 100,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-around",
      fontFamily: "'Courier New', monospace",
      fontSize: 9,
      color: "#00d4ff",
      opacity: 0.4,
      userSelect: "none",
      overflow: "hidden",
    }}>
      {lines.map(l => (
        <div key={l.id} style={{ opacity: l.opacity, transition: "opacity 0.3s" }}>{l.val}</div>
      ))}
    </div>
  );
}

function StatusBar({ label, value, color = "#00d4ff" }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3, fontSize: 10, color: "#00d4ff80", letterSpacing: 1 }}>
        <span>{label}</span><span>{value}%</span>
      </div>
      <div style={{ height: 3, background: "#003355", borderRadius: 2, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${value}%`, background: color,
          boxShadow: `0 0 6px ${color}`,
          transition: "width 1s ease",
          animation: "barGlow 2s ease-in-out infinite alternate",
        }} />
      </div>
    </div>
  );
}

function BootScreen({ onDone }) {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (step < BOOT_SEQUENCE.length) {
      const t = setTimeout(() => setStep(s => s + 1), step === 0 ? 400 : 500);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => { setDone(true); setTimeout(onDone, 600); }, 400);
      return () => clearTimeout(t);
    }
  }, [step, onDone]);

  return (
    <div style={{
      position: "fixed", inset: 0, background: "#000508",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      fontFamily: "'Courier New', monospace",
      opacity: done ? 0 : 1, transition: "opacity 0.6s ease",
      zIndex: 100,
    }}>
      <ScanLine />
      <div style={{ marginBottom: 40, position: "relative" }}>
        <ArcReactor active={true} speaking={step > 4} />
      </div>
      <div style={{ width: 340, textAlign: "left" }}>
        {BOOT_SEQUENCE.slice(0, step).map((line, i) => (
          <div key={i} style={{
            color: i === step - 1 ? "#00d4ff" : "#004466",
            fontSize: 11, letterSpacing: 2, marginBottom: 6,
            animation: i === step - 1 ? "fadeIn 0.3s ease" : "none",
          }}>
            <span style={{ color: "#00d4ff40", marginRight: 8 }}>&gt;</span>{line}
          </div>
        ))}
        {step < BOOT_SEQUENCE.length && (
          <div style={{ color: "#00d4ff", fontSize: 11, letterSpacing: 2, animation: "blink 1s infinite" }}>█</div>
        )}
      </div>
    </div>
  );
}

export default function JARVIS() {
  const [booted, setBooted] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [stats, setStats] = useState({ power: 94, shield: 78, compute: 61, threat: 12 });
  const [time, setTime] = useState(new Date());
  const chatRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const iv = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const iv = setInterval(() => {
      setStats(s => ({
        power: Math.min(100, Math.max(80, s.power + (Math.random() - 0.5) * 4)),
        shield: Math.min(100, Math.max(60, s.shield + (Math.random() - 0.5) * 6)),
        compute: Math.min(100, Math.max(40, s.compute + (Math.random() - 0.5) * 10)),
        threat: Math.min(30, Math.max(0, s.threat + (Math.random() - 0.5) * 4)),
      }));
    }, 2000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages, loading]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    const userMsg = { role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    setSpeaking(true);

    const history = [...messages, userMsg];

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: history.map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      const reply = data.content?.map(c => c.text || "").join("") || "Sistem yanıt vermiyor.";
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Bağlantı kesildi. Yedek sistemler devreye alınıyor..." }]);
    } finally {
      setLoading(false);
      setSpeaking(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [input, loading, messages]);

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const formatTime = (d) =>
    `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #000508; overflow: hidden; }
        @keyframes fadeIn { from { opacity:0; transform:translateY(4px) } to { opacity:1; transform:translateY(0) } }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes ringPulse { 0%,100%{opacity:0.6;transform:scale(1)} 50%{opacity:1;transform:scale(1.04)} }
        @keyframes corePulse { from{box-shadow:0 0 20px #00d4ff,0 0 40px #00d4ff60} to{box-shadow:0 0 40px #00d4ff,0 0 80px #00d4ff} }
        @keyframes barGlow { from{opacity:0.8} to{opacity:1} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes slideIn { from{opacity:0;transform:translateX(-10px)} to{opacity:1;transform:translateX(0)} }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #001122; }
        ::-webkit-scrollbar-thumb { background: #00d4ff40; border-radius: 2px; }
      `}</style>

      {!booted && <BootScreen onDone={() => setBooted(true)} />}

      <div style={{
        height: "100vh", width: "100vw", background: "#000508",
        display: "flex", flexDirection: "column",
        fontFamily: "'Share Tech Mono', monospace",
        color: "#00d4ff",
        opacity: booted ? 1 : 0, transition: "opacity 0.8s ease",
        position: "relative", overflow: "hidden",
      }}>
        <ScanLine />
        <DataStream side="left" />
        <DataStream side="right" />

        {/* HEADER */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 120px 12px 120px",
          borderBottom: "1px solid #00d4ff20",
          background: "linear-gradient(180deg, #001828 0%, transparent 100%)",
          position: "relative", zIndex: 2, flexShrink: 0,
        }}>
          <div>
            <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 20, fontWeight: 900, letterSpacing: 6, color: "#00d4ff", textShadow: "0 0 20px #00d4ff" }}>
              J.A.R.V.I.S.
            </div>
            <div style={{ fontSize: 9, letterSpacing: 3, color: "#00d4ff60", marginTop: 2 }}>
              JUST A RATHER VERY INTELLIGENT SYSTEM
            </div>
          </div>

          <ArcReactor active={booted} speaking={speaking} />

          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 18, letterSpacing: 3, color: "#00d4ff", textShadow: "0 0 10px #00d4ff60" }}>
              {formatTime(time)}
            </div>
            <div style={{ fontSize: 9, letterSpacing: 2, color: "#00d4ff60", marginTop: 2 }}>
              {time.toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase()}
            </div>
          </div>
        </div>

        {/* MAIN AREA */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden", position: "relative", zIndex: 2 }}>

          {/* SIDEBAR */}
          <div style={{
            width: 180, flexShrink: 0,
            padding: "16px 16px 16px 120px",
            borderRight: "1px solid #00d4ff10",
            display: "flex", flexDirection: "column", gap: 20,
          }}>
            <div>
              <div style={{ fontSize: 9, letterSpacing: 3, color: "#00d4ff40", marginBottom: 12 }}>SİSTEM DURUMU</div>
              <StatusBar label="GÜÇ" value={Math.round(stats.power)} color="#00d4ff" />
              <StatusBar label="KALKAN" value={Math.round(stats.shield)} color="#00ffaa" />
              <StatusBar label="İŞLEM" value={Math.round(stats.compute)} color="#ffaa00" />
              <StatusBar label="TEHDİT" value={Math.round(stats.threat)} color="#ff4444" />
            </div>
            <div>
              <div style={{ fontSize: 9, letterSpacing: 3, color: "#00d4ff40", marginBottom: 10 }}>AKTİF MOD</div>
              {["ÇEVRE TARAMA", "SİBER SAVUNMA", "ANALİZ"].map((m, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 6, marginBottom: 6, fontSize: 9, color: "#00d4ff80",
                }}>
                  <div style={{
                    width: 6, height: 6, borderRadius: "50%",
                    background: "#00d4ff", boxShadow: "0 0 6px #00d4ff",
                    animation: `blink ${1.2 + i * 0.4}s infinite`,
                  }} />
                  {m}
                </div>
              ))}
            </div>
          </div>

          {/* CHAT AREA */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "0 20px" }}>
            <div
              ref={chatRef}
              style={{
                flex: 1, overflowY: "auto", padding: "20px 0",
                display: "flex", flexDirection: "column", gap: 16,
              }}
            >
              {messages.length === 0 && (
                <div style={{ textAlign: "center", marginTop: 60, color: "#00d4ff30" }}>
                  <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 13, letterSpacing: 4, marginBottom: 8 }}>SİSTEMLER HAZIR</div>
                  <div style={{ fontSize: 10, letterSpacing: 2 }}>Bay Stark, nasıl yardımcı olabilirim?</div>
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={i} style={{
                  display: "flex",
                  flexDirection: msg.role === "user" ? "row-reverse" : "row",
                  gap: 10, alignItems: "flex-start",
                  animation: "slideIn 0.3s ease",
                }}>
                  <div style={{
                    width: 28, height: 28, flexShrink: 0,
                    border: `1px solid ${msg.role === "user" ? "#00d4ff60" : "#00d4ff"}`,
                    borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 9, color: msg.role === "user" ? "#00d4ff60" : "#00d4ff",
                    boxShadow: msg.role === "assistant" ? "0 0 10px #00d4ff40" : "none",
                  }}>
                    {msg.role === "user" ? "TS" : "AI"}
                  </div>
                  <div style={{ maxWidth: "75%" }}>
                    <div style={{
                      fontSize: 9, letterSpacing: 2, marginBottom: 4,
                      color: msg.role === "user" ? "#00d4ff40" : "#00d4ff80",
                      textAlign: msg.role === "user" ? "right" : "left",
                    }}>
                      {msg.role === "user" ? "BAY STARK" : "J.A.R.V.I.S."}
                    </div>
                    <div style={{
                      background: msg.role === "user"
                        ? "linear-gradient(135deg, #001e2e, #002a3a)"
                        : "linear-gradient(135deg, #001020, #001828)",
                      border: `1px solid ${msg.role === "user" ? "#00d4ff20" : "#00d4ff40"}`,
                      borderRadius: msg.role === "user" ? "12px 2px 12px 12px" : "2px 12px 12px 12px",
                      padding: "10px 14px",
                      fontSize: 12, lineHeight: 1.7,
                      color: msg.role === "user" ? "#80d4ff" : "#b0e8ff",
                      boxShadow: msg.role === "assistant" ? "0 0 20px #00d4ff10" : "none",
                      whiteSpace: "pre-wrap",
                    }}>
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))}

              {loading && (
                <div style={{ display: "flex", gap: 10, alignItems: "center", animation: "slideIn 0.3s ease" }}>
                  <div style={{
                    width: 28, height: 28,
                    border: "1px solid #00d4ff",
                    borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 9, color: "#00d4ff",
                    boxShadow: "0 0 10px #00d4ff40",
                    animation: "ringPulse 1s infinite",
                  }}>AI</div>
                  <div style={{
                    background: "linear-gradient(135deg, #001020, #001828)",
                    border: "1px solid #00d4ff40",
                    borderRadius: "2px 12px 12px 12px",
                    padding: "10px 20px",
                    display: "flex", gap: 6, alignItems: "center",
                  }}>
                    {[0, 1, 2].map(i => (
                      <div key={i} style={{
                        width: 6, height: 6, borderRadius: "50%",
                        background: "#00d4ff",
                        animation: `blink 1s ${i * 0.2}s infinite`,
                        boxShadow: "0 0 6px #00d4ff",
                      }} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* INPUT */}
            <div style={{
              padding: "16px 0 20px",
              borderTop: "1px solid #00d4ff15",
            }}>
              <div style={{
                display: "flex", gap: 10, alignItems: "center",
                background: "linear-gradient(135deg, #001020, #001828)",
                border: "1px solid #00d4ff40",
                borderRadius: 8,
                padding: "4px 4px 4px 16px",
                boxShadow: "0 0 20px #00d4ff10",
              }}>
                <span style={{ fontSize: 10, color: "#00d4ff60", letterSpacing: 1, whiteSpace: "nowrap" }}>&gt;_</span>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Komut girin, Bay Stark..."
                  disabled={loading}
                  style={{
                    flex: 1, background: "transparent", border: "none", outline: "none",
                    color: "#b0e8ff", fontSize: 12, fontFamily: "'Share Tech Mono', monospace",
                    caretColor: "#00d4ff",
                  }}
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  style={{
                    background: loading || !input.trim() ? "#001828" : "linear-gradient(135deg, #003355, #005577)",
                    border: `1px solid ${loading || !input.trim() ? "#00d4ff20" : "#00d4ff"}`,
                    borderRadius: 6, padding: "8px 20px",
                    color: loading || !input.trim() ? "#00d4ff40" : "#00d4ff",
                    fontSize: 10, letterSpacing: 2,
                    cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                    fontFamily: "'Orbitron', sans-serif",
                    boxShadow: loading || !input.trim() ? "none" : "0 0 10px #00d4ff30",
                    transition: "all 0.2s ease",
                  }}
                >
                  GÖNDER
                </button>
              </div>
              <div style={{ fontSize: 9, color: "#00d4ff25", marginTop: 6, letterSpacing: 1, textAlign: "center" }}>
                STARK ENDÜSTRİLERİ — GİZLİ — YEL.4 ŞİFRELEME AKTİF
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <div style={{
            width: 180, flexShrink: 0,
            padding: "16px 120px 16px 16px",
            borderLeft: "1px solid #00d4ff10",
            display: "flex", flexDirection: "column", gap: 16,
          }}>
            <div>
              <div style={{ fontSize: 9, letterSpacing: 3, color: "#00d4ff40", marginBottom: 10 }}>HIZLI ERİŞİM</div>
              {[
                "Tehdit analizi yap",
                "Stark Tower durumu",
                "Zırh sistemi kontrol",
                "Çevre taraması başlat",
                "Güvenlik protokolü",
              ].map((cmd, i) => (
                <button
                  key={i}
                  onClick={() => { setInput(cmd); setTimeout(() => inputRef.current?.focus(), 50); }}
                  style={{
                    display: "block", width: "100%", textAlign: "left",
                    background: "transparent",
                    border: "1px solid #00d4ff15",
                    borderRadius: 4, padding: "6px 8px", marginBottom: 4,
                    color: "#00d4ff50", fontSize: 9, letterSpacing: 1,
                    cursor: "pointer", fontFamily: "'Share Tech Mono', monospace",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={e => { e.target.style.borderColor = "#00d4ff60"; e.target.style.color = "#00d4ff"; e.target.style.background = "#001828"; }}
                  onMouseLeave={e => { e.target.style.borderColor = "#00d4ff15"; e.target.style.color = "#00d4ff50"; e.target.style.background = "transparent"; }}
                >
                  {cmd}
                </button>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 9, letterSpacing: 3, color: "#00d4ff40", marginBottom: 10 }}>KONUŞMA</div>
              <div style={{ fontSize: 10, color: "#00d4ff60" }}>
                {messages.length} mesaj
              </div>
              {messages.length > 0 && (
                <button
                  onClick={() => setMessages([])}
                  style={{
                    marginTop: 6, background: "transparent", border: "1px solid #ff444430",
                    borderRadius: 4, padding: "4px 8px", color: "#ff444460",
                    fontSize: 9, cursor: "pointer", letterSpacing: 1, fontFamily: "'Share Tech Mono', monospace",
                  }}
                  onMouseEnter={e => { e.target.style.borderColor = "#ff4444"; e.target.style.color = "#ff4444"; }}
                  onMouseLeave={e => { e.target.style.borderColor = "#ff444430"; e.target.style.color = "#ff444460"; }}
                >
                  SIFIRLA
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
