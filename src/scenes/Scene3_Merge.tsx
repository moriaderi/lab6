import React from "react";
import { AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { BOX, colors, font } from "../theme";

// Narration is 8.11s -> ceil(8.11*30) + 30 = 274 frames; all 4 merge steps finish by ~frame 240.
export const DURATION = 274;

const GAP = 96; // distance between box centers
const LIST_Y = 230;
const OUT_Y = 500;
const LEFT_CX = 340;
const RIGHT_CX = 940;
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
const COMPARE_LEN = 18; // highlight before moving
const MOVE_LEN = 20;
const GREEN_AT = FIRST_STEP + STEP_LEN * 4 + 5;

const stepStart = (k: number) => FIRST_STEP + STEP_LEN * k;
const slotX = (cx: number, i: number, n: number) => cx + (i - (n - 1) / 2) * GAP - BOX / 2;

const homeX = (it: Item) => slotX(it.list === "left" ? LEFT_CX : RIGHT_CX, it.idx, 2);

const Box: React.FC<{ value: number; x: number; y: number; fill: string; border: string; scale?: number; glow?: string; opacity?: number }> = ({ value, x, y, fill, border, scale = 1, glow, opacity = 1 }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: BOX,
      height: BOX,
      borderRadius: 14,
      background: fill,
      border: `4px solid ${border}`,
      boxSizing: "border-box",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontSize: 32,
      fontWeight: 700,
      color: colors.text,
      transform: `scale(${scale})`,
      boxShadow: glow ? `0 0 24px ${glow}` : undefined,
      opacity,
    }}
  >
    {value}
  </div>
);

const Pointer: React.FC<{ x: number; opacity: number }> = ({ x, opacity }) => (
  <svg width={40} height={30} style={{ position: "absolute", left: x + BOX / 2 - 20, top: LIST_Y - 44, opacity }}>
    <polygon points="0,0 40,0 20,28" fill={colors.accent} />
  </svg>
);

export const Scene3_Merge: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const intro = spring({ frame, fps, config: { damping: 14 } });
  const labelFade = interpolate(frame, [10, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const green = interpolate(frame, [GREEN_AT, GREEN_AT + 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Progress of each item's move (0 = in its list, 1 = in output)
  const moveProgress = (k: number) =>
    spring({ frame: frame - (stepStart(k) + COMPARE_LEN), fps, config: { damping: 14 }, durationInFrames: MOVE_LEN });

  // Current step = last one that has started
  const current = STEPS.reduce((acc, _s, k) => (frame >= stepStart(k) ? k : acc), -1);
  const comparing = current >= 0 && frame < stepStart(current) + COMPARE_LEN + MOVE_LEN ? STEPS[current].compare : [];

  // Pointer positions: front index = number of items already taken from each list (animated)
  const taken = (list: "left" | "right") =>
    STEPS.reduce((acc, s, k) => (ITEMS[s.item].list === list ? acc + moveProgress(k) : acc), 0);
  const leftFront = taken("left");
  const rightFront = taken("right");
  const pointerX = (cx: number, f: number) => slotX(cx, 0, 2) + Math.min(f, 1) * GAP;
  const pointersOn = interpolate(frame, [FIRST_STEP - 15, FIRST_STEP], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pointersOff = interpolate(frame, [GREEN_AT - 10, GREEN_AT], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const leftPointerOpacity = pointersOn * pointersOff * interpolate(leftFront, [1, 1.8], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const rightPointerOpacity = pointersOn * pointersOff * interpolate(rightFront, [1, 1.8], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const stepText = current >= 0 && frame < GREEN_AT ? STEPS[current].text : "";
  const textFade = current >= 0 ? interpolate(frame - stepStart(current), [0, 8], [0, 1], { extrapolateRight: "clamp" }) : 0;

  const leftEmpty = interpolate(leftFront, [1.8, 2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) * pointersOff;
  const doneFade = interpolate(frame, [GREEN_AT + 5, GREEN_AT + 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const label = (text: string, cx: number, y: number, color: string, opacity: number) => (
    <div style={{ position: "absolute", left: cx - 200, width: 400, top: y, textAlign: "center", fontSize: 28, fontWeight: 600, color, opacity }}>{text}</div>
  );

  return (
    <AbsoluteFill style={{ background: colors.bg, color: colors.text, fontFamily: font }}>
      <Audio src={staticFile("audio/scene3.wav")} />

      <div style={{ position: "absolute", top: 40, width: "100%", textAlign: "center", fontSize: 48, fontWeight: 700, opacity: labelFade }}>
        Merging two sorted lists
      </div>

      {label("Left (sorted)", LEFT_CX, LIST_Y + BOX + 20, colors.left, labelFade)}
      {label("Right (sorted)", RIGHT_CX, LIST_Y + BOX + 20, colors.right, labelFade)}
      <div style={{ position: "absolute", left: LEFT_CX - 200, width: 400, top: LIST_Y + BOX + 62, textAlign: "center", fontSize: 22, fontWeight: 500, fontStyle: "italic", color: colors.muted, opacity: leftEmpty }}>
        empty
      </div>

      {/* Used-up slots: faded dashed outline where each removed item was */}
      {ITEMS.map((it, i) => {
        const k = STEPS.findIndex((s) => s.item === i);
        const ghost = interpolate(moveProgress(k), [0, 0.4], [0, 0.6], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return (
          <div
            key={`ghost-${i}`}
            style={{
              position: "absolute",
              left: homeX(it),
              top: LIST_Y,
              width: BOX,
              height: BOX,
              borderRadius: 14,
              border: `3px dashed ${it.list === "left" ? colors.left : colors.right}`,
              boxSizing: "border-box",
              opacity: ghost,
            }}
          />
        );
      })}

      {/* Comparison caption */}
      <div style={{ position: "absolute", top: LIST_Y + 14, left: OUT_CX - 170, width: 340, textAlign: "center", fontSize: 30, fontWeight: 600, color: colors.accent, opacity: textFade }}>
        {stepText}
      </div>

      {/* Output slots */}
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: slotX(OUT_CX, i, 4),
            top: OUT_Y,
            width: BOX,
            height: BOX,
            borderRadius: 14,
            border: `3px dashed ${colors.boxBorder}`,
            boxSizing: "border-box",
            opacity: labelFade,
          }}
        />
      ))}
      {label("Result", OUT_CX, OUT_Y + BOX + 20, colors.muted, labelFade * (1 - doneFade))}
      {label("Sorted: [3, 27, 38, 43]", OUT_CX, OUT_Y + BOX + 20, colors.sorted, doneFade)}

      <Pointer x={pointerX(LEFT_CX, leftFront)} opacity={leftPointerOpacity} />
      <Pointer x={pointerX(RIGHT_CX, rightFront)} opacity={rightPointerOpacity} />

      {ITEMS.map((it, i) => {
        const k = STEPS.findIndex((s) => s.item === i);
        const p = moveProgress(k);
        const x = interpolate(p, [0, 1], [homeX(it), slotX(OUT_CX, k, 4)]);
        const y = interpolate(p, [0, 1], [LIST_Y, OUT_Y]);
        const isCompared = comparing.includes(i) && p < 0.5;
        const isTaken = current === k && frame >= stepStart(k) && p < 1;
        const base = it.list === "left" ? colors.left : colors.right;
        const border = green > 0 ? colors.sorted : isCompared ? colors.accent : base;
        const fill = green > 0 ? colors.sorted : colors.box;
        const lift = isTaken ? 1 + 0.12 * Math.sin(Math.PI * p) : 1;
        return (
          <Box
            key={i}
            value={it.value}
            x={x}
            y={y + (1 - intro) * 40}
            fill={fill}
            border={border}
            scale={lift * (green > 0 ? 1 + 0.08 * Math.sin(Math.PI * green) : 1)}
            glow={isCompared ? colors.accent : green > 0 ? colors.sorted : undefined}
            opacity={intro}
          />
        );
      })}
    </AbsoluteFill>
  );
};
