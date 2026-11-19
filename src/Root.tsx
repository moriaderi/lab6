import React from "react";
import { Composition } from "remotion";
import { TestClip } from "./TestClip";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="TestClip"
    component={TestClip}
    durationInFrames={150} // 5 seconds at 30 fps
    fps={30}
    width={1280}
    height={720}
  />
);
