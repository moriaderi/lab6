import React from "react";
import { AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

// Narration is 7.38s -> ceil(7.38*30) + 45 frames of hold at the end.
export const DURATION = 267;

const W = 1280;
const H = 720;
const HORIZON = 468;

// Retro neon / synthwave palette (local to this scene).
const neon = {
  cyan: "#00f0ff",
  magenta: "#ff2bd6",
  yellow: "#ffd23f",
  orange: "#ff8a00",
  pink: "#ff2b8a",
  green: "#39ff88",
  text: "#f4eaff",
  skyTop: "#1a0033",
  skyMid: "#2a0548",
};

const DISPLAY = "'Arial Black', 'Segoe UI Black', Impact, sans-serif";
const MONO = "'Consolas', 'Courier New', monospace";

const glowText = (c: string, k = 1) =>
  `0 0 ${4 * k}px #fff, 0 0 ${10 * k}px ${c}, 0 0 ${22 * k}px ${c}, 0 0 ${44 * k}px ${c}`;

const SORTED = [3, 9, 10, 27, 38, 43, 82];

// Takeaway start frames, timed to the narration phrases.
const CARDS: { num: string; title: string; sub: string; color: string; at: number }[] = [
  { num: "01", title: "DIVIDE", sub: "Split until pieces are trivial", color: neon.cyan, at: 35 },
  { num: "02", title: "MERGE", sub: "Take the smaller front, repeat", color: neon.magenta, at: 95 },
  { num: "03", title: "O(n log n)", sub: "n work × log n levels", color: neon.yellow, at: 155 },
];

// Deterministic "neon tube warming up" flicker.
const flicker = (f: number, start: number) => {
  const t = f - start;
  if (t < 0) return 0;
  if (t > 18) return 1;
  const pattern = [0.2, 0.9, 0.1, 0.0, 1, 0.3, 1, 1, 0.5, 1, 1, 1, 0.7, 1, 1, 1, 1, 1, 1];
  return pattern[Math.floor(t)];
};

const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  const vpX = 640;
  // Vertical grid lines converging at the vanishing point.
  const verticals = Array.from({ length: 25 }, (_, i) => (i - 12) * 150);
  // Horizontal lines scroll toward the viewer.
  const phase = (frame / 40) % 1;
  const horizontals = Array.from({ length: 14 }, (_, i) => {
    const z = i + 1 - phase;
    return HORIZON + 260 / Math.max(z, 0.05);
  }).filter((y) => y <= H + 2);

  const sunR = 165;
  const sunCx = 965;
  const stripes = Array.from({ length: 6 }, (_, i) => {
    const y = HORIZON - 12 - i * 22;
    const h = Math.max(2, 9 - i * 1.4);
    return { y, h };
  });

  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id="sky6" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={neon.skyTop} />
          <stop offset="0.62" stopColor={neon.skyMid} />
          <stop offset="0.65" stopColor="#0a0012" />
          <stop offset="1" stopColor="#000" />
        </linearGradient>
        <linearGradient id="sun6" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={neon.yellow} />
          <stop offset="0.45" stopColor={neon.orange} />
          <stop offset="1" stopColor={neon.pink} />
        </linearGradient>
        <linearGradient id="floorFade6" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0.85" />
          <stop offset="0.25" stopColor="#000" stopOpacity="0" />
        </linearGradient>
        <mask id="sunMask6">
          <rect x="0" y="0" width={W} height={H} fill="#fff" />
          {stripes.map((s, i) => (
            <rect key={i} x="0" y={s.y} width={W} height={s.h} fill="#000" />
          ))}
        </mask>
        <clipPath id="aboveHorizon6">
          <rect x="0" y="0" width={W} height={HORIZON} />
        </clipPath>
        <filter id="blur6" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="18" />
        </filter>
      </defs>

      <rect width={W} height={H} fill="url(#sky6)" />

      {/* stars */}
      {Array.from({ length: 40 }, (_, i) => {
        const x = (i * 337) % W;
        const y = (i * 113) % (HORIZON - 120);
        const tw = 0.35 + 0.35 * Math.sin(frame / 9 + i);
        return <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 1.6 : 1} fill="#fff" opacity={tw} />;
      })}

      {/* half sun */}
      <g clipPath="url(#aboveHorizon6)">
        <circle cx={sunCx} cy={HORIZON} r={sunR + 20} fill={neon.pink} opacity={0.35} filter="url(#blur6)" />
        <circle cx={sunCx} cy={HORIZON} r={sunR} fill="url(#sun6)" mask="url(#sunMask6)" />
      </g>

      {/* floor */}
      <rect x="0" y={HORIZON} width={W} height={H - HORIZON} fill="#05000a" />
      <g stroke={neon.magenta} strokeWidth={2} opacity={0.85} style={{ filter: `drop-shadow(0 0 4px ${neon.magenta})` }}>
        {verticals.map((dx, i) => (
          <line key={`v${i}`} x1={vpX} y1={HORIZON} x2={vpX + dx * 4} y2={H} />
        ))}
        {horizontals.map((y, i) => (
          <line key={`h${i}`} x1={0} y1={y} x2={W} y2={y} />
        ))}
      </g>
      <rect x="0" y={HORIZON} width={W} height={H - HORIZON} fill="url(#floorFade6)" />
      <line x1={0} y1={HORIZON} x2={W} y2={HORIZON} stroke={neon.magenta} strokeWidth={3} style={{ filter: `drop-shadow(0 0 8px ${neon.magenta})` }} />
    </svg>
  );
};

const Takeaway: React.FC<(typeof CARDS)[number]> = ({ num, title, sub, color, at }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - at, fps, config: { damping: 16 } });
  const f = flicker(frame, at);
  const pulse = 0.85 + 0.15 * Math.sin((frame - at) / 10);
  return (
    <div
      style={{
        width: 560,
        height: 98,
        border: `2px solid ${color}`,
        borderRadius: 4,
        background: "rgba(10, 0, 24, 0.35)",
        boxShadow: `0 0 ${10 * pulse}px ${color}, 0 0 ${26 * pulse}px ${color}66, inset 0 0 ${16 * pulse}px ${color}55`,
        display: "flex",
        alignItems: "center",
        gap: 24,
        padding: "0 24px",
        boxSizing: "border-box",
        opacity: p * (0.4 + 0.6 * f),
        transform: `translateX(${(1 - p) * -80}px) skewX(${(1 - p) * -12}deg)`,
      }}
    >
      <div style={{ fontFamily: DISPLAY, fontSize: 58, color: "#fff", textShadow: glowText(color, 0.8), width: 92, lineHeight: 1 }}>{num}</div>
      <div style={{ width: 2, alignSelf: "stretch", margin: "16px 0", background: color, boxShadow: `0 0 8px ${color}` }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ fontFamily: DISPLAY, fontSize: 32, color, letterSpacing: 2, textShadow: `0 0 8px ${color}` }}>{title}</div>
        <div style={{ fontFamily: MONO, fontSize: 21, color: neon.text, whiteSpace: "nowrap", textShadow: "0 0 6px #000, 0 0 2px #000" }}>{sub}</div>
      </div>
    </div>
  );
};

export const Scene6_Recap: React.FC = () => {
  const frame = useCurrentFrame();
  const titleF = flicker(frame, 2);
  const arrayIn = interpolate(frame, [190, 212], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const creditIn = interpolate(frame, [228, 245], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pulse = 1 + 0.25 * Math.sin((frame - 190) / 7);

  return (
    <AbsoluteFill style={{ background: "#000", color: neon.text, fontFamily: DISPLAY, overflow: "hidden" }}>
      <Audio src={staticFile("audio/scene6.wav")} />
      <Backdrop />

      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: 22,
          width: "100%",
          textAlign: "center",
          fontSize: 92,
          letterSpacing: 18,
          fontStyle: "italic",
          color: "#e9fdff",
          textShadow: glowText(neon.cyan, 1.1),
          opacity: titleF,
          lineHeight: 1,
        }}
      >
        RECAP
      </div>
      <div
        style={{
          position: "absolute",
          top: 122,
          width: "100%",
          textAlign: "center",
          fontFamily: MONO,
          fontSize: 20,
          letterSpacing: 8,
          color: neon.magenta,
          textShadow: `0 0 8px ${neon.magenta}`,
          opacity: interpolate(frame, [12, 28], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}
      >
        MERGE SORT
      </div>

      {/* Takeaways on the left */}
      <div style={{ position: "absolute", left: 60, top: 156, display: "flex", flexDirection: "column", gap: 14 }}>
        {CARDS.map((c) => (
          <Takeaway key={c.num} {...c} />
        ))}
      </div>

      {/* Sorted array on the floor */}
      <div
        style={{
          position: "absolute",
          top: 528,
          left: 0,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          opacity: arrayIn,
          transform: `translateY(${(1 - arrayIn) * 40}px)`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 30,
            padding: "10px 36px",
            background: "rgba(0,0,0,0.78)",
            border: `1px solid ${neon.green}88`,
            boxShadow: `0 0 18px rgba(0,0,0,0.9), 0 0 ${10 * pulse}px ${neon.green}55`,
            borderRadius: 4,
          }}
        >
          <span style={{ fontFamily: MONO, fontSize: 40, color: neon.green, textShadow: `0 0 10px ${neon.green}` }}>[</span>
          {SORTED.map((v, i) => {
            const d = interpolate(frame, [192 + i * 3, 200 + i * 3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            return (
              <span
                key={v}
                style={{
                  fontFamily: MONO,
                  fontWeight: 700,
                  fontSize: 52,
                  color: "#eafff2",
                  textShadow: glowText(neon.green, 0.7 * pulse),
                  opacity: d,
                  minWidth: 62,
                  textAlign: "center",
                }}
              >
                {v}
              </span>
            );
          })}
          <span style={{ fontFamily: MONO, fontSize: 40, color: neon.green, textShadow: `0 0 10px ${neon.green}` }}>]</span>
        </div>
        <div style={{ marginTop: 10, fontFamily: MONO, fontSize: 18, letterSpacing: 6, color: neon.green, textShadow: "0 0 6px #000, 0 0 4px #000", background: "rgba(0,0,0,0.6)", padding: "2px 12px" }}>
          SORTED
        </div>
      </div>

      {/* Credit */}
      <div
        style={{
          position: "absolute",
          bottom: 14,
          width: "100%",
          textAlign: "center",
          fontFamily: MONO,
          fontSize: 16,
          letterSpacing: 4,
          color: neon.cyan,
          opacity: creditIn,
          textShadow: `0 0 6px ${neon.cyan}, 0 0 4px #000`,
        }}
      >
        <span style={{ background: "rgba(0,0,0,0.7)", padding: "3px 14px" }}>AICODE · Lab 6 · Merge Sort</span>
      </div>
    </AbsoluteFill>
  );
};
