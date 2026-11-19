import React from "react";
import { AbsoluteFill } from "remotion";
import { colors, font } from "../theme";

// Placeholder — replace with the real scene. Keep DURATION in sync with the narration length.
export const DURATION = 90;

export const Scene2_Divide: React.FC = () => (
  <AbsoluteFill style={{ background: colors.bg, color: colors.text, fontFamily: font, justifyContent: "center", alignItems: "center", fontSize: 48 }}>
    Scene 2: Divide
  </AbsoluteFill>
);
