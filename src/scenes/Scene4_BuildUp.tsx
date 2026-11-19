import React from "react";
import {
  AbsoluteFill,
  Audio,
  interpolate,
  interpolateColors,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ARRAY, WIDTH } from "../theme";

// Narration is 8.17s -> ceil(8.17*30) + 30
export const DURATION = 276;

// "Bright bar chart on white paper" palette (local to this scene)
const PAPER = "#fafaf7";
const INK = "#2f3437";
const INK_SOFT = "#8a9095";
const GRID = "#ecebe4";
const CORAL = "#ff6b6b";
const SUN = "#ffd93d";
const TEAL = "#4ecdc4";
const INDIGO = "#5f6caf";
const PALETTE = [CORAL, SUN, TEAL, INDIGO];
const FONT = "'Segoe UI', 'Helvetica Neue', Arial, sans-serif";

const BAR_W = 76;
const INNER = 8; // gap between bars inside a group
const GROUP_GAP = 46; // gap between groups
const BASELINE = 600; // y of the shared baseline
const MAX_H = 380;
const MAX_V = Math.max(...ARRAY);
const barH = (v: number) => Math.max(14, (v / MAX_V) * MAX_H);

const STAGES: number[][][] = [
  ARRAY.map((v) => [v]),
  [[27, 38], [3, 43], [9, 82], [10]],
  [[3, 27, 38, 43], [9, 10, 82]],
  [[3, 9, 10, 27, 38, 43, 82]],
];
const STAGE_START = [0, 75, 135, 185]; // matched to narration
const STAGE_LABEL = ["singles", "pairs", "halves", "sorted!"];
const LAST = STAGES.length - 1;
const SORTED = [...ARRAY].sort((a, b) => a - b);

const groupWidth = (g: number[]) => g.length * BAR_W + (g.length - 1) * INNER;

type Layout = { x: Map<number, number>; color: Map<number, string>; groups: { x: number; w: number; color: string }[] };

const layoutStage = (stage: number): Layout => {
  const row = STAGES[stage];
  const total = row.reduce((a, g) => a + groupWidth(g), 0) + (row.length - 1) * GROUP_GAP;
  let x = (WIDTH - total) / 2;
  const xs = new Map<number, number>();
  const cs = new Map<number, string>();
  const groups: Layout["groups"] = [];
  row.forEach((g, gi) => {
    const gColor = stage === LAST ? TEAL : PALETTE[gi % PALETTE.length];
    groups.push({ x, w: groupWidth(g), color: gColor });
    g.forEach((v) => {
      xs.set(v, x);
      cs.set(
        v,
        stage === LAST ? interpolateColors(SORTED.indexOf(v), [0, SORTED.length - 1], [TEAL, INDIGO]) : gColor
      );
      x += BAR_W + INNER;
    });
    x += GROUP_GAP - INNER;
  });
  return { x: xs, color: cs, groups };
};

const LAYOUTS = STAGES.map((_, i) => layoutStage(i));

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const Scene4_BuildUp: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // spring progress for each stage transition (stage 0 has none)
  const prog = STAGE_START.map((s, i) =>
    i === 0 ? 1 : spring({ frame: frame - s, fps, config: { damping: 13, stiffness: 110, mass: 0.8 } })
  );
  const stageNow = STAGE_START.reduce((acc, s, i) => (frame >= s ? i : acc), 0);

  // ---- bars ----
  const bars = ARRAY.map((v, idx) => {
    let x = LAYOUTS[0].x.get(v)!;
    let color = LAYOUTS[0].color.get(v)!;
    for (let s = 1; s <= LAST; s++) {
      const p = prog[s];
      x += (LAYOUTS[s].x.get(v)! - LAYOUTS[s - 1].x.get(v)!) * p;
      color = interpolateColors(Math.min(1, Math.max(0, p)), [0, 1], [color, LAYOUTS[s].color.get(v)!]);
    }
    // intro: bars grow up from the baseline, staggered
    const grow = spring({ frame: frame - idx * 4, fps, config: { damping: 15, stiffness: 120 } });
    // final celebration: a little hop in staircase order
    const k = SORTED.indexOf(v);
    const hop = interpolate(frame, [STAGE_START[LAST] + 28 + k * 3, STAGE_START[LAST] + 36 + k * 3, STAGE_START[LAST] + 46 + k * 3], [0, -16, 0], clamp);
    const h = barH(v) * grow;
    return (
      <div key={v} style={{ position: "absolute", left: x, top: BASELINE - h + hop, width: BAR_W, height: h }}>
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: "100%",
            marginBottom: 8,
            textAlign: "center",
            fontSize: 30,
            fontWeight: 800,
            color: INK,
            opacity: interpolate(grow, [0.6, 1], [0, 1], clamp),
          }}
        >
          {v}
        </div>
        <div
          style={{
            width: "100%",
            height: "100%",
            background: color,
            borderRadius: "10px 10px 3px 3px",
            boxShadow: "0 4px 0 rgba(0,0,0,0.08)",
          }}
        />
      </div>
    );
  });

  // ---- brackets under each group (current stage only, cross-fading) ----
  const brackets = LAYOUTS.slice(0, LAST).flatMap((L, s) => {
    const inAt = STAGE_START[s] + (s === 0 ? 20 : 14);
    const outAt = STAGE_START[s + 1];
    const op =
      outAt === undefined
        ? interpolate(frame, [inAt, inAt + 12], [0, 1], clamp)
        : interpolate(frame, [inAt, inAt + 12, outAt, outAt + 6], [0, 1, 1, 0], clamp);
    if (op <= 0) return [];
    const draw = interpolate(frame, [inAt, inAt + 10], [0.2, 1], clamp);
    return L.groups.map((g, gi) => (
      <div
        key={`br-${s}-${gi}`}
        style={{
          position: "absolute",
          left: g.x - 6 + ((g.w + 12) * (1 - draw)) / 2,
          top: BASELINE + 14,
          width: (g.w + 12) * draw,
          height: 18,
          borderBottom: `5px solid ${g.color}`,
          borderLeft: `5px solid ${g.color}`,
          borderRight: `5px solid ${g.color}`,
          borderRadius: "0 0 14px 14px",
          boxSizing: "border-box",
          opacity: op * 0.85,
        }}
      />
    ));
  });
  // final staircase: one gradient bracket (SVG so the stroke can be a teal->indigo gradient)
  const fAt = STAGE_START[LAST] + 14;
  const finalOp = interpolate(frame, [fAt, fAt + 12], [0, 1], clamp);
  const fDraw = interpolate(frame, [fAt, fAt + 12], [0, 1], clamp);
  const fg = LAYOUTS[LAST].groups[0];
  const fx0 = fg.x - 4;
  const fx1 = fg.x + fg.w + 4;
  const fy0 = BASELINE + 16;
  const fy1 = BASELINE + 30;
  const bracketPath = `M ${fx0} ${fy0} L ${fx0} ${fy1 - 12} Q ${fx0} ${fy1} ${fx0 + 12} ${fy1} L ${fx1 - 12} ${fy1} Q ${fx1} ${fy1} ${fx1} ${fy1 - 12} L ${fx1} ${fy0}`;
  const finalLine = (
    <svg width={WIDTH} height={720} style={{ position: "absolute", left: 0, top: 0, opacity: finalOp * 0.9 }}>
      <defs>
        <linearGradient id="s4grad" x1={fx0} x2={fx1} y1={0} y2={0} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={TEAL} />
          <stop offset="1" stopColor={INDIGO} />
        </linearGradient>
      </defs>
      <path d={bracketPath} fill="none" stroke="url(#s4grad)" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - fDraw} />
    </svg>
  );

  // ---- stage label (top-left), pops on each change ----
  const labelPop = spring({ frame: frame - STAGE_START[stageNow], fps, config: { damping: 11, stiffness: 160 } });
  const label = (
    <div
      style={{
        position: "absolute",
        left: 64,
        top: 44,
        fontSize: 76,
        fontWeight: 800,
        letterSpacing: -1,
        color: stageNow === LAST ? INDIGO : INK,
        transform: `translateY(${(1 - labelPop) * 18}px)`,
        opacity: labelPop,
      }}
    >
      {STAGE_LABEL[stageNow]}
    </div>
  );

  // step dots under the label
  const dots = (
    <div style={{ position: "absolute", left: 68, top: 146, display: "flex", gap: 10 }}>
      {STAGES.map((_, i) => (
        <div
          key={i}
          style={{
            width: i === stageNow ? 34 : 12,
            height: 12,
            borderRadius: 6,
            background: i <= stageNow ? (i === LAST ? INDIGO : PALETTE[i]) : GRID,
          }}
        />
      ))}
    </div>
  );

  const fadeIn = interpolate(frame, [0, 12], [0, 1], clamp);

  return (
    <AbsoluteFill style={{ background: PAPER, fontFamily: FONT, color: INK }}>
      <Audio src={staticFile("audio/scene4.wav")} />
      {/* faint horizontal ruling, like chart paper */}
      <svg width={WIDTH} height={720} style={{ position: "absolute", left: 0, top: 0 }}>
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <line key={f} x1={180} x2={WIDTH - 180} y1={BASELINE - MAX_H * f} y2={BASELINE - MAX_H * f} stroke={GRID} strokeWidth={2} />
        ))}
      </svg>
      <div style={{ position: "absolute", right: 64, top: 64, fontSize: 24, fontWeight: 600, color: INK_SOFT, opacity: fadeIn }}>
        merging back up, level by level
      </div>
      {label}
      {dots}
      {/* baseline */}
      <div style={{ position: "absolute", left: 160, width: WIDTH - 320, top: BASELINE, height: 4, borderRadius: 2, background: INK, opacity: 0.85 * fadeIn }} />
      {brackets}
      {finalLine}
      {bars}
    </AbsoluteFill>
  );
};
