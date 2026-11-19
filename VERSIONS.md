# Versions log

Each scene version is a git commit tagged `sceneN-vK`. Restore one with:
`git checkout sceneN-vK -- src/scenes/SceneN_*.tsx public/audio/sceneN.wav`

| Tag | Scene | What changed / why |
|-----|-------|--------------------|
| — | all | `83ba423` scaffold: one file per scene so agents can work in parallel |
| scene1-v1 | 1 Intro | First version: title pops in, 7 unsorted boxes slide in, "divide → merge" pills timed to narration (7.6s) |
| scene2-v1 | 2 Divide | First version: array splits level by level into a tree of halves, singles turn green (9.6s)
| scene3-v1 | 3 Merge | First version: merge [27,38]+[3,43] with cyan front pointers and 'x vs y -> take' captions (8.1s)
| scene4-v1 | 4 Build Up | First version: singles -> pairs -> fours -> sorted, rows rise upward, final row green (8.2s)
| scene5-v1 | 5 Complexity | First version: 4 halving rows, "log n levels" brace, "n work" per row, big O(n log n) (11.1s)
| scene6-v1 | 6 Recap | First version: three cards Divide / Merge / O(n log n), sorted array glows green (7.4s + hold)

## Renders
| File | Commit | Notes |
|------|--------|-------|
| out/test-clip.mp4 | `36b00e8` | 5s stack test (Remotion + Kokoro narration) |
| out/render-01.mp4 | `36544cf` | First full video: all scenes at v1 (~58s) |
