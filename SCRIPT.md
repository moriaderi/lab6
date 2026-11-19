# Merge Sort — Explainer Script

**Goal:** after ~1.5 minutes the viewer understands that merge sort splits a list in half until single items remain, merges sorted halves by repeatedly comparing their front items, and runs in O(n log n) time.

**Example array (used everywhere):** `[38, 27, 43, 3, 9, 82, 10]`
**Look:** dark background, rounded number boxes; purple = left half, pink = right half, cyan = item being compared, green = sorted. (see `src/theme.ts`)

| # | File | On screen | Narration |
|---|------|-----------|-----------|
| 1 | `Scene1_Intro.tsx` | Title "Merge Sort" pops in; the 7 unsorted boxes slide in below it. | "Here are seven numbers in no particular order. Merge sort puts them in order with one simple idea: divide, then merge." |
| 2 | `Scene2_Divide.tsx` | The array splits into halves level by level, like a tree: [38,27,43,3] / [9,82,10], then down to single boxes. Left halves purple, right halves pink. | "First, we split the list in half. Then we split each half again, and keep going until every piece holds just one number. A single number is already sorted." |
| 3 | `Scene3_Merge.tsx` | Close-up merge of [27,38] and [3,43]: a cyan arrow at the front of each list, the smaller front item drops into the output row, repeat until output is [3,27,38,43] (green). | "Now we merge. Look at the front of each sorted list, take the smaller number, and move it to the result. Repeat until both lists are empty." |
| 4 | `Scene4_BuildUp.tsx` | Tree from scene 2 rebuilds upward: pairs merge into sorted pairs, then fours, then the final green [3,9,10,27,38,43,82]. | "We merge pieces back together level by level. Pairs become sorted pairs, pairs become fours, and finally the whole list is sorted." |
| 5 | `Scene5_Complexity.tsx` | Tree diagram with levels labelled; "log n levels" brace on the side, "n work per level" under each row; formula O(n log n) appears. | "How fast is it? Halving the list gives about log n levels, and merging each level touches all n numbers. So merge sort takes n log n time — even in the worst case." |
| 6 | `Scene6_Recap.tsx` | Three cards appear one by one: "1. Divide", "2. Merge", "3. O(n log n)"; final sorted array glows green. | "So that's merge sort: divide until it's trivial, merge sorted pieces back together, and get n log n time, every time." |
