import React from "react";
import { AbsoluteFill, Audio, Easing, interpolate, staticFile, useCurrentFrame } from "remotion";
import { ARRAY, colors, font, WIDTH } from "../theme";

// Narration is 8.17s -> ceil(8.17*30) + 30
export const DURATION = 276;

const S = 64; // box size (smaller than BOX so 4 rows fit comfortably)
const INNER = 8; // gap between boxes inside a group
const GROUP_GAP = 40; // gap between groups

// Rows from bottom (singles) to top (fully sorted). Same split as the divide scene (left = ceil(n/2)).
const ROWS: number[][][] = [
  ARRAY.map((v) => [v]),
  [[27, 38], [3, 43], [9, 82], [10]],
  [[3, 27, 38, 43], [9, 10, 82]],
  [[3, 9, 10, 27, 38, 43, 82]],
];
const ROW_Y = [560, 410, 260, 110]; // top of each row (bottom -> top)
const ROW_START = [0, 75, 135, 185]; // frame each row starts forming, matched to narration
const ROW_LABEL = ["singles", "pairs", "fours", "sorted!"];
const FLY = 24; // frames for a box to rise into place
const STAGGER = 4;

type Pos = { x: number; y: number };

// x position (left edge) of every value in a row, keyed by value
const layoutRow = (row: number[][], y: number): Map<number, Pos> => {
  const total =
    row.reduce((acc, g) => acc + g.length * S + (g.length - 1) * INNER, 0) + (row.length - 1) * GROUP_GAP;
  let x = (WIDTH - total) / 2;
  const map = new Map<number, Pos>();
  row.forEach((g) => {
    g.forEach((v) => {
      map.set(v, { x, y });
      x += S + INNER;
    });
    x += GROUP_GAP - INNER;
  });
  return map;
};

const LAYOUTS = ROWS.map((r, i) => layoutRow(r, ROW_Y[i]));

const groupColor = (level: number, gi: number, value: number) => {
  if (level === ROWS.length - 1) return colors.sorted;
  if (level === 0) return ARRAY.indexOf(value) < Math.ceil(ARRAY.length / 2) ? colors.left : colors.right;
  return gi % 2 === 0 ? colors.left : colors.right;
};

const Box: React.FC<{ value: number; x: number; y: number; color: string; opacity: number; glow?: number }> = ({
  value,
  x,
  y,
  color,
  opacity,
  glow = 0,
}) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: S,
      height: S,
      borderRadius: 12,
      background: colors.box,
      border: `3px solid ${color}`,
      boxSizing: "border-box",
      color: colors.text,
      fontSize: 28,
      fontWeight: 700,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      opacity,
      boxShadow: glow > 0 ? `0 0 ${24 * glow}px ${color}` : undefined,
    }}
  >
    {value}
  </div>
);

export const Scene4_BuildUp: React.FC = () => {
  const frame = useCurrentFrame();

  const boxes: React.ReactNode[] = [];
  const brackets: React.ReactNode[] = [];

  ROWS.forEach((row, level) => {
    const start = ROW_START[level];
    const next = ROW_START[level + 1];
    // older rows dim once the next row starts building
    const dim = next === undefined ? 1 : interpolate(frame, [next, next + 20], [1, 0.35], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const isTop = level === ROWS.length - 1;
    const glow = isTop ? interpolate(frame, [start + 40, start + 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;

    let k = 0; // stagger index across the row, in sorted (output) order
    row.forEach((g, gi) => {
      g.forEach((v) => {
        const target = LAYOUTS[level].get(v)!;
        const color = groupColor(level, gi, v);
        if (level === 0) {
          const t = interpolate(frame, [k * 3, k * 3 + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          boxes.push(<Box key={`${level}-${v}`} value={v} x={target.x} y={target.y + (1 - t) * 20} color={color} opacity={t * dim} />);
        } else {
          const from = LAYOUTS[level - 1].get(v)!;
          const s = start + k * STAGGER;
          const t = interpolate(frame, [s, s + FLY], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.inOut(Easing.cubic),
          });
          if (frame >= s) {
            boxes.push(
              <Box
                key={`${level}-${v}`}
                value={v}
                x={from.x + (target.x - from.x) * t}
                y={from.y + (target.y - from.y) * t}
                color={t < 1 ? colors.accent : color}
                opacity={dim}
                glow={glow}
              />
            );
          }
        }
        k++;
      });

      // underline bracket for each group once it has formed
      if (level > 0) {
        const first = LAYOUTS[level].get(g[0])!;
        const w = g.length * S + (g.length - 1) * INNER;
        const doneAt = start + (row.slice(0, gi + 1).reduce((a, gg) => a + gg.length, 0) - 1) * STAGGER + FLY;
        const op = interpolate(frame, [doneAt, doneAt + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        brackets.push(
          <div
            key={`br-${level}-${gi}`}
            style={{
              position: "absolute",
              left: first.x - 6,
              top: first.y - 6,
              width: w + 12,
              height: S + 12,
              borderRadius: 16,
              border: `2px solid ${groupColor(level, gi, g[0])}`,
              opacity: op * 0.5 * dim,
            }}
          />
        );
      }
    });
  });

  const labels = ROWS.map((_, level) => {
    const start = ROW_START[level];
    const op = interpolate(frame, [start + 10, start + 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const isTop = level === ROWS.length - 1;
    return (
      <div
        key={`lbl-${level}`}
        style={{
          position: "absolute",
          left: 40,
          top: ROW_Y[level] + S / 2 - 16,
          fontSize: 24,
          fontWeight: 600,
          color: isTop ? colors.sorted : colors.muted,
          opacity: op,
        }}
      >
        {ROW_LABEL[level]}
      </div>
    );
  });

  const titleOp = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: colors.bg, color: colors.text, fontFamily: font }}>
      <Audio src={staticFile("audio/scene4.wav")} />
      <div style={{ position: "absolute", top: 24, width: "100%", textAlign: "center", fontSize: 36, fontWeight: 700, opacity: titleOp }}>
        Merge back up, level by level
      </div>
      {brackets}
      {labels}
      {boxes}
    </AbsoluteFill>
  );
};
