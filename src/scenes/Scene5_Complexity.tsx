import React from "react";
import { AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame } from "remotion";

// Narration is 11.09s -> ceil(11.09*30) + 30
export const DURATION = 363;

// ---- "Teacher's chalkboard" palette (local to this scene) ----
const chalk = {
  board: "#2b4a3a",
  boardDark: "#213a2d",
  boardLight: "#365946",
  white: "#f2f2e9",
  yellow: "#f7e48b",
  pink: "#f4a6b8",
  blue: "#a8d8f0",
  dim: "#c9cfc2",
  wood: "#7a4b2a",
  woodDark: "#4e2e17",
  woodLight: "#a06a3e",
};
const chalkFont = "'Comic Sans MS', 'Segoe Print', cursive";
const FRAME = 24;

// Layout & timing (unchanged beats)
const N = 8;
const CELL = 44;
const INNER = 9;
const GROUP_GAP = 22;
const ROW_Y = [130, 210, 290, 370];
const CENTER_X = 640;
const ROW_START = [45, 65, 85, 105]; // "Halving the list gives about log n levels"
const BRACE_START = 115;
// "merging each level touches all n numbers": 3 merge levels, bottom-up.
const MERGE_START = [174, 162, 150];
const gapMid = (g: number) => (ROW_Y[g] + CELL + ROW_Y[g + 1]) / 2;
const FORMULA_START = 235; // "So merge sort takes n log n time"
const WORST_START = 290; // "even in the worst case"

const rowWidth = (groups: number) => N * (CELL + INNER) - INNER + (groups - 1) * GROUP_GAP;
const DIAGRAM_LEFT = CENTER_X - rowWidth(N) / 2;
const DIAGRAM_RIGHT = CENTER_X + rowWidth(N) / 2;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Deterministic pseudo-random in [-1, 1]
const rnd = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1;
};

// Hand-drawn rectangle: jittered corners, bowed sides, overshooting closing stroke
const wobblyRect = (x: number, y: number, w: number, h: number, seed: number) => {
  const j = (k: number, amt = 2.2) => rnd(seed * 13 + k) * amt;
  const p = [
    [x + j(1), y + j(2)],
    [x + w + j(3), y + j(4)],
    [x + w + j(5), y + h + j(6)],
    [x + j(7), y + h + j(8)],
  ];
  const mid = (a: number[], b: number[], k: number) => [
    (a[0] + b[0]) / 2 + j(k, 2.5),
    (a[1] + b[1]) / 2 + j(k + 1, 2.5),
  ];
  const seg = (a: number[], b: number[], k: number) => {
    const m = mid(a, b, k);
    return `Q ${m[0].toFixed(1)} ${m[1].toFixed(1)} ${b[0].toFixed(1)} ${b[1].toFixed(1)}`;
  };
  const end = [p[0][0] + 5 + j(20), p[0][1] + j(21, 1.5)];
  return `M ${p[0][0].toFixed(1)} ${p[0][1].toFixed(1)} ${seg(p[0], p[1], 10)} ${seg(p[1], p[2], 12)} ${seg(
    p[2],
    p[3],
    14,
  )} ${seg(p[3], p[0], 16)} L ${end[0].toFixed(1)} ${end[1].toFixed(1)}`;
};

// Text "written" left-to-right via clip-path
const Written: React.FC<{
  start: number;
  dur: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ start, dur, style, children }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [start, start + dur], [0, 100], clamp);
  return (
    <div style={{ position: "absolute", whiteSpace: "nowrap", opacity: p > 0 ? 1 : 0, ...style }}>
      <span style={{ display: "inline-block", clipPath: `inset(-30px ${100 - p}% -30px -30px)` }}>{children}</span>
    </div>
  );
};

const chalkGlow = (c: string) => `0 0 2px ${c}aa, 0 0 6px ${c}33`;

const Row: React.FC<{ level: number }> = ({ level }) => {
  const frame = useCurrentFrame();
  const groups = 2 ** level;
  const per = N / groups;
  const left = CENTER_X - rowWidth(groups) / 2;
  const ps = level < 3 ? MERGE_START[level] : -1000;
  const pulse = interpolate(frame, [ps, ps + 8, ps + 24], [0, 1, 0], clamp);

  return (
    <>
      {Array.from({ length: N }).map((_, i) => {
        const g = Math.floor(i / per);
        const x = left + i * (CELL + INNER) + g * GROUP_GAP;
        const seed = level * 10 + i + 1;
        const t0 = ROW_START[level] + i * 1.5;
        const draw = interpolate(frame, [t0, t0 + 10], [0, 1], clamp);
        const base = level === 0 ? chalk.white : g % 2 === 0 ? chalk.pink : chalk.blue;
        const stroke = pulse > 0.05 ? chalk.yellow : base;
        const len = 4 * CELL + 20;
        const d = wobblyRect(x, ROW_Y[level], CELL, CELL, seed);
        return (
          <g key={i} transform={`rotate(${rnd(seed * 7) * 1.8} ${x + CELL / 2} ${ROW_Y[level] + CELL / 2})`}>
            {pulse > 0.05 && (
              <path d={d} fill={chalk.yellow} opacity={0.18 * pulse} stroke="none" />
            )}
            <path
              d={d}
              fill="none"
              stroke={stroke}
              strokeWidth={3 + pulse * 1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={len}
              strokeDashoffset={len * (1 - draw)}
              opacity={0.92}
              filter="url(#chalkRough)"
            />
          </g>
        );
      })}
    </>
  );
};

const Brace: React.FC = () => {
  const frame = useCurrentFrame();
  const draw = interpolate(frame, [BRACE_START, BRACE_START + 20], [0, 1], clamp);
  const top = ROW_Y[0] + CELL / 2;
  const bottom = ROW_Y[3] + CELL / 2;
  const x = DIAGRAM_LEFT - 36;
  const mid = (top + bottom) / 2;
  const len = (bottom - top) * 2.2;
  const path = `M ${x + 16} ${top} C ${x + 1} ${top + 2} ${x + 2} ${top + 10} ${x + 1} ${top + 22} L ${x - 1} ${
    mid - 18
  } C ${x - 2} ${mid - 6} ${x - 8} ${mid - 2} ${x - 18} ${mid} C ${x - 8} ${mid + 3} ${x - 1} ${mid + 8} ${x} ${
    mid + 20
  } L ${x + 2} ${bottom - 22} C ${x + 2} ${bottom - 8} ${x + 4} ${bottom - 1} ${x + 17} ${bottom + 1}`;
  return (
    <>
      <path
        d={path}
        fill="none"
        stroke={chalk.yellow}
        strokeWidth={4}
        strokeLinecap="round"
        strokeDasharray={len}
        strokeDashoffset={len * (1 - draw)}
        filter="url(#chalkRough)"
      />
    </>
  );
};

const BraceLabel: React.FC = () => {
  const x = DIAGRAM_LEFT - 36;
  const mid = (ROW_Y[0] + ROW_Y[3] + CELL) / 2;
  return (
    <div style={{ position: "absolute", left: x - 300, width: 270, top: mid - 36, transform: "rotate(-3deg)" }}>
      <Written
        start={BRACE_START + 6}
        dur={20}
        style={{ right: 0, left: 0, textAlign: "right", top: 0, fontSize: 28, fontWeight: 700, color: chalk.yellow, textShadow: chalkGlow(chalk.yellow) }}
      >
        log₂ 8 = 3 levels
      </Written>
      <Written
        start={BRACE_START + 24}
        dur={10}
        style={{ right: 0, left: 0, textAlign: "right", top: 38, fontSize: 24, color: chalk.dim, textShadow: chalkGlow(chalk.white) }}
      >
        (log n)
      </Written>
    </div>
  );
};

const WorkLabel: React.FC<{ gap: number }> = ({ gap }) => {
  const rot = rnd(gap + 50) * 2.5;
  return (
    <Written
      start={MERGE_START[gap]}
      dur={14}
      style={{
        left: DIAGRAM_RIGHT + 34,
        top: gapMid(gap) - 20,
        lineHeight: "40px",
        fontSize: 26,
        color: chalk.white,
        textShadow: chalkGlow(chalk.white),
        transform: `rotate(${rot}deg)`,
      }}
    >
      <span style={{ color: chalk.yellow, fontWeight: 700 }}>↑</span>
      <span style={{ color: chalk.dim, fontSize: 22 }}> merge: </span>
      <span style={{ color: chalk.yellow, fontWeight: 700, fontSize: 30, textShadow: chalkGlow(chalk.yellow) }}>n</span>
      <span style={{ color: chalk.dim, fontSize: 22 }}> work</span>
    </Written>
  );
};

const Underlines: React.FC = () => {
  const frame = useCurrentFrame();
  const a = interpolate(frame, [FORMULA_START + 22, FORMULA_START + 32], [0, 1], clamp);
  const b = interpolate(frame, [FORMULA_START + 32, FORMULA_START + 42], [0, 1], clamp);
  const l1 = `M 450 617 Q 640 609 832 614`;
  const l2 = `M 470 631 Q 650 624 816 629`;
  const len = 420;
  return (
    <>
      <path d={l1} fill="none" stroke={chalk.yellow} strokeWidth={5} strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - a)} filter="url(#chalkRough)" />
      <path d={l2} fill="none" stroke={chalk.yellow} strokeWidth={4} strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - b)} filter="url(#chalkRough)" />
    </>
  );
};

const Board: React.FC = () => (
  <>
    {/* chalkboard surface with smudges */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: [
          `radial-gradient(ellipse 380px 220px at 22% 30%, ${chalk.boardLight}99, transparent 70%)`,
          `radial-gradient(ellipse 300px 180px at 78% 62%, rgba(255,255,255,0.05), transparent 70%)`,
          `radial-gradient(ellipse 460px 160px at 55% 85%, ${chalk.boardLight}66, transparent 70%)`,
          `radial-gradient(ellipse 260px 260px at 88% 18%, rgba(255,255,255,0.04), transparent 70%)`,
          `radial-gradient(ellipse 900px 600px at 50% 50%, transparent 55%, ${chalk.boardDark} 100%)`,
          chalk.board,
        ].join(", "),
      }}
    />
    {/* faint eraser streaks */}
    <svg width={1280} height={720} style={{ position: "absolute", left: 0, top: 0 }}>
      <path d="M 160 520 C 400 490 700 540 1100 500" stroke="rgba(255,255,255,0.018)" strokeWidth={60} fill="none" strokeLinecap="round" />
      <path d="M 220 110 C 500 90 800 130 1050 100" stroke="rgba(255,255,255,0.015)" strokeWidth={44} fill="none" strokeLinecap="round" />
    </svg>
    {/* wooden frame */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        border: `${FRAME}px solid ${chalk.wood}`,
        borderImage: `linear-gradient(135deg, ${chalk.woodLight}, ${chalk.wood} 40%, ${chalk.woodDark} 70%, ${chalk.wood}) 1`,
        boxShadow: `inset 0 0 0 2px ${chalk.woodDark}, inset 0 0 24px rgba(0,0,0,0.55)`,
      }}
    />
    {/* chalk tray */}
    <div
      style={{
        position: "absolute",
        left: FRAME - 6,
        right: FRAME - 6,
        bottom: FRAME - 8,
        height: 14,
        background: `linear-gradient(${chalk.woodLight}, ${chalk.woodDark})`,
        borderRadius: 3,
        boxShadow: "0 3px 6px rgba(0,0,0,0.5)",
      }}
    />
    {/* chalk stick on tray */}
    <div
      style={{
        position: "absolute",
        left: 1010,
        bottom: FRAME + 4,
        width: 58,
        height: 10,
        borderRadius: "3px 5px 5px 3px",
        background: `linear-gradient(${chalk.white}, #d6d6cc)`,
        transform: "rotate(-4deg)",
        boxShadow: "0 1px 2px rgba(0,0,0,0.4)",
      }}
    />
    <div
      style={{
        position: "absolute",
        left: 1084,
        bottom: FRAME + 4,
        width: 22,
        height: 9,
        borderRadius: 3,
        background: chalk.pink,
        transform: "rotate(7deg)",
        opacity: 0.9,
      }}
    />
  </>
);

export const Scene5_Complexity: React.FC = () => {
  const frame = useCurrentFrame();
  const formulaScale = interpolate(frame, [FORMULA_START, FORMULA_START + 22], [0.96, 1], clamp);

  return (
    <AbsoluteFill style={{ background: chalk.board, color: chalk.white, fontFamily: chalkFont }}>
      <Audio src={staticFile("audio/scene5.wav")} />
      <Board />

      {/* Title */}
      <Written
        start={0}
        dur={22}
        style={{
          left: 0,
          right: 0,
          top: 40,
          textAlign: "center",
          fontSize: 48,
          fontWeight: 700,
          color: chalk.white,
          textShadow: chalkGlow(chalk.white),
          transform: "rotate(-1.2deg)",
        }}
      >
        How fast is it?
      </Written>

      <svg width={1280} height={720} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <defs>
          <filter id="chalkRough" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={4} result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale={2.5} xChannelSelector="R" yChannelSelector="G" result="disp" />
            <feGaussianBlur in="disp" stdDeviation={0.4} />
          </filter>
        </defs>
        {[0, 1, 2, 3].map((l) => (
          <Row key={l} level={l} />
        ))}
        <Brace />
        <Underlines />
      </svg>

      <BraceLabel />
      {[0, 1, 2].map((g) => (
        <WorkLabel key={g} gap={g} />
      ))}

      {/* n work x log n levels */}
      <Written
        start={FORMULA_START - 18}
        dur={18}
        style={{
          left: 0,
          right: 0,
          top: 446,
          textAlign: "center",
          fontSize: 30,
          color: chalk.white,
          textShadow: chalkGlow(chalk.white),
          transform: "rotate(0.8deg)",
        }}
      >
        <span style={{ color: chalk.pink, fontWeight: 700 }}>n</span> work ×{" "}
        <span style={{ color: chalk.blue, fontWeight: 700 }}>log n</span> levels
      </Written>

      {/* Big O(n log n) */}
      <Written
        start={FORMULA_START}
        dur={22}
        style={{
          left: 0,
          right: 0,
          top: 486,
          textAlign: "center",
          fontSize: 100,
          fontWeight: 700,
          lineHeight: "120px",
          color: chalk.yellow,
          textShadow: `0 0 3px ${chalk.yellow}, 0 0 14px ${chalk.yellow}44`,
          transform: `rotate(-1.5deg) scale(${formulaScale})`,
        }}
      >
        O(n log n)
      </Written>

      {/* worst case */}
      <Written
        start={WORST_START}
        dur={18}
        style={{
          left: 0,
          right: 0,
          top: 642,
          textAlign: "center",
          fontSize: 26,
          color: chalk.pink,
          textShadow: chalkGlow(chalk.pink),
          transform: "rotate(-0.6deg)",
        }}
      >
        …even in the worst case
      </Written>
    </AbsoluteFill>
  );
};
