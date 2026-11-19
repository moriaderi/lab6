import React from "react";
import { AbsoluteFill } from "remotion";
import { colors, font } from "../theme";

// Placeholder — replace with the real scene. Keep DURATION in sync with the narration length.
export const DURATION = 90;

export const Scene6_Recap: React.FC = () => (
  <AbsoluteFill style={{ background: colors.bg, color: colors.text, fontFamily: font, justifyContent: "center", alignItems: "center", fontSize: 48 }}>
    Scene 6: Recap
  </AbsoluteFill>
);
