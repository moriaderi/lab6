import React from "react";
import { Composition } from "remotion";
import { TestClip } from "./TestClip";
import { Main, totalDuration } from "./Main";
import { scenes } from "./scenes";
import { FPS, WIDTH, HEIGHT } from "./theme";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="MergeSort" component={Main} durationInFrames={totalDuration} fps={FPS} width={WIDTH} height={HEIGHT} />
    {scenes.map((s) => (
      <Composition key={s.id} id={s.id} component={s.component} durationInFrames={s.duration} fps={FPS} width={WIDTH} height={HEIGHT} />
    ))}
    <Composition id="TestClip" component={TestClip} durationInFrames={150} fps={30} width={1280} height={720} />
  </>
);
