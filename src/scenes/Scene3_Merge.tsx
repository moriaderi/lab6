import React from "react";
import { AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

// Narration is 8.11s -> ceil(8.11*30) + 30 = 274 frames; all 4 merge steps finish by ~frame 240.
export const DURATION = 274;

// ---- Scene palette: "two queues on a stage with spotlights" ----
const P = {
  stage: "#0b0b0f",
  backdrop: "#15121c",
  floorTop: "#8a5a32",
  floorBottom: "#3b2414",
  floorLine: "rgba(0,0,0,0.35)",
  amber: "#f59e0b",
  amberDark: "#b45309",
  teal: "#14b8a6",
  tealDark: "#0f766e",
  led: "#ffb000",
  ledDim: "rgba(255,176,0,0.12)",
  gold: "#ffd34d",
  goldDark: "#c8940c",
  text: "#fff7e6",
  muted: "#9a8f80",
  light: "#fff3b0",
};
const MONO = "Consolas, 'Courier New', monospace";
const SANS = "'Segoe UI', Helvetica, Arial, sans-serif";

// ---- Layout ----
const TILE = 92;
const STEP_H = TILE + 12; // vertical distance between stacked tiles
const FLOOR_Y = 612; // tiles stand on this line
const LEFT_CX = 290;
const RIGHT_CX = 990;
const OUT_CX = 640;

type Item = { value: number; list: "left" | "right"; idx: number };
const ITEMS: Item[] = [
  { value: 27, list: "left", idx: 0 },
  { value: 38, list: "left", idx: 1 },
  { value: 3, list: "right", idx: 0 },
  { value: 43, list: "right", idx: 1 },
];

// Order in which items move to the output: 3, 27, 38, 43
const STEPS = [
  { item: 2, text: "27 vs 3 → take 3", compare: [0, 2] },
  { item: 0, text: "27 vs 43 → take 27", compare: [0, 3] },
  { item: 1, text: "38 vs 43 → take 38", compare: [1, 3] },
  { item: 3, text: "left is empty → take 43", compare: [3] },
];

const FIRST_STEP = 40;
const STEP_LEN = 48;
const COMPARE_LEN = 18; // spotlight before moving
const MOVE_LEN = 20;
const GREEN_AT = FIRST_STEP + STEP_LEN * 4 + 5;

const stepStart = (k: number) => FIRST_STEP + STEP_LEN * k;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// top-left Y of a tile sitting at height level h (0 = on the floor)
const levelY = (h: number) => FLOOR_Y - TILE - h * STEP_H;
const colX = (cx: number) => cx - TILE / 2;
const listCX = (it: Item) => (it.list === "left" ? LEFT_CX : RIGHT_CX);

const Tile: React.FC<{
  value: number;
  x: number;
  y: number;
  face: string;
  edge: string;
  scale?: number;
  glow?: string;
  opacity?: number;
  z?: number;
}> = ({ value, x, y, face, edge, scale = 1, glow, opacity = 1, z = 1 }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: TILE,
      height: TILE,
      borderRadius: 4,
      background: `linear-gradient(160deg, ${face} 0%, ${edge} 100%)`,
      borderBottom: `8px solid ${edge}`,
      boxSizing: "border-box",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontFamily: SANS,
      fontSize: 42,
      fontWeight: 900,
      color: "#1a1208",
      textShadow: "0 1px 0 rgba(255,255,255,0.35)",
      transform: `scale(${scale})`,
      boxShadow: glow ? `0 0 34px 6px ${glow}, 0 10px 18px rgba(0,0,0,0.6)` : "0 10px 18px rgba(0,0,0,0.6)",
      opacity,
      zIndex: z,
    }}
  >
    {value}
  </div>
);

// A cone of light from a lamp above the stage down onto a tile position
const Spotlight: React.FC<{ id: string; cx: number; targetY: number; opacity: number }> = ({ id, cx, targetY, opacity }) => {
  const srcX = cx + (cx < OUT_CX ? 90 : -90);
  const half = TILE * 0.95;
  const bottom = targetY + TILE + 6;
  return (
    <svg width={1280} height={720} style={{ position: "absolute", left: 0, top: 0, opacity, pointerEvents: "none" }}>
      <defs>
        <radialGradient id={`cone-${id}`} cx={srcX} cy={0} r={bottom} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={P.light} stopOpacity={0.55} />
          <stop offset="100%" stopColor={P.light} stopOpacity={0.12} />
        </radialGradient>
        <radialGradient id={`pool-${id}`}>
          <stop offset="0%" stopColor={P.light} stopOpacity={0.55} />
          <stop offset="100%" stopColor={P.light} stopOpacity={0} />
        </radialGradient>
      </defs>
      <polygon points={`${srcX - 14},0 ${srcX + 14},0 ${cx + half},${bottom} ${cx - half},${bottom}`} fill={`url(#cone-${id})`} />
      <ellipse cx={cx} cy={bottom} rx={half * 1.25} ry={16} fill={`url(#pool-${id})`} />
      {/* lamp housing */}
      <rect x={srcX - 22} y={-6} width={44} height={20} rx={4} fill="#2a2a33" />
    </svg>
  );
};

export const Scene3_Merge: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const intro = spring({ frame, fps, config: { damping: 14 } });
  const labelFade = interpolate(frame, [10, 30], [0, 1], clamp);
  const gold = interpolate(frame, [GREEN_AT, GREEN_AT + 15], [0, 1], clamp);
  const doneFade = interpolate(frame, [GREEN_AT + 5, GREEN_AT + 20], [0, 1], clamp);

  const moveProgress = (k: number) =>
    spring({ frame: frame - (stepStart(k) + COMPARE_LEN), fps, config: { damping: 14 }, durationInFrames: MOVE_LEN });

  const current = STEPS.reduce((acc, _s, k) => (frame >= stepStart(k) ? k : acc), -1);
  const inCompare = (k: number) => frame >= stepStart(k) && frame < stepStart(k) + COMPARE_LEN + MOVE_LEN * 0.5;

  // How many items have left each list (animated), used to drop the remaining tiles down
  const takenBefore = (it: Item, i: number) =>
    STEPS.reduce((acc, s, k) => {
      const o = ITEMS[s.item];
      return s.item !== i && o.list === it.list && o.idx < it.idx ? acc + moveProgress(k) : acc;
    }, 0);
  const takenFrom = (list: "left" | "right") =>
    STEPS.reduce((acc, s, k) => (ITEMS[s.item].list === list ? acc + moveProgress(k) : acc), 0);
  const leftEmpty = interpolate(takenFrom("left"), [1.8, 2], [0, 1], clamp) * (1 - doneFade);

  // Spotlights: one per compared item, fading in/out around each compare phase
  const spot = (i: number) =>
    STEPS.reduce((acc, s, k) => {
      if (!s.compare.includes(i)) return acc;
      const t = frame - stepStart(k);
      const on = interpolate(t, [0, 6], [0, 1], clamp) * interpolate(t, [COMPARE_LEN + 2, COMPARE_LEN + 12], [1, 0], clamp);
      return Math.max(acc, on);
    }, 0);

  const stepText = current >= 0 && frame < GREEN_AT ? STEPS[current].text : "";
  const textFade = current >= 0 ? interpolate(frame - stepStart(current), [0, 8], [0, 1], clamp) : 0;
  const ledFlicker = 0.85 + 0.15 * Math.sin(frame * 0.9);

  const floorLabel = (text: string, cx: number, color: string, opacity: number) => (
    <div
      style={{
        position: "absolute",
        left: cx - 140,
        width: 280,
        top: FLOOR_Y + 26,
        textAlign: "center",
        fontFamily: MONO,
        fontSize: 24,
        fontWeight: 700,
        letterSpacing: 6,
        color,
        opacity,
      }}
    >
      {text}
    </div>
  );

  const resultTop = levelY(3);

  return (
    <AbsoluteFill style={{ background: P.stage, fontFamily: SANS, color: P.text, overflow: "hidden" }}>
      <Audio src={staticFile("audio/scene3.wav")} />

      {/* back wall: soft vignette */}
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 70% 60% at 50% 70%, ${P.backdrop} 0%, ${P.stage} 75%)` }} />

      {/* wooden floor strip */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: FLOOR_Y,
          bottom: 0,
          background: `repeating-linear-gradient(90deg, transparent 0 158px, ${P.floorLine} 158px 160px), linear-gradient(180deg, ${P.floorTop} 0%, ${P.floorBottom} 100%)`,
          borderTop: "3px solid #b07a48",
          boxShadow: "0 -6px 30px rgba(0,0,0,0.6) inset",
        }}
      />

      {/* title */}
      <div style={{ position: "absolute", top: 26, width: "100%", textAlign: "center", fontSize: 40, fontWeight: 800, letterSpacing: 1, opacity: labelFade }}>
        Merging two sorted lists
      </div>

      {/* spotlights on compared front tiles */}
      {ITEMS.map((it, i) => {
        const s = spot(i);
        if (s <= 0) return null;
        return <Spotlight key={`spot-${i}`} id={String(i)} cx={listCX(it)} targetY={levelY(0)} opacity={s * 0.8} />;
      })}

      {/* LED scoreboard */}
      <div
        style={{
          position: "absolute",
          left: OUT_CX - 290,
          width: 580,
          top: 92,
          height: 74,
          background: `radial-gradient(circle, ${P.ledDim} 1.2px, transparent 1.6px) 0 0 / 7px 7px, #050505`,
          border: "3px solid #2b2b2b",
          borderRadius: 8,
          boxShadow: "0 0 0 2px #111, 0 8px 24px rgba(0,0,0,0.7)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontFamily: MONO,
          fontSize: 34,
          fontWeight: 700,
          letterSpacing: 2,
          color: doneFade > 0 ? P.gold : P.led,
          textShadow: `0 0 8px ${doneFade > 0 ? P.gold : P.led}, 0 0 18px ${doneFade > 0 ? P.gold : P.led}`,
          opacity: labelFade,
        }}
      >
        <span style={{ opacity: (doneFade > 0 ? doneFade : textFade * ledFlicker) }}>
          {doneFade > 0 ? "Sorted! [3, 27, 38, 43]" : stepText}
        </span>
      </div>

      {/* result column backing + empty slots */}
      <div
        style={{
          position: "absolute",
          left: colX(OUT_CX) - 16,
          width: TILE + 32,
          top: resultTop - 16,
          height: FLOOR_Y - resultTop + 16,
          borderRadius: "10px 10px 0 0",
          background: `rgba(255,211,77,${0.04 + 0.1 * gold})`,
          border: `2px solid rgba(255,211,77,${0.25 + 0.6 * gold})`,
          borderBottom: "none",
          boxShadow: gold > 0 ? `0 0 ${50 * gold}px ${10 * gold}px rgba(255,211,77,0.35)` : undefined,
          opacity: labelFade,
        }}
      />
      {[0, 1, 2, 3].map((h) => (
        <div
          key={h}
          style={{
            position: "absolute",
            left: colX(OUT_CX),
            top: levelY(h),
            width: TILE,
            height: TILE,
            borderRadius: 4,
            border: "2px dashed rgba(255,211,77,0.3)",
            boxSizing: "border-box",
            opacity: labelFade,
          }}
        />
      ))}

      {/* faded outline where the left stack used to stand once it is empty */}
      <div
        style={{
          position: "absolute",
          left: colX(LEFT_CX),
          top: levelY(0),
          width: TILE,
          height: TILE,
          borderRadius: 4,
          border: `3px dashed ${P.amber}`,
          boxSizing: "border-box",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontFamily: MONO,
          fontSize: 18,
          color: P.amber,
          opacity: leftEmpty * 0.6,
        }}
      >
        empty
      </div>

      {floorLabel("LEFT", LEFT_CX, P.amber, labelFade)}
      {floorLabel("RESULT", OUT_CX, gold > 0 ? P.gold : P.text, labelFade)}
      {floorLabel("RIGHT", RIGHT_CX, P.teal, labelFade)}

      {/* tiles */}
      {ITEMS.map((it, i) => {
        const k = STEPS.findIndex((s) => s.item === i);
        const p = moveProgress(k);
        const homeH = it.idx - takenBefore(it, i);
        const fromX = colX(listCX(it));
        const fromY = levelY(homeH);
        const toX = colX(OUT_CX);
        const toY = levelY(k);
        const x = interpolate(p, [0, 1], [fromX, toX]);
        const arc = Math.sin(Math.PI * Math.min(Math.max(p, 0), 1)) * 70;
        const y = interpolate(p, [0, 1], [fromY, toY]) - arc;
        const isLeft = it.list === "left";
        const lit = spot(i) > 0.3 && p < 0.5;
        const face = gold > 0 ? P.gold : isLeft ? P.amber : P.teal;
        const edge = gold > 0 ? P.goldDark : isLeft ? P.amberDark : P.tealDark;
        const pulse = gold > 0 ? 1 + 0.08 * Math.sin(Math.PI * gold) : 1;
        return (
          <Tile
            key={i}
            value={it.value}
            x={x}
            y={y + (1 - intro) * 60}
            face={face}
            edge={edge}
            scale={pulse * (lit ? 1.06 : 1)}
            glow={gold > 0 ? "rgba(255,211,77,0.6)" : lit ? "rgba(255,243,176,0.45)" : undefined}
            opacity={intro}
            z={p > 0.01 && p < 0.99 ? 3 : 1}
          />
        );
      })}
    </AbsoluteFill>
  );
};
