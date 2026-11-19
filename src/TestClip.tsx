import React from "react";
import { AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

export const TestClip: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 12 } });
  const fade = interpolate(frame, [20, 40], [0, 1], { extrapolateRight: "clamp" });
  const bar = interpolate(frame, [0, 150], [0, 100]);

  return (
    <AbsoluteFill style={{ background: "#0f172a", justifyContent: "center", alignItems: "center", fontFamily: "Segoe UI, sans-serif" }}>
      <Audio src={staticFile("narration.wav")} />
      <div style={{ transform: `scale(${pop})`, color: "#f8fafc", fontSize: 72, fontWeight: 700 }}>Merge Sort</div>
      <div style={{ opacity: fade, color: "#94a3b8", fontSize: 32, marginTop: 16 }}>Split · Sort · Merge</div>
      <div style={{ position: "absolute", bottom: 60, left: 140, width: 1000, height: 8, background: "#1e293b", borderRadius: 4 }}>
        <div style={{ width: `${bar}%`, height: "100%", background: "#38bdf8", borderRadius: 4 }} />
      </div>
    </AbsoluteFill>
  );
};
