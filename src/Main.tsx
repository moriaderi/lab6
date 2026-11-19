import React from "react";
import { Series } from "remotion";
import { scenes } from "./scenes";

export const totalDuration = scenes.reduce((a, s) => a + s.duration, 0);

export const Main: React.FC = () => (
  <Series>
    {scenes.map((s) => (
      <Series.Sequence key={s.id} durationInFrames={s.duration}>
        <s.component />
      </Series.Sequence>
    ))}
  </Series>
);
