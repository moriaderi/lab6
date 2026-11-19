import React from "react";
import { AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ARRAY, WIDTH } from "../theme";

// Narration: 7.62s -> ceil(7.62*30) + 30 padding
export const DURATION = 259;

// Scene 1 look: playing cards tossed on a casino table.
const P = {
  feltCenter: "#1f6f43",
  feltEdge: "#0e3b24",
  gold: "#f5c84c",
  goldDark: "#8a6a12",
  card: "#fbfaf5",
  cardEdge: "#d9d4c3",
  red: "#c8102e",
  black: "#1a1a1a",
  cream: "#efe6c8",
  chipDivide: "#b3202f",
  chipMerge: "#1f4fa0",
};
const SERIF = "Georgia, 'Times New Roman', serif";

const CARD_W = 90;
const CARD_H = 126;
const GAP = 22;
const ROW_LEFT = (WIDTH - (ARRAY.length * CARD_W + (ARRAY.length - 1) * GAP)) / 2;
const ROW_TOP = 236;
const SUITS = ["♥", "♠", "♦", "♣"];

// Where each card lands when "tossed" (centre-ish of the table, scattered)
const SCATTER = [
  { x: 330, y: 300, r: -24 },
  { x: 520, y: 250, r: 17 },
  { x: 660, y: 330, r: -9 },
  { x: 430, y: 380, r: 31 },
  { x: 780, y: 230, r: -18 },
  { x: 880, y: 360, r: 12 },
  { x: 590, y: 420, r: -33 },
];
// Final "messy row": small tilt / vertical jitter to stress "no particular order"
const MESSY = [
  { dy: 6, r: -5 },
  { dy: -8, r: 4 },
  { dy: 3, r: -2 },
  { dy: -4, r: 6 },
  { dy: 9, r: -4 },
  { dy: -6, r: 3 },
  { dy: 2, r: -6 },
];

const TOSS_START = 21; // ~0.7s "Here are seven numbers"
const GATHER_START = 62; // "...in no particular order"

const Card: React.FC<{ value: number; index: number }> = ({ value, index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const red = index % 2 === 0;
  const color = red ? P.red : P.black;
  const suit = SUITS[index % 4];

  // Toss: fly in from below the table edge, spinning, to the scatter spot
  const toss = spring({ frame: frame - TOSS_START - index * 4, fps, config: { damping: 15, mass: 0.7 } });
  const sc = SCATTER[index];
  const fromX = WIDTH / 2 - CARD_W / 2 + (index - 3) * 60;
  const fromY = 820;
  let x = interpolate(toss, [0, 1], [fromX, sc.x]);
  let y = interpolate(toss, [0, 1], [fromY, sc.y]);
  let r = interpolate(toss, [0, 1], [sc.r - 160, sc.r]);

  // Gather into the messy row
  const gather = spring({ frame: frame - GATHER_START - index * 3, fps, config: { damping: 16 } });
  const m = MESSY[index];
  x = interpolate(gather, [0, 1], [x, ROW_LEFT + index * (CARD_W + GAP)]);
  y = interpolate(gather, [0, 1], [y, ROW_TOP + m.dy]);
  r = interpolate(gather, [0, 1], [r, m.r]);
  const lift = Math.sin(Math.PI * gather) * 0.08; // a little lift while sliding

  const corner = (flip: boolean): React.CSSProperties => ({
    position: "absolute",
    ...(flip ? { right: 7, bottom: 5, transform: "rotate(180deg)" } : { left: 7, top: 5 }),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    lineHeight: 1,
    fontSize: 15,
    fontWeight: 700,
    color,
  });

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: CARD_W,
        height: CARD_H,
        boxSizing: "border-box",
        borderRadius: 10,
        background: `linear-gradient(160deg, #ffffff 0%, ${P.card} 60%, #f1eee2 100%)`,
        border: `1px solid ${P.cardEdge}`,
        boxShadow: `0 ${10 + lift * 120}px ${18 + lift * 120}px rgba(0,0,0,0.45), 0 2px 3px rgba(0,0,0,0.3)`,
        transform: `rotate(${r}deg) scale(${1 + lift})`,
        opacity: toss > 0.01 ? 1 : 0,
        fontFamily: SERIF,
      }}
    >
      <div style={corner(false)}>
        <span>{value}</span>
        <span style={{ fontSize: 13 }}>{suit}</span>
      </div>
      <div style={corner(true)}>
        <span>{value}</span>
        <span style={{ fontSize: 13 }}>{suit}</span>
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color,
        }}
      >
        <div style={{ fontSize: 44, fontWeight: 700, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 20, lineHeight: 1, marginTop: 4 }}>{suit}</div>
      </div>
    </div>
  );
};

const Chip: React.FC<{ label: string; color: string; p: number; spin: number }> = ({ label, color, p, spin }) => (
  <div
    style={{
      width: 132,
      height: 132,
      borderRadius: "50%",
      background: color,
      boxShadow: "0 8px 0 rgba(0,0,0,0.35), 0 14px 22px rgba(0,0,0,0.4)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      opacity: Math.min(1, p * 1.5),
      transform: `translateY(${(1 - p) * -60}px) scale(${0.6 + 0.4 * p})`,
    }}
  >
    {/* dashed edge stripes, slowly spinning */}
    <div
      style={{
        position: "absolute",
        inset: 6,
        borderRadius: "50%",
        border: "10px dashed #ffffff",
        transform: `rotate(${spin}deg)`,
      }}
    />
    <div
      style={{
        width: 88,
        height: 88,
        borderRadius: "50%",
        background: color,
        border: `2px solid rgba(255,255,255,0.75)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontFamily: SERIF,
        fontWeight: 700,
        fontSize: 20,
        letterSpacing: 0.5,
        position: "relative",
      }}
    >
      {label}
    </div>
  </div>
);

export const Scene1_Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titlePop = spring({ frame, fps, config: { damping: 12 } });
  // "...with one simple idea" (~3s)
  const sub = interpolate(frame, [90, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // "divide," (~5.8s) "then merge." (~6.7s)
  const divide = spring({ frame: frame - 174, fps, config: { damping: 11 } });
  const arrow = interpolate(frame, [188, 200], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const merge = spring({ frame: frame - 201, fps, config: { damping: 11 } });

  return (
    <AbsoluteFill
      style={{
        background: `repeating-radial-gradient(circle at 30% 40%, rgba(255,255,255,0.018) 0px, rgba(0,0,0,0.025) 2px, rgba(255,255,255,0.0) 4px), radial-gradient(ellipse at center, ${P.feltCenter} 0%, #17573a 55%, ${P.feltEdge} 100%)`,
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      <Audio src={staticFile("audio/scene1.wav")} />

      {/* table rail: inner stitched line */}
      <div
        style={{
          position: "absolute",
          inset: 22,
          borderRadius: 40,
          border: `2px dashed rgba(245,200,76,0.28)`,
          boxShadow: "inset 0 0 80px rgba(0,0,0,0.45)",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: 58,
          fontFamily: SERIF,
          fontSize: 100,
          fontWeight: 700,
          fontStyle: "italic",
          color: P.gold,
          letterSpacing: 2,
          textShadow: `0 3px 0 ${P.goldDark}, 0 8px 18px rgba(0,0,0,0.55)`,
          transform: `scale(${titlePop})`,
        }}
      >
        Merge Sort
      </div>

      {ARRAY.map((v, i) => (
        <Card key={i} value={v} index={i} />
      ))}

      <div
        style={{
          position: "absolute",
          top: 410,
          fontFamily: SERIF,
          fontStyle: "italic",
          fontSize: 34,
          color: P.cream,
          textShadow: "0 2px 6px rgba(0,0,0,0.5)",
          opacity: sub,
          transform: `translateY(${(1 - sub) * 10}px)`,
        }}
      >
        ~ one simple idea ~
      </div>

      <div style={{ position: "absolute", top: 478, display: "flex", alignItems: "center", gap: 36 }}>
        <Chip label="divide" color={P.chipDivide} p={divide} spin={frame * 0.6} />
        <div style={{ fontSize: 56, color: P.gold, opacity: arrow, fontFamily: SERIF, textShadow: "0 3px 6px rgba(0,0,0,0.5)" }}>→</div>
        <Chip label="merge" color={P.chipMerge} p={merge} spin={-frame * 0.6} />
      </div>
    </AbsoluteFill>
  );
};
