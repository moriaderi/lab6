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
| scene1-v2 | 1 Intro | Last 25 frames: title fades, boxes ease into Scene 2's top-row position and 'Divide' title for a seamless cut
| scene2-v2 | 2 Divide | Dashed cyan cut line appears where each split will happen, ~14 frames before halves slide apart
| scene2-v3 | 2 Divide | Top row starts fully visible at frame 0 (no spring-in), so the Scene 1 -> 2 cut is pixel-identical
| scene3-v2 | 3 Merge | Used-up slots stay as faded dashed outlines + 'empty' label, so lists don't vanish and pointers never float over nothing
| scene4-v2 | 4 Build Up | Label 'fours' -> 'halves' (group of 3 existed); faint tree lines show which pieces merge into which
| scene5-v2 | 5 Complexity | Accuracy fix: n=8 has 3 merge levels, not 4 -> 'n work' labels moved between rows, brace says log2 8 = 3 levels
| scene6-v2 | 6 Recap | Merge card text fits one line; sorted array moved up with '[38,...] -> sorted' label
| — | all | Round 3 small tweaks stopped and discarded: user asked for each scene to look different, not more polish on the same look
| scene1-v3 | 1 Intro | REDESIGN: playing cards on green casino felt, gold serif title, divide/merge poker chips
| scene2-v4 | 2 Divide | REDESIGN: engineering blueprint grid, white line-art cells, L/R labels, red scissor cut lines, title block
| scene3-v3 | 3 Merge | REDESIGN: dark stage with spotlights, vertical stacks, LED scoreboard captions, result column glows gold
| scene4-v3 | 4 Build Up | REDESIGN: light bar chart (height = value), same bars rearrange in place into a staircase
| scene5-v3 | 5 Complexity | REDESIGN: chalkboard with wooden frame, hand-drawn chalk boxes, text written on, double-underlined O(n log n)
| scene6-v3 | 6 Recap | REDESIGN: synthwave neon, scrolling grid floor + striped sun, 01/02/03 neon panels, AICODE credit

## Renders
| File | Commit | Notes |
|------|--------|-------|
| out/test-clip.mp4 | `36b00e8` | 5s stack test (Remotion + Kokoro narration) |
| out/render-01.mp4 | `36544cf` | First full video: all scenes at v1 (~58s) |
| out/render-02.mp4 | `3a5fbd8` | All scenes v2 (scene 2 v3): continuity, cut lines, accurate levels |
