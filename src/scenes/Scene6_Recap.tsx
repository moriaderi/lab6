import React from "react";
import { AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { BOX, colors, font } from "../theme";

// Narration is 7.38s -> ceil(7.38*30) + 45 frames of hold at the end.
export const DURATION = 267;

const SORTED = [3, 9, 10, 27, 38, 43, 82];

// Card start frames, timed to the narration phrases.
const CARDS: { title: string; sub: string; color: string; at: number }[] = [
  { title: "1. Divide", sub: "Split until pieces are trivial", color: colors.left, at: 35 },
  { title: "2. Merge", sub: "Take the smaller front, repeat", color: colors.right, at: 95 },
  { title: "3. O(n log n)", sub: "n work × log n levels", color: colors.accent, at: 155 },
];

const Card: React.FC<{ title: string; sub: string; color: string; at: number }> = ({ title, sub, color, at }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - at, fps, config: { damping: 14 } });
  return (
    <div
      style={{
        width: 330,
        height: 190,
        background: colors.panel,
        border: `3px solid ${color}`,
        borderRadius: 18,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: 14,
        padding: 20,
        boxSizing: "border-box",
        opacity: p,
        transform: `translateY(${(1 - p) * 40}px) scale(${0.85 + 0.15 * p})`,
      }}
    >
      <div style={{ fontSize: 44, fontWeight: 700, color, lineHeight: 1.2 }}>{title}</div>
      <div style={{ fontSize: 22, color: colors.muted, lineHeight: 1.3, whiteSpace: "nowrap", textAlign: "center" }}>{sub}</div>
    </div>
  );
};

export const Scene6_Recap: React.FC = () => {
  const frame = useCurrentFrame();
  const titleIn = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const arrayIn = interpolate(frame, [190, 215], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const glow = arrayIn * (14 + 8 * Math.sin((frame - 190) / 8));

  return (
    <AbsoluteFill style={{ background: colors.bg, color: colors.text, fontFamily: font }}>
      <Audio src={staticFile("audio/scene6.wav")} />

      <div style={{ position: "absolute", top: 60, width: "100%", textAlign: "center", fontSize: 56, fontWeight: 700, opacity: titleIn }}>
        Merge Sort — Recap
      </div>

      <div style={{ position: "absolute", top: 190, width: "100%", display: "flex", justifyContent: "center", gap: 40 }}>
        {CARDS.map((c) => (
          <Card key={c.title} {...c} />
        ))}
      </div>

      <div
        style={{
          position: "absolute",
          top: 455,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 18,
          opacity: arrayIn,
          transform: `translateY(${(1 - arrayIn) * 30}px)`,
        }}
      >
        <div style={{ fontSize: 24, color: colors.muted }}>[38, 27, 43, 3, 9, 82, 10] → sorted</div>
        <div style={{ display: "flex", gap: 10 }}>
        {SORTED.map((v) => (
          <div
            key={v}
            style={{
              width: BOX,
              height: BOX,
              borderRadius: 10,
              background: colors.box,
              border: `3px solid ${colors.sorted}`,
              color: colors.sorted,
              fontSize: 32,
              fontWeight: 700,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              boxShadow: `0 0 ${glow}px ${colors.sorted}`,
            }}
          >
            {v}
          </div>
        ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
