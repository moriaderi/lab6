import * as S1 from "./Scene1_Intro";
import * as S2 from "./Scene2_Divide";
import * as S3 from "./Scene3_Merge";
import * as S4 from "./Scene4_BuildUp";
import * as S5 from "./Scene5_Complexity";
import * as S6 from "./Scene6_Recap";

export const scenes = [
  { id: "Scene1-Intro", component: S1.Scene1_Intro, duration: S1.DURATION },
  { id: "Scene2-Divide", component: S2.Scene2_Divide, duration: S2.DURATION },
  { id: "Scene3-Merge", component: S3.Scene3_Merge, duration: S3.DURATION },
  { id: "Scene4-BuildUp", component: S4.Scene4_BuildUp, duration: S4.DURATION },
  { id: "Scene5-Complexity", component: S5.Scene5_Complexity, duration: S5.DURATION },
  { id: "Scene6-Recap", component: S6.Scene6_Recap, duration: S6.DURATION },
];
