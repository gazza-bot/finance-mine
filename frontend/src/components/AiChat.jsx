import { useEffect, useRef, useState } from "react";
import Mascot from "./Mascot";

const inputClass =
  "w-full rounded-brutal border-[3px] border-ink bg-white px-4 py-3 text-sm font-medium text-ink placeholder:text-ink/50 transition focus:bg-yellow-soft focus:shadow-brutal-sm focus:outline-none";

const sendClass =
  "shrink-0 rounded-brutal border-[3px] border-ink bg-yellow px-6 py-3 text-[11px] font-bold tracking-[0.1em] text-ink uppercase shadow-brutal-sm transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-50";

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1.5 py-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="animate-dot h-2 w-2 rounded-full bg-ink"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  );
}

export default function AiChat({
  insight,
  comment,
  chat,
  thinking,
  aiEnabled,
  onSend,
}) {
  const [text, setText] = useState("");
  const logRef = useRef(null);

  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [chat, thinking]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const message = text.trim();
    if (!message || thinking) return;
    setText("");
    await onSend(message);
  };

  const bubbleText =
    comment || insight?.message || "Halo! Aku Si Koin, teman keuanganmu.";
  const verdict = insight?.verdict || "Memuat";

  return (
    <section className="rounded-brutal border-[3px] border-ink bg-white p-7 shadow-brutal">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-xl font-bold text-ink">
          Ngobrol sama Si Koin
        </h2>
        <span
          className={`rounded-brutal border-2 border-ink px-2.5 py-1 text-[11px] font-bold tracking-widest text-ink uppercase shadow-brutal-xs ${
            aiEnabled ? "bg-lime text-white" : "bg-yellow"
          }`}
          title={
            aiEnabled
              ? "Gemini API aktif"
              : "Tanpa GEMINI_API_KEY di backend/.env, jawaban pakai aturan lokal"
          }
        >
          {aiEnabled ? "AI aktif" : "Mode dasar"}
        </span>
      </div>

      <div className="mt-6 flex items-start gap-4">
        <Mascot mood={insight?.mood} thinking={thinking} />
        <div className="relative mt-2 rounded-brutal border-[3px] border-ink bg-yellow px-5 py-4 shadow-brutal">
          <span className="absolute -left-[9px] top-7 h-4 w-4 rotate-45 border-b-[3px] border-l-[3px] border-ink bg-yellow" />
          <span className="inline-block rounded-brutal border-2 border-ink bg-ink px-2 py-0.5 text-[10px] font-bold tracking-[0.15em] text-white uppercase">
            {verdict}
          </span>
          <p className="mt-2 text-sm leading-relaxed font-medium text-ink">
            {thinking ? <TypingDots /> : bubbleText}
          </p>
        </div>
      </div>

      <div
        ref={logRef}
        className="mt-6 max-h-80 space-y-3 overflow-y-auto rounded-brutal border-[3px] border-ink bg-canvas p-4"
      >
        {chat.length === 0 && !thinking && (
          <p className="py-6 text-center text-[11px] font-bold tracking-[0.15em] text-ink/50 uppercase">
            Belum ada obrolan. Tanya apa aja soal keuanganmu.
          </p>
        )}
        {chat.map((m) => {
          const isUser = m.role === "user";
          return (
            <div
              key={m.id}
              className={`flex ${isUser ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-brutal border-[3px] border-ink px-4 py-2.5 text-sm font-medium shadow-brutal-xs ${
                  isUser ? "bg-primary text-white" : "bg-yellow-soft text-ink"
                }`}
              >
                <p className="whitespace-pre-wrap">{m.content}</p>
                <p
                  className={`mt-1.5 text-[10px] font-bold tracking-wider uppercase ${
                    isUser ? "text-white/60" : "text-ink/45"
                  }`}
                >
                  {isUser ? "Kamu" : "Si Koin"}
                </p>
              </div>
            </div>
          );
        })}
        {thinking && chat.length > 0 && (
          <div className="flex justify-start">
            <div className="rounded-brutal border-[3px] border-ink bg-yellow-soft px-4 py-2.5 shadow-brutal-xs">
              <TypingDots />
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-4 flex gap-3">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Tanya soal sisa budget, pengeluaran hari ini..."
          className={inputClass}
          maxLength={1000}
        />
        <button type="submit" disabled={thinking || !text.trim()} className={sendClass}>
          {thinking ? "Bentar..." : "Kirim"}
        </button>
      </form>
    </section>
  );
}
