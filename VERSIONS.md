# Versions log

Each scene version is a git commit tagged `sceneN-vK`. Restore one with:
`git checkout sceneN-vK -- src/scenes/SceneN_*.tsx public/audio/sceneN.wav`

| Tag | Scene | What changed / why |
|-----|-------|--------------------|
| — | all | `83ba423` scaffold: one file per scene so agents can work in parallel |
| scene1-v1 | 1 Intro | First version: title pops in, 7 unsorted boxes slide in, "divide → merge" pills timed to narration (7.6s) |

## Renders
| File | Commit | Notes |
|------|--------|-------|
| out/test-clip.mp4 | `36b00e8` | 5s stack test (Remotion + Kokoro narration) |
