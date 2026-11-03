# The Thinking Machine Atlas — AI Fundamentals interactive book

## Run it
Double-click `index.html` (or drag it into Chrome, Edge, Firefox or Safari). No server, no internet, no install.

## File structure
```
ai-book/
├── index.html                 page shell: top bar, sidebar, main area
├── style.css                  design tokens, light/dark themes, layout, widgets, responsive rules
├── script.js                  router, navigation, progress, quizzes, 10 interactive widgets
└── js/
    ├── content-weeks-1-5.js   chapter content, Weeks 1–5
    ├── content-weeks-6-10.js  chapter content, Weeks 6–10
    ├── content-extras.js      team names, timeline, comparison table, real world, risks,
    │                          ethics, final quiz, sources, AI disclosure, course map
    ├── labs.js                45 Python labs with their real, saved output (generated)
    └── visuals.js             14 extra interactive figures
python-labs/
    ├── labs_src.py            source of every Python lab
    └── build_labs.py          runs every lab and regenerates js/labs.js
```
To change a lab: edit `python-labs/labs_src.py`, then run `python3 build_labs.py`
(needs NumPy and scikit-learn; adjust the output path at the bottom of the script).
Edit team names in `js/content-extras.js` → `window.BOOK.meta.team`.

## External services (both optional)
- Google Fonts: Source Serif 4, Caveat, JetBrains Mono. Offline, system fonts are used.
- Pyodide (Python in the browser) from cdn.jsdelivr.net, only when you press "Run".
  Offline, each lab shows its saved output.
