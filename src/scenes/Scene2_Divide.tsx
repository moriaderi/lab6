import React from "react";
import { AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ARRAY, WIDTH } from "../theme";

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

// Blueprint palette (scene-local)
const bp = {
  bg: "#1d4e89",
  line: "#ffffff",
  cyan: "#bde8ff",
  faint: "rgba(255,255,255,0.55)",
  cut: "#ff4d4d",
};
const mono = "Consolas, 'Courier New', monospace";
const GRID =
  "repeating-linear-gradient(0deg, rgba(255,255,255,0.22) 0 1.5px, transparent 1.5px 100px)," +
  "repeating-linear-gradient(90deg, rgba(255,255,255,0.22) 0 1.5px, transparent 1.5px 100px)," +
  "repeating-linear-gradient(0deg, rgba(255,255,255,0.08) 0 1px, transparent 1px 20px)," +
  "repeating-linear-gradient(90deg, rgba(255,255,255,0.08) 0 1px, transparent 1px 20px)";

const CAPTIONS: { from: number; text: string }[] = [
  { from: 0, text: "Split the list in half" },
  { from: 70, text: "Split each half again" },
  { from: 130, text: "…until every piece holds one number" },
  { from: SORTED_AT, text: "A single number is already sorted" },
];

export const Scene2_Divide: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = LEVEL_START.map((s, l) => (l === 0 ? 1 : spring({ frame: frame - s, fps, config: { damping: 15 } })));
  const sortedGlow = interpolate(frame, [SORTED_AT, SORTED_AT + 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const caption = [...CAPTIONS].reverse().find((c) => frame >= c.from)!;
  const captionFade = interpolate(frame - caption.from, [0, 12], [0, 1], { extrapolateRight: "clamp" });

  const LABEL_H = 22; // space reserved above each row for L/R labels / checkmarks

  return (
    <AbsoluteFill style={{ backgroundColor: bp.bg, backgroundImage: GRID, fontFamily: mono, color: bp.line }}>
      <Audio src={staticFile("audio/scene2.wav")} />

      {/* drawing border */}
      <div style={{ position: "absolute", inset: 14, border: `2px solid ${bp.faint}` }} />

      {/* title */}
      <div style={{ position: "absolute", top: 34, left: 44 }}>
        <span style={{ fontSize: 34, fontWeight: 700, letterSpacing: 12, borderBottom: `2px solid ${bp.line}` }}>DIVIDE</span>
        <div style={{ fontSize: 13, letterSpacing: 4, color: bp.cyan, marginTop: 6 }}>FIG. 2 — RECURSIVE SPLIT</div>
      </div>

      {/* connector lines from parent group to child group */}
      <svg width={WIDTH} height={720} style={{ position: "absolute", left: 0, top: 0 }}>
        {LEVELS.slice(1).map((groups, k) => {
          const l = k + 1;
          return groups.map((g, gi) => {
            const parent = LEVELS[l - 1].find((p) => g.start >= p.start && g.end <= p.end)!;
            const px = (XS[l - 1][parent.start] + XS[l - 1][parent.end - 1] + SIZE) / 2;
            const cx = (XS[l][g.start] + XS[l][g.end - 1] + SIZE) / 2;
            const y1 = ROW_Y[l - 1] + SIZE + 3;
            const y2 = ROW_Y[l] - (l === 3 ? 34 : LABEL_H + 4);
            const p = progress[l];
            if (frame < LEVEL_START[l]) return null;
            return (
              <g key={`${l}-${gi}`} opacity={Math.min(1, p)}>
                <line x1={px} y1={y1} x2={px + (cx - px) * p} y2={y1 + (y2 - y1) * p} stroke={bp.cyan} strokeWidth={1.5} />
                <circle cx={px} cy={y1} r={2.5} fill={bp.cyan} />
              </g>
            );
          });
        })}
      </svg>

      {/* L / R labels above groups, checkmarks above leaves */}
      {LEVELS.map((groups, l) =>
        groups.map((g, gi) => {
          if (l === 0 || frame < LEVEL_START[l]) return null;
          const p = progress[l];
          const left = XS[l][g.start];
          const w = XS[l][g.end - 1] + SIZE - left;
          const isLeaf = l === 3;
          const labelOp = Math.min(1, p) * (isLeaf ? 1 - sortedGlow : 1);
          const label = g.side === "left" ? "L" : "R";
          return (
            <React.Fragment key={`lbl-${l}-${gi}`}>
              <div
                style={{
                  position: "absolute",
                  left,
                  width: w,
                  top: ROW_Y[l] - LABEL_H,
                  height: LABEL_H - 4,
                  borderTop: `1px solid ${bp.faint}`,
                  borderLeft: `1px solid ${bp.faint}`,
                  borderRight: `1px solid ${bp.faint}`,
                  boxSizing: "border-box",
                  opacity: labelOp,
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: -11,
                    transform: "translateX(-50%)",
                    background: bp.bg,
                    padding: "0 5px",
                    fontSize: 15,
                    fontWeight: 700,
                    color: bp.cyan,
                    lineHeight: "20px",
                  }}
                >
                  {label}
                </span>
              </div>
              {isLeaf && (
                <div
                  style={{
                    position: "absolute",
                    left,
                    width: w,
                    top: ROW_Y[l] - 30,
                    lineHeight: "26px",
                    textAlign: "center",
                    fontSize: 22,
                    fontWeight: 700,
                    color: bp.line,
                    opacity: sortedGlow,
                    transform: `scale(${0.6 + 0.4 * sortedGlow})`,
                  }}
                >
                  ✓
                </div>
              )}
            </React.Fragment>
          );
        })
      )}

      {LEVELS.map((_, l) =>
        ARRAY.map((v, i) => {
          const p = progress[l];
          if (frame < LEVEL_START[l]) return null;
          const fromX = l === 0 ? XS[0][i] : XS[l - 1][i];
          const fromY = l === 0 ? ROW_Y[0] - 30 : ROW_Y[l - 1];
          const x = fromX + (XS[l][i] - fromX) * p;
          const y = fromY + (ROW_Y[l] - fromY) * p;
          const isLeaf = l === 3;
          return (
            <div
              key={`${l}-${i}`}
              style={{
                position: "absolute",
                left: x,
                top: y,
                width: SIZE,
                height: SIZE,
                border: `2px solid ${bp.line}`,
                boxSizing: "border-box",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 26,
                fontWeight: 700,
                opacity: Math.min(1, p * 1.5),
                outline: isLeaf && sortedGlow > 0 ? `1px dashed rgba(189,232,255,${sortedGlow})` : "none",
                outlineOffset: 4,
              }}
            >
              {v}
              <span style={{ position: "absolute", left: 3, top: 1, fontSize: 9, color: bp.cyan, fontWeight: 400 }}>{i}</span>
            </div>
          );
        })
      )}

      {/* red dashed "cut here" lines: appear just before each split, fade as halves slide apart */}
      <svg width={WIDTH} height={720} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
        {[1, 2, 3].map((l) => {
          const s = LEVEL_START[l];
          const op = interpolate(frame, [s - CUT_LEAD, s - CUT_LEAD + 5, s, s + 10], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          if (op <= 0) return null;
          const grow = interpolate(frame, [s - CUT_LEAD, s - CUT_LEAD + 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const rowTop = l === 1 ? ROW_Y[0] - 30 + 30 * progress[0] : ROW_Y[l - 1];
          const top = rowTop - 10;
          const len = (SIZE + 20) * grow;
          return cutXs(l).map((x, ci) => (
            <g key={`cut-${l}-${ci}`} opacity={op}>
              <line x1={x} y1={top} x2={x} y2={top + len} stroke={bp.cut} strokeWidth={2.5} strokeDasharray="7 5" />
              <text x={x} y={top + len + 4} fontSize={20} fill={bp.cut} textAnchor="middle" dominantBaseline="hanging" transform={`rotate(90 ${x} ${top + len + 14})`}>
                ✂
              </text>
            </g>
          ));
        })}
      </svg>

      {/* caption as a drawing note */}
      <div
        style={{
          position: "absolute",
          top: 588,
          width: "100%",
          textAlign: "center",
          fontSize: 26,
          letterSpacing: 1,
          color: caption.from === SORTED_AT ? bp.line : bp.cyan,
          opacity: captionFade,
        }}
      >
        NOTE: {caption.text.toUpperCase()}
      </div>

      {/* title block */}
      <div
        style={{
          position: "absolute",
          right: 14,
          bottom: 14,
          width: 260,
          border: `2px solid ${bp.line}`,
          fontSize: 13,
          letterSpacing: 2,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
        }}
      >
        <div style={{ gridColumn: "1 / 3", padding: "6px 10px", borderBottom: `1px solid ${bp.line}`, fontWeight: 700, fontSize: 15 }}>MERGE SORT</div>
        <div style={{ padding: "5px 10px", borderRight: `1px solid ${bp.line}` }}>SHEET 2/6</div>
        <div style={{ padding: "5px 10px" }}>DIVIDE</div>
      </div>
    </AbsoluteFill>
  );
};
