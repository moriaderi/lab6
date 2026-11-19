# Merge Sort — Explainer Video Script

## Goal
After about one minute, the viewer should understand that **merge sort splits a list in half until only single items remain, merges sorted lists by repeatedly comparing their front items, and runs in O(n log n) time — even in the worst case.**

## Audience
Students who know what an array and "sorting" are, but have not seen merge sort (or saw it and didn't get it).

## Running example
`[38, 27, 43, 3, 9, 82, 10]` — 7 numbers, used in every scene so the viewer follows one story.
Split rule: the left half gets ⌈n/2⌉ items → `[38, 27, 43, 3] | [9, 82, 10]`.

## Visual language
| Element | Look |
|---|---|
| Background | dark navy `#0f172a` |
| Number | rounded box with the value in bold white |
| Left half | purple border `#a78bfa` |
| Right half | pink border `#f472b6` |
| Being compared / moving | cyan `#38bdf8` glow |
| Sorted / done | green `#34d399` with glow |

All visuals are drawn in code (Remotion + React). Narration is generated locally with Kokoro TTS (`narrate.py`, voice `af_heart`). Shared colors and sizes live in `src/theme.ts`.

## Timeline (30 fps, total ≈ 58.5 s)
| # | Scene | File | Frames | Seconds |
|---|---|---|---|---|
| 1 | Intro | `src/scenes/Scene1_Intro.tsx` | 259 | 8.6 |
| 2 | Divide | `src/scenes/Scene2_Divide.tsx` | 317 | 10.6 |
| 3 | Merge | `src/scenes/Scene3_Merge.tsx` | 274 | 9.1 |
| 4 | Build Up | `src/scenes/Scene4_BuildUp.tsx` | 276 | 9.2 |
| 5 | Complexity | `src/scenes/Scene5_Complexity.tsx` | 363 | 12.1 |
| 6 | Recap | `src/scenes/Scene6_Recap.tsx` | 267 | 8.9 |

---

## Scene 1 — Intro
**Purpose:** introduce the problem and the one-line idea.
**Narration** (`public/audio/scene1.wav`, 7.6 s):
> "Here are seven numbers in no particular order. Merge sort puts them in order with one simple idea: divide, then merge."

**On screen:**
1. The title **"Merge Sort"** pops in ("Sort" in cyan).
2. ~0.7 s: the 7 unsorted boxes slide in from the right one by one and wobble briefly — *"no particular order"*.
3. ~3 s: the subtitle *"one simple idea"* fades in.
4. ~5.8 s: a purple **divide** pill pops in, then an arrow, then a pink **merge** pill — on *"divide, then merge"*.

## Scene 2 — Divide
**Purpose:** show the recursive splitting, and that a single item is already sorted.
**Narration** (`public/audio/scene2.wav`, 9.6 s):
> "First, we split the list in half. Then we split each half again, and keep going until every piece holds just one number. A single number is already sorted."

**On screen:** a tree that grows downward, with lines from each parent to its children.
1. Top row: `[38, 27, 43, 3, 9, 82, 10]`.
2. *"split the list in half"* → purple `[38, 27, 43, 3]` and pink `[9, 82, 10]`.
3. *"split each half again"* → `[38, 27] [43, 3] [9, 82] [10]`.
4. *"keep going"* → seven single boxes.
5. *"already sorted"* → the single boxes turn green and glow. A caption under the tree follows each phrase.

## Scene 3 — Merge (the key idea)
**Purpose:** teach the merge step: compare fronts, take the smaller one.
**Narration** (`public/audio/scene3.wav`, 8.1 s):
> "Now we merge. Look at the front of each sorted list, take the smaller number, and move it to the result. Repeat until both lists are empty."

**On screen:** the left list `[27, 38]` (purple) and the right list `[3, 43]` (pink), with four empty "Result" slots below. A cyan pointer marks the front of each list.
| Step | Compare | Caption | Result |
|---|---|---|---|
| 1 | 27 vs 3 | "27 vs 3 → take 3" | `[3]` |
| 2 | 27 vs 43 | "27 vs 43 → take 27" | `[3, 27]` |
| 3 | 38 vs 43 | "38 vs 43 → take 38" | `[3, 27, 38]` |
| 4 | — | "left is empty → take 43" | `[3, 27, 38, 43]` |

At the end all four result boxes turn green and *"Sorted: [3, 27, 38, 43]"* appears.

## Scene 4 — Build Up
**Purpose:** connect the single merge to the whole algorithm.
**Narration** (`public/audio/scene4.wav`, 8.2 s):
> "We merge pieces back together level by level. Pairs become sorted pairs, pairs become fours, and finally the whole list is sorted."

**On screen:** rows build from the bottom up, each labelled on the left. Boxes fly up in cyan from their positions in the row below:
1. singles: `38 27 43 3 9 82 10`
2. pairs: `[27, 38] [3, 43] [9, 82] [10]`
3. fours: `[3, 27, 38, 43] [9, 10, 82]`
4. sorted!: `[3, 9, 10, 27, 38, 43, 82]` in glowing green

## Scene 5 — Complexity
**Purpose:** explain *why* it is O(n log n), not just state it.
**Narration** (`public/audio/scene5.wav`, 11.1 s):
> "How fast is it? Halving the list gives about log n levels, and merging each level touches all n numbers. So merge sort takes n log n time — even in the worst case."

**On screen:**
1. Title *"How fast is it?"*.
2. Four rows of 8 boxes drop in: 1×8, 2×4, 4×2, 8×1 — *"halving the list"*.
3. A cyan brace draws down the left side: **"log n levels"**.
4. An **"n work"** label appears beside each row as that row pulses cyan — *"touches all n numbers"*.
5. *"n work × log n levels"*, then a large green **O(n log n)**, then *"…even in the worst case"*.

## Scene 6 — Recap
**Purpose:** leave the viewer with three takeaways.
**Narration** (`public/audio/scene6.wav`, 7.4 s):
> "So that's merge sort: divide until it's trivial, merge sorted pieces back together, and get n log n time, every time."

**On screen:** the title *"Merge Sort — Recap"*, then three cards spring in, one per phrase:
1. **1. Divide** (purple) — "Split until pieces are trivial"
2. **2. Merge** (pink) — "Combine sorted pieces, smallest first"
3. **3. O(n log n)** (cyan) — "n work × log n levels"

The sorted array `[3, 9, 10, 27, 38, 43, 82]` slides up and glows green until the end (1.5 s hold).

---

## Known issues / ideas for v2
- **Scene 3:** when a list runs out, its side of the screen is left empty. Keep a faded "empty" outline there.
- **Scene 4:** the "fours" row has a group of 3 (`[9, 10, 82]`). Rename the label to "halves".
- **Scene 6:** the "Merge" card's subtitle wraps onto two lines. Shorten it.
- Possible extra: brief code or pseudocode of `mergeSort` / `merge` (not in v1).

## How to regenerate
- Narration for a scene: `.venv/Scripts/python.exe narrate.py "<text>" public/audio/sceneN.wav`, then set `DURATION` in that scene's file to ⌈seconds × 30⌉ + 30.
- Preview: `npm run studio`.
- Full render: `npx remotion render MergeSort out/render-NN.mp4`, using a new number each time and never overwriting an old render.
