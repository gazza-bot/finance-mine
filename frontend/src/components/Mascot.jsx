import { useState } from "react";

const INK = "#0a0a0a";

const line = {
  fill: "none",
  stroke: INK,
  strokeWidth: 5,
  strokeLinecap: "round",
};

const FACES = {
  hemat: { eyes: "happy", mouth: "bigSmile", blush: true },
  oke: { eyes: "normal", mouth: "smile", blush: true },
  waspada: { eyes: "normal", mouth: "wavy", brows: "worried" },
  boros: { eyes: "normal", mouth: "frown", brows: "angry", sweat: true },
  overspend: { eyes: "cry", mouth: "wavy", tears: true },
  no_budget: { eyes: "normal", mouth: "o", question: true },
};

function Eyes({ variant }) {
  if (variant === "happy" || variant === "cry") {
    return (
      <>
        <path d="M41 60 q6 -10 12 0" {...line} />
        <path d="M71 60 q6 -10 12 0" {...line} />
      </>
    );
  }
  return (
    <>
      <circle cx="47" cy="58" r="5.5" fill={INK} />
      <circle cx="77" cy="58" r="5.5" fill={INK} />
    </>
  );
}

function Mouth({ variant }) {
  if (variant === "bigSmile") {
    return <path d="M46 76 a16 13 0 0 0 32 0 z" fill={INK} />;
  }
  if (variant === "smile") {
    return <path d="M50 76 q12 10 24 0" {...line} />;
  }
  if (variant === "wavy") {
    return <path d="M48 80 q7 -7 14 0 q7 7 14 0" {...line} />;
  }
  if (variant === "frown") {
    return <path d="M50 84 q12 -11 24 0" {...line} />;
  }
  return <ellipse cx="62" cy="80" rx="7" ry="8" fill={INK} />;
}

function Brows({ variant }) {
  if (variant === "worried") {
    return (
      <>
        <path d="M39 46 L53 41" {...line} />
        <path d="M71 41 L85 46" {...line} />
      </>
    );
  }
  return (
    <>
      <path d="M39 41 L53 47" {...line} />
      <path d="M71 47 L85 41" {...line} />
    </>
  );
}

export default function Mascot({ mood = "oke", thinking = false, className = "" }) {
  const [waving, setWaving] = useState(false);
  const face = FACES[mood] || FACES.oke;

  const handleClick = () => {
    if (waving) return;
    setWaving(true);
    setTimeout(() => setWaving(false), 1300);
  };

  let animClass = "animate-mascot-bounce";
  if (waving) {
    animClass = "animate-mascot-wave";
  } else if (thinking) {
    animClass = "animate-mascot-wiggle";
  } else if (mood === "boros" || mood === "overspend") {
    animClass = "animate-mascot-shake";
  }

  const moodLabel = FACES[mood] ? `mood ${mood}` : "mood netral";

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={`Si Koin, ${moodLabel}. Klik untuk menyapa.`}
      className={`shrink-0 cursor-pointer rounded-brutal transition-transform duration-150 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/50 ${className}`}
    >
      <svg
        viewBox="0 0 130 130"
        className={`h-28 w-28 ${animClass}`}
        role="img"
        aria-hidden="true"
      >
        <path
          d="M22 80 q-12 8 -8 18"
          fill="none"
          stroke={INK}
          strokeWidth={6}
          strokeLinecap="round"
        />
        <path
          d="M102 80 q12 8 8 18"
          fill="none"
          stroke={INK}
          strokeWidth={6}
          strokeLinecap="round"
        />

        <circle cx={62} cy={68} r={46} fill="#ffd23f" stroke={INK} strokeWidth={5} />
        <circle
          cx={62}
          cy={68}
          r={38}
          fill="none"
          stroke={INK}
          strokeWidth={2.5}
          opacity={0.35}
        />
        <path
          d="M34 48 q10 -14 26 -17"
          fill="none"
          stroke="#ffffff"
          strokeWidth={6}
          strokeLinecap="round"
          opacity={0.75}
        />

        {face.blush && (
          <>
            <ellipse cx="34" cy="70" rx="6" ry="4" fill="#ff4d6d" opacity="0.45" />
            <ellipse cx="90" cy="70" rx="6" ry="4" fill="#ff4d6d" opacity="0.45" />
          </>
        )}

        <Eyes variant={face.eyes} />
        {face.brows && <Brows variant={face.brows} />}
        <Mouth variant={face.mouth} />

        {face.tears && (
          <>
            <ellipse cx="43" cy="74" rx="4.5" ry="6" fill="#ffffff" stroke={INK} strokeWidth={3} />
            <ellipse cx="81" cy="74" rx="4.5" ry="6" fill="#ffffff" stroke={INK} strokeWidth={3} />
          </>
        )}

        {face.sweat && (
          <path
            d="M112 34 q9 12 0 18 q-9 -6 0 -18 z"
            fill="#ffffff"
            stroke={INK}
            strokeWidth={3}
            strokeLinejoin="round"
          />
        )}

        {face.question && (
          <text
            x={100}
            y={28}
            fontSize={30}
            fontWeight={700}
            fill={INK}
            fontFamily="'Space Grotesk', sans-serif"
          >
            ?
          </text>
        )}
      </svg>
    </button>
  );
}
