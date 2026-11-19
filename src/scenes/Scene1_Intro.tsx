import React from "react";
import { AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ARRAY, BOX, colors, font, WIDTH } from "../theme";

// Narration: 7.62s -> ceil(7.62*30) + 30 padding
export const DURATION = 259;

const GAP = 16;

// Hand-off into Scene 2: after the narration (~229f) the boxes glide into
// Scene 2's top row (64px, 8px gap, top 90, centered) and "Divide" fades in.
const OUT_START = 232;
const OUT_END = 256;
const OUTER = BOX + 6; // Scene 1 boxes: 72 content + 3px border each side
const ROW1_LEFT = (WIDTH - (ARRAY.length * OUTER + (ARRAY.length - 1) * GAP)) / 2;
const ROW1_TOP = 300;
const S2_SIZE = 64;
const S2_INNER = 8;
const S2_LEFT = (WIDTH - (ARRAY.length * S2_SIZE + (ARRAY.length - 1) * S2_INNER)) / 2;
const S2_TOP = 90;

const handoff = (frame: number) =>
  interpolate(frame, [OUT_START, OUT_END], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  });

const Box: React.FC<{ value: number; index: number }> = ({ value, index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // "Here are seven numbers..." — boxes slide in one after another
  const s = spring({ frame: frame - 20 - index * 6, fps, config: { damping: 14 } });
  const x = interpolate(s, [0, 1], [500, 0]);
  // "...in no particular order" — a little wobble to stress the disorder
  const wobble = Math.sin((frame - 45 - index * 4) / 4) * interpolate(frame, [45, 55, 75, 85], [0, 6, 6, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const h = handoff(frame);
  const mix = (a: number, b: number) => a + (b - a) * h;
  const size = mix(OUTER, S2_SIZE);
  return (
    <div
      style={{
        position: "absolute",
        left: mix(ROW1_LEFT + index * (OUTER + GAP), S2_LEFT + index * (S2_SIZE + S2_INNER)),
        top: mix(ROW1_TOP, S2_TOP),
        width: size,
        height: size,
        boxSizing: "border-box",
        borderRadius: mix(14, 12),
        background: colors.box,
        border: `3px solid ${colors.boxBorder}`,
        color: colors.text,
        fontSize: mix(32, 28),
        fontWeight: 700,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: s,
        transform: `translateX(${x}px) rotate(${wobble}deg)`,
      }}
    >
      {value}
    </div>
  );
};

export const Scene1_Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titlePop = spring({ frame, fps, config: { damping: 12 } });
  // "Merge sort puts them in order..." (~3s)
  const sub = interpolate(frame, [90, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // "...divide," (~6s) "then merge." (~6.9s)
  const divide = spring({ frame: frame - 175, fps, config: { damping: 12 } });
  const arrow = interpolate(frame, [190, 205], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const merge = spring({ frame: frame - 202, fps, config: { damping: 12 } });

  const h = handoff(frame);
  const fadeOut = 1 - h;

  const pill = (color: string, p: number): React.CSSProperties => ({
    padding: "12px 32px",
    borderRadius: 999,
    border: `3px solid ${color}`,
    color,
    fontSize: 36,
    fontWeight: 700,
    opacity: p,
    transform: `scale(${p})`,
  });

  return (
    <AbsoluteFill style={{ background: colors.bg, color: colors.text, fontFamily: font, alignItems: "center" }}>
      <Audio src={staticFile("audio/scene1.wav")} />

      <div style={{ position: "absolute", top: 110, fontSize: 96, fontWeight: 800, transform: `scale(${titlePop})`, letterSpacing: 1, opacity: fadeOut }}>
        Merge <span style={{ color: colors.accent }}>Sort</span>
      </div>

      <div style={{ position: "absolute", top: 24, width: "100%", textAlign: "center", fontSize: 40, fontWeight: 700, opacity: h }}>Divide</div>

      {ARRAY.map((v, i) => (
        <Box key={i} value={v} index={i} />
      ))}

      <div style={{ position: "absolute", top: 410, fontSize: 30, color: colors.muted, opacity: sub * fadeOut }}>
        one simple idea
      </div>

      <div style={{ position: "absolute", top: 480, display: "flex", alignItems: "center", gap: 28, opacity: fadeOut }}>
        <div style={pill(colors.left, divide)}>divide</div>
        <div style={{ fontSize: 44, color: colors.muted, opacity: arrow }}>→</div>
        <div style={pill(colors.right, merge)}>merge</div>
      </div>
    </AbsoluteFill>
  );
};
