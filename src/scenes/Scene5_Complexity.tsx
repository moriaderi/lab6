import React from "react";
import { AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, font } from "../theme";

// Narration is 11.09s -> ceil(11.09*30) + 30
export const DURATION = 363;

const N = 8;
const CELL = 46;
const INNER = 4;
const GROUP_GAP = 22;
const ROW_Y = [130, 210, 290, 370];
const CENTER_X = 600;
const ROW_START = [45, 65, 85, 105]; // "Halving the list gives about log n levels"
const BRACE_START = 115;
const N_LABEL_START = [150, 162, 174, 186]; // "merging each level touches all n numbers"
const FORMULA_START = 235; // "So merge sort takes n log n time"
const WORST_START = 290; // "even in the worst case"

const rowWidth = (groups: number) => N * (CELL + INNER) - INNER + (groups - 1) * GROUP_GAP;
const DIAGRAM_LEFT = CENTER_X - rowWidth(N) / 2;
const DIAGRAM_RIGHT = CENTER_X + rowWidth(N) / 2;

const Row: React.FC<{ level: number }> = ({ level }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const groups = 2 ** level;
  const per = N / groups;
  const left = CENTER_X - rowWidth(groups) / 2;
  const appear = spring({ frame: frame - ROW_START[level], fps, config: { damping: 14 } });
  // Brief cyan pulse when this row's "n" label lands
  const pulse = interpolate(frame, [N_LABEL_START[level], N_LABEL_START[level] + 8, N_LABEL_START[level] + 20], [0, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <>
      {Array.from({ length: N }).map((_, i) => {
        const g = Math.floor(i / per);
        const x = left + i * (CELL + INNER) + g * GROUP_GAP;
        const base = level === 0 ? colors.box : g % 2 === 0 ? colors.left : colors.right;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: ROW_Y[level] + (1 - appear) * -30,
              width: CELL,
              height: CELL,
              borderRadius: 10,
              background: level === 0 ? colors.box : `${base}33`,
              border: `3px solid ${pulse > 0.05 ? colors.accent : level === 0 ? colors.boxBorder : base}`,
              boxShadow: pulse > 0.05 ? `0 0 ${18 * pulse}px ${colors.accent}` : "none",
              boxSizing: "border-box",
              opacity: appear,
            }}
          />
        );
      })}
    </>
  );
};

const Brace: React.FC = () => {
  const frame = useCurrentFrame();
  const draw = interpolate(frame, [BRACE_START, BRACE_START + 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const top = ROW_Y[0];
  const bottom = ROW_Y[3] + CELL;
  const x = DIAGRAM_LEFT - 40;
  const mid = (top + bottom) / 2;
  const len = (bottom - top) * 2;
  const path = `M ${x + 14} ${top} Q ${x} ${top} ${x} ${top + 16} L ${x} ${mid - 14} Q ${x} ${mid} ${x - 14} ${mid} Q ${x} ${mid} ${x} ${mid + 14} L ${x} ${bottom - 16} Q ${x} ${bottom} ${x + 14} ${bottom}`;
  return (
    <>
      <svg width={1280} height={720} style={{ position: "absolute", left: 0, top: 0 }}>
        <path d={path} fill="none" stroke={colors.accent} strokeWidth={4} strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - draw)} />
      </svg>
      <div
        style={{
          position: "absolute",
          left: x - 220,
          width: 190,
          top: mid - 26,
          textAlign: "right",
          color: colors.accent,
          fontSize: 34,
          fontWeight: 700,
          opacity: draw,
        }}
      >
        log n levels
      </div>
    </>
  );
};

const WorkLabel: React.FC<{ level: number }> = ({ level }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - N_LABEL_START[level], fps, config: { damping: 12 } });
  return (
    <div
      style={{
        position: "absolute",
        left: DIAGRAM_RIGHT + 40,
        top: ROW_Y[level] + CELL / 2 - 22,
        fontSize: 30,
        color: colors.text,
        opacity: s,
        transform: `translateX(${(1 - s) * 30}px)`,
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ color: colors.accent, fontWeight: 700, fontStyle: "italic" }}>n</span>
      <span style={{ color: colors.muted, fontSize: 22 }}> work</span>
    </div>
  );
};

export const Scene5_Complexity: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const titleIn = spring({ frame, fps, config: { damping: 14 } });
  const formula = spring({ frame: frame - FORMULA_START, fps, config: { damping: 10 } });
  const worst = interpolate(frame, [WORST_START, WORST_START + 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const product = interpolate(frame, [FORMULA_START - 15, FORMULA_START], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: colors.bg, color: colors.text, fontFamily: font }}>
      <Audio src={staticFile("audio/scene5.wav")} />

      <div
        style={{
          position: "absolute",
          top: 36,
          width: "100%",
          textAlign: "center",
          fontSize: 48,
          fontWeight: 700,
          opacity: titleIn,
          transform: `translateY(${(1 - titleIn) * -20}px)`,
        }}
      >
        How fast is it?
      </div>

      {[0, 1, 2, 3].map((l) => (
        <Row key={l} level={l} />
      ))}
      <Brace />
      {[0, 1, 2, 3].map((l) => (
        <WorkLabel key={l} level={l} />
      ))}

      <div
        style={{
          position: "absolute",
          top: 452,
          width: "100%",
          textAlign: "center",
          fontSize: 28,
          color: colors.muted,
          opacity: product,
        }}
      >
        <span style={{ color: colors.accent, fontStyle: "italic" }}>n</span> work × <span style={{ color: colors.accent }}>log n</span> levels
      </div>

      <div
        style={{
          position: "absolute",
          top: 500,
          width: "100%",
          textAlign: "center",
          fontSize: 104,
          fontWeight: 800,
          color: colors.sorted,
          opacity: Math.min(1, formula),
          transform: `scale(${0.5 + 0.5 * formula})`,
          textShadow: `0 0 30px ${colors.sorted}66`,
        }}
      >
        O(n log n)
      </div>

      <div
        style={{
          position: "absolute",
          top: 640,
          width: "100%",
          textAlign: "center",
          fontSize: 28,
          color: colors.text,
          opacity: worst,
        }}
      >
        …even in the worst case
      </div>
    </AbsoluteFill>
  );
};
