import React from "react";
import { AbsoluteFill, Audio, interpolate, interpolateColors, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ARRAY, colors, font, WIDTH } from "../theme";

// Narration is 9.56s -> ceil(9.56*30) + 30 padding
export const DURATION = 317;

const SIZE = 64; // shrunk from BOX so 4 levels + 7 singles fit comfortably
const INNER = 8; // gap between boxes inside a group
const GROUP_GAP = [0, 90, 56, 36]; // gap between groups per level
const ROW_Y = [90, 215, 340, 465]; // top of each row
const LEVEL_START = [0, 25, 85, 140]; // frame each level splits (timed to narration)
const SORTED_AT = 215; // "A single number is already sorted"
const CUT_LEAD = 14; // frames the dashed cut line shows before each split

type Group = { start: number; end: number; side: "root" | "left" | "right" }; // end exclusive

// Split convention: left gets ceil(n/2)
const buildLevels = (): Group[][] => {
  const levels: Group[][] = [[{ start: 0, end: ARRAY.length, side: "root" }]];
  for (let l = 1; l < 4; l++) {
    const next: Group[] = [];
    for (const g of levels[l - 1]) {
      const n = g.end - g.start;
      if (n === 1) {
        next.push({ ...g });
        continue;
      }
      const mid = g.start + Math.ceil(n / 2);
      next.push({ start: g.start, end: mid, side: "left" });
      next.push({ start: mid, end: g.end, side: "right" });
    }
    levels.push(next);
  }
  return levels;
};

const LEVELS = buildLevels();

// x of every item in every level
const layout = (groups: Group[], gap: number): number[] => {
  const n = ARRAY.length;
  const total = n * SIZE + (n - groups.length) * INNER + (groups.length - 1) * gap;
  const xs: number[] = new Array(n);
  let x = (WIDTH - total) / 2;
  groups.forEach((g, gi) => {
    if (gi > 0) x += gap;
    for (let i = g.start; i < g.end; i++) {
      xs[i] = x;
      x += SIZE + (i < g.end - 1 ? INNER : 0);
    }
  });
  return xs;
};

const XS = LEVELS.map((groups, l) => layout(groups, GROUP_GAP[l]));

// x of each cut in the parent row for level l (between the two boxes where it splits)
const cutXs = (l: number): number[] =>
  LEVELS[l - 1]
    .filter((g) => g.end - g.start > 1)
    .map((g) => {
      const mid = g.start + Math.ceil((g.end - g.start) / 2);
      return (XS[l - 1][mid - 1] + SIZE + XS[l - 1][mid]) / 2;
    });

const sideOf = (l: number, i: number) => LEVELS[l].find((g) => i >= g.start && i < g.end)!.side;
const sideColor = (side: Group["side"]) => (side === "left" ? colors.left : side === "right" ? colors.right : colors.boxBorder);

const CAPTIONS: { from: number; text: string }[] = [
  { from: 0, text: "Split the list in half" },
  { from: 70, text: "Split each half again" },
  { from: 130, text: "…until every piece holds one number" },
  { from: SORTED_AT, text: "A single number is already sorted" },
];

export const Scene2_Divide: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = LEVEL_START.map((s, l) => (l === 0 ? spring({ frame, fps, config: { damping: 14 } }) : spring({ frame: frame - s, fps, config: { damping: 15 } })));
  const sortedGlow = interpolate(frame, [SORTED_AT, SORTED_AT + 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const caption = [...CAPTIONS].reverse().find((c) => frame >= c.from)!;
  const captionFade = interpolate(frame - caption.from, [0, 12], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: colors.bg, fontFamily: font, color: colors.text }}>
      <Audio src={staticFile("audio/scene2.wav")} />

      <div style={{ position: "absolute", top: 24, width: "100%", textAlign: "center", fontSize: 40, fontWeight: 700 }}>Divide</div>

      {/* connector lines from parent group to child group */}
      <svg width={WIDTH} height={720} style={{ position: "absolute", left: 0, top: 0 }}>
        {LEVELS.slice(1).map((groups, k) => {
          const l = k + 1;
          return groups.map((g, gi) => {
            const parent = LEVELS[l - 1].find((p) => g.start >= p.start && g.end <= p.end)!;
            const px = (XS[l - 1][parent.start] + XS[l - 1][parent.end - 1] + SIZE) / 2;
            const cx = (XS[l][g.start] + XS[l][g.end - 1] + SIZE) / 2;
            const y1 = ROW_Y[l - 1] + SIZE + 4;
            const y2 = ROW_Y[l] - 6;
            const p = progress[l];
            return (
              <line
                key={`${l}-${gi}`}
                x1={px}
                y1={y1}
                x2={px + (cx - px) * p}
                y2={y1 + (y2 - y1) * p}
                stroke={colors.muted}
                strokeWidth={2}
                opacity={0.6 * Math.min(1, p)}
              />
            );
          });
        })}
      </svg>

      {LEVELS.map((_, l) =>
        ARRAY.map((v, i) => {
          const p = progress[l];
          if (frame < LEVEL_START[l]) return null;
          const fromX = l === 0 ? XS[0][i] : XS[l - 1][i];
          const fromY = l === 0 ? ROW_Y[0] - 30 : ROW_Y[l - 1];
          const x = fromX + (XS[l][i] - fromX) * p;
          const y = fromY + (ROW_Y[l] - fromY) * p;
          const base = sideColor(sideOf(l, i));
          const isLeaf = l === 3;
          const border = isLeaf ? interpolateColors(sortedGlow, [0, 1], [base, colors.sorted]) : base;
          return (
            <div
              key={`${l}-${i}`}
              style={{
                position: "absolute",
                left: x,
                top: y,
                width: SIZE,
                height: SIZE,
                borderRadius: 12,
                background: colors.box,
                border: `3px solid ${border}`,
                boxSizing: "border-box",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
                fontWeight: 700,
                opacity: Math.min(1, p * 1.5),
                boxShadow: isLeaf && sortedGlow > 0 ? `0 0 ${18 * sortedGlow}px ${colors.sorted}` : "none",
              }}
            >
              {v}
            </div>
          );
        })
      )}

      {/* dashed cut lines: appear just before each split, fade as halves slide apart */}
      <svg width={WIDTH} height={720} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
        {[1, 2, 3].map((l) => {
          const s = LEVEL_START[l];
          const op = interpolate(frame, [s - CUT_LEAD, s - CUT_LEAD + 5, s, s + 10], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          if (op <= 0) return null;
          const grow = interpolate(frame, [s - CUT_LEAD, s - CUT_LEAD + 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const rowTop = l === 1 ? ROW_Y[0] - 30 + 30 * progress[0] : ROW_Y[l - 1];
          const top = rowTop - 12;
          const len = (SIZE + 24) * grow;
          return cutXs(l).map((x, ci) => (
            <line
              key={`cut-${l}-${ci}`}
              x1={x}
              y1={top}
              x2={x}
              y2={top + len}
              stroke={colors.accent}
              strokeWidth={3}
              strokeDasharray="8 6"
              strokeLinecap="round"
              opacity={op}
              style={{ filter: `drop-shadow(0 0 4px ${colors.accent})` }}
            />
          ));
        })}
      </svg>

      <div
        style={{
          position: "absolute",
          top: 600,
          width: "100%",
          textAlign: "center",
          fontSize: 34,
          color: caption.from === SORTED_AT ? colors.sorted : colors.muted,
          opacity: captionFade,
        }}
      >
        {caption.text}
      </div>
    </AbsoluteFill>
  );
};
