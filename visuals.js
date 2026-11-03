/* =====================================================================
   Extra interactive figures (two or more per chapter, added to the main
   figure defined in each chapter's content). Each figure is a function
   that receives an empty element and builds itself with plain DOM/SVG.
   Registered on window.ATLAS_VISUALS and merged into script.js widgets.
   ===================================================================== */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const fmt = (x, d = 2) => Number(x).toFixed(d);
  const pct = (x, d = 1) => (100 * x).toFixed(d) + " %";
  const uid = (p) => p + Math.random().toString(36).slice(2, 7);
  const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const slider = (id, label, min, max, step, value) =>
    `<div class="slider"><label for="${id}">${label}</label><input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${value}"><output id="${id}-o" for="${id}"></output></div>`;
  /** Small seeded random generator so figures look the same on every visit. */
  function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();

  const W = {};
  const byWeek = {
    1: [{ widget: "envClassifier", title: "Classify an environment, get an architecture", caption: "Pick one of the lecture's tasks or click the cells to describe your own. The suggestions show which later station handles that kind of environment." }],
    2: [{ widget: "ucsGraph", title: "UCS and A* on a weighted graph", caption: "Step through the search and watch the priority queue. Both algorithms return the same cheapest path; A* uses the heuristic h (shown under each node) to expand fewer nodes." }],
    3: [
      { widget: "tspTour", title: "Improving the Astana delivery tour with 2-opt", caption: "The eight stops from the lecture case, at illustrative positions. Each 2-opt move reverses one segment of the tour; the chart records the tour length after every accepted improvement." },
      { widget: "nQueens", title: "8-Queens by min-conflicts", caption: "Red lines join queens that attack each other. Each step moves one conflicted queen to the row in its column with the fewest conflicts." }
    ],
    4: [{ widget: "ticTacToe", title: "Play tic-tac-toe against Minimax", caption: "You are X. The small number in each empty square is its Minimax value for you: +1 a forced win, 0 a draw, −1 a forced loss. O always plays the Minimax move, so the best you can do is draw." }],
    5: [{ widget: "gridworld", title: "Value iteration on the slippery gridworld", caption: "The lecture's 4 × 3 grid with terminals +1 and −1. Run Bellman sweeps and watch value spread from the terminals; arrows show the greedy policy. Change the noise, step reward and γ to see the policy change." }],
    6: [
      { widget: "conditionDays", title: "Conditioning filters the sample space", caption: "100 days drawn from the lecture's traffic table. Conditioning on rain keeps only the 30 rainy days, so the denominator changes from 100 to 30." },
      { widget: "bayesNet", title: "Set evidence in the sprinkler network", caption: "Click a node to observe it as true, false, or unknown. Every other node's probability is recomputed exactly by enumeration. Try Wet = true, then also Sprinkler = true, to see explaining away." }
    ],
    7: [{ widget: "hmmChart", title: "Filtering, smoothing and Viterbi over a whole sequence", caption: "Click a reading to flip it between NORMAL and HIGH. The red line is the filtered P(Faulty), the dashed blue line the smoothed estimate, and the row of squares is the single best path found by Viterbi." }],
    8: [
      { widget: "regressionFit", title: "Fit the regression line yourself", caption: "The lecture's temperature and consumption data. Drag w and b; the shaded squares are the squared errors that MSE averages. Then let least squares find the minimum." },
      { widget: "kmeans", title: "K-Means, one step at a time", caption: "Each step either assigns every point to its nearest centroid or moves each centroid to the mean of its points. The objective J can only go down." }
    ],
    9: [
      { widget: "nnPlayground", title: "Train a small neural network", caption: "A 2-input network with one hidden layer, trained by gradient descent and backpropagation in your browser. The background shows the network's prediction everywhere; line colour and thickness in the diagram show the weights." },
      { widget: "activations", title: "Activation functions", caption: "The step function of the perceptron, the sigmoid from Week 8, and tanh and ReLU used in hidden layers." }
    ],
    10: [{ widget: "attention", title: "What attention looks at", caption: "Click a word to see how strongly it attends to every other word. The weights are illustrative, chosen to show the idea: \"it\" looks mostly at \"box\". A real model learns these weights from data." }]
  };

  /* ---------------- Week 1: environment classifier ---------------- */
  W.envClassifier = function (el) {
    const dims = [
      ["Observability", ["fully", "partially"]],
      ["Agents", ["single", "multi"]],
      ["Uncertainty", ["deterministic", "stochastic", "strategic"]],
      ["Structure", ["episodic", "sequential"]],
      ["Timing", ["static", "dynamic"]],
      ["Actions", ["discrete", "continuous"]]
    ];
    const presets = {
      "Self-driving car": ["partially", "multi", "stochastic", "sequential", "dynamic", "continuous"],
      "Pac-Man": ["fully", "multi", "stochastic", "sequential", "dynamic", "discrete"],
      "Chess": ["fully", "multi", "strategic", "sequential", "static", "discrete"],
      "Greenhouse controller": ["partially", "single", "stochastic", "episodic", "dynamic", "discrete"],
      "Spam filter": ["fully", "single", "deterministic", "episodic", "static", "discrete"]
    };
    let cur = presets["Chess"].slice();
    el.innerHTML = `<div class="widget"><div class="widget-row">${Object.keys(presets).map((k) => `<button class="btn small quiet" data-p="${k}">${k}</button>`).join("")}</div>
      <div class="table-wrap"><table class="dim-table"><tbody>${dims.map(([n, opts], i) => `<tr><th scope="row">${n}</th>${opts.map((o) => `<td><button class="chip" data-d="${i}" data-v="${o}" aria-pressed="false">${o}</button></td>`).join("")}${opts.length < 3 ? "<td></td>" : ""}</tr>`).join("")}</tbody></table></div>
      <div class="readout" aria-live="polite"></div></div>`;
    function draw() {
      $$(".chip", el).forEach((b) => b.setAttribute("aria-pressed", String(cur[+b.dataset.d] === b.dataset.v)));
      const [obs, ag, unc, str, tim, act] = cur, out = [];
      out.push(obs === "partially" ? "• Sensors show only part of the state → keep an internal state: a model-based agent (Week 1), or track hidden states with an HMM (Week 7)." : "• Fully observable → the agent can decide from the current state.");
      if (str === "sequential") out.push("• Sequential → plan ahead: goal-based agent and search (Weeks 2–3).");
      if (unc === "strategic" || (ag === "multi" && unc !== "stochastic")) out.push("• Strategic opponent → adversarial search: Minimax and Alpha–Beta (Week 4).");
      if (unc === "stochastic" && str === "sequential") out.push("• Random outcomes over time → model it as an MDP; learn with RL if the model is unknown (Week 5).");
      if (unc === "stochastic" && str === "episodic") out.push("• Random but one-shot → expected utility and Bayes (Weeks 6 and 8).");
      if (unc === "deterministic" && str === "episodic") out.push("• Simple and one-shot → a reflex agent or a learned classifier may be enough (Weeks 1 and 8).");
      if (tim === "dynamic") out.push("• Dynamic → decisions must be fast; depth limits and evaluation functions help (Week 4).");
      if (act === "continuous") out.push("• Continuous actions → continuous optimization / policy-gradient methods (Weeks 3 and 5).");
      $(".readout", el).textContent = "What this environment needs:\n" + out.join("\n");
    }
    el.addEventListener("click", (e) => {
      const b = e.target.closest("button"); if (!b) return;
      if (b.dataset.p) cur = presets[b.dataset.p].slice();
      if (b.dataset.d) cur[+b.dataset.d] = b.dataset.v;
      draw();
    });
    draw();
  };

  /* ---------------- Week 2: UCS / A* on a weighted graph ---------------- */
  W.ucsGraph = function (el) {
    const N = { S: [60, 140], A: [200, 60], B: [220, 210], C: [380, 120], D: [400, 260], G: [540, 180] };
    const E = [["S", "A", 1], ["S", "B", 4], ["A", "B", 2], ["A", "C", 5], ["B", "C", 1], ["B", "D", 6], ["C", "G", 3], ["D", "G", 1]];
    const Hh = { S: 5, A: 5, B: 3, C: 2, D: 1, G: 0 };
    const adj = {}; Object.keys(N).forEach((k) => (adj[k] = [])); E.forEach(([a, b, w]) => adj[a].push([b, w]));
    const u = uid("ug");
    el.innerHTML = `<div class="widget"><div class="widget-row"><label for="${u}a">Algorithm</label><select id="${u}a"><option value="ucs">UCS: priority g(n)</option><option value="astar">A*: priority g(n) + h(n)</option></select>
      <button class="btn small primary" data-s>Step</button><button class="btn small quiet" data-r>Reset</button></div>
      <svg class="graph-svg" viewBox="0 0 600 300" role="img" aria-label="Weighted directed graph from S to G"></svg>
      <p><strong>Priority queue</strong> (smallest first):</p><div class="pq" aria-live="polite"></div><div class="readout"></div></div>`;
    const svg = $("svg", el);
    let pq, closed, done, path, log, order;
    function reset() { pq = [{ n: "S", g: 0, path: ["S"] }]; closed = new Set(); done = false; path = null; log = []; order = 0; draw(); }
    const pr = (x) => x.g + ($("#" + u + "a", el).value === "astar" ? Hh[x.n] : 0);
    function step() {
      if (done) return;
      pq.sort((a, b) => pr(a) - pr(b) || a.o - b.o);
      const x = pq.shift();
      if (!x) { done = true; return; }
      if (closed.has(x.n)) { log.push(`pop ${x.n} (already expanded, skip)`); return draw(); }
      closed.add(x.n);
      if (x.n === "G") { done = true; path = x.path; log.push(`pop G → goal reached with cost ${x.g}. Path ${x.path.join(" → ")}. Expanded ${closed.size} nodes.`); return draw(); }
      const added = adj[x.n].filter(([m]) => !closed.has(m)).map(([m, w]) => { pq.push({ n: m, g: x.g + w, path: x.path.concat(m), o: ++order }); return `${m}(g=${x.g + w})`; });
      log.push(`pop ${x.n} with g=${x.g}${$("#" + u + "a", el).value === "astar" ? `, f=${pr(x)}` : ""} → push ${added.join(", ") || "nothing"}`);
      draw();
    }
    function draw() {
      const onEdge = (a, b) => path && path.some((p, i) => p === a && path[i + 1] === b);
      const inPQ = new Set(pq.map((x) => x.n));
      let s = `<defs><marker id="${u}m" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="${css("--graphite")}"/></marker></defs>`;
      E.forEach(([a, b, w]) => {
        const [x1, y1] = N[a], [x2, y2] = N[b], dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy), r = 24;
        const sx = x1 + (dx * r) / L, sy = y1 + (dy * r) / L, ex = x2 - (dx * r) / L, ey = y2 - (dy * r) / L;
        if (onEdge(a, b)) s += `<line class="edge on" x1="${sx}" y1="${sy}" x2="${ex}" y2="${ey}"/>`;
        s += `<line class="edge" x1="${sx}" y1="${sy}" x2="${ex}" y2="${ey}" marker-end="url(#${u}m)"/><text class="w" x="${(x1 + x2) / 2 + 8}" y="${(y1 + y2) / 2 - 8}">${w}</text>`;
      });
      Object.entries(N).forEach(([k, [x, y]]) => {
        s += `<g class="gnode ${closed.has(k) ? "exp" : inPQ.has(k) ? "fr" : ""}"><circle cx="${x}" cy="${y}" r="22"/><text x="${x}" y="${y}">${k}</text><text class="w" x="${x}" y="${y + 36}">h=${Hh[k]}</text></g>`;
      });
      svg.innerHTML = s;
      const sorted = pq.slice().sort((a, b) => pr(a) - pr(b) || a.o - b.o);
      $(".pq", el).innerHTML = sorted.length ? sorted.map((x, i) => `<span class="${i ? "" : "top"}">${x.n}: ${$("#" + u + "a", el).value === "astar" ? `f=${pr(x)}` : `g=${x.g}`}</span>`).join("") : "(empty)";
      $(".readout", el).textContent = log.slice(-8).join("\n") || "Press Step to pop the first node.";
    }
    $("[data-s]", el).addEventListener("click", step);
    $("[data-r]", el).addEventListener("click", reset);
    $("#" + u + "a", el).addEventListener("change", reset);
    reset();
  };

  /* ---------------- Week 3: TSP 2-opt ---------------- */
  W.tspTour = function (el) {
    const stops = [["Campus", 0, 0], ["Baiterek", 4, 3], ["EXPO", 7, -2], ["Botanical", 2, 5], ["Khan Shatyr", 5, 6], ["Museum", 8, 4], ["Station", -3, 4], ["Airport", 9, -6]];
    let pts = stops.map((s) => ({ name: s[0], x: s[1], y: s[2] }));
    let route, hist;
    el.innerHTML = `<div class="widget"><div class="widget-row"><button class="btn small primary" data-st>2-opt step</button><button class="btn small" data-run>Run to the end</button><button class="btn small quiet" data-sh>Shuffle tour</button><button class="btn small quiet" data-rand>12 random stops</button></div>
      <div class="two-col"><svg class="plot-svg" data-map viewBox="0 0 320 300" role="img" aria-label="Map of the stops with the current tour"></svg><svg class="plot-svg" data-ch viewBox="0 0 320 300" role="img" aria-label="Tour length after each improvement"></svg></div>
      <div class="readout" aria-live="polite"></div></div>`;
    const len = (r) => r.reduce((s, a, i) => { const b = r[(i + 1) % r.length]; return s + Math.hypot(pts[a].x - pts[b].x, pts[a].y - pts[b].y); }, 0);
    function reset(shuffle) {
      route = pts.map((_, i) => i);
      if (shuffle) for (let i = route.length - 1; i > 1; i--) { const j = 1 + Math.floor(Math.random() * i); [route[i], route[j]] = [route[j], route[i]]; }
      hist = [len(route)]; draw("Tour reset.");
    }
    function step() {
      const L0 = len(route);
      for (let i = 1; i < route.length - 1; i++) for (let j = i + 1; j < route.length; j++) {
        const c = route.slice(0, i).concat(route.slice(i, j + 1).reverse(), route.slice(j + 1));
        if (len(c) < L0 - 1e-9) { route = c; hist.push(len(c)); draw(`Reversed the segment from stop ${i + 1} to stop ${j + 1}: ${fmt(L0, 2)} → ${fmt(len(c), 2)} km.`); return true; }
      }
      draw("No reversal shortens the tour: this is a 2-opt local optimum."); return false;
    }
    function draw(msg) {
      const xs = pts.map((p) => p.x), ys = pts.map((p) => p.y), mnx = Math.min(...xs), mxx = Math.max(...xs), mny = Math.min(...ys), mxy = Math.max(...ys);
      const sx = (x) => 24 + ((x - mnx) / (mxx - mnx || 1)) * 210, sy = (y) => 270 - ((y - mny) / (mxy - mny || 1)) * 240;
      let s = `<polygon points="${route.map((i) => sx(pts[i].x) + "," + sy(pts[i].y)).join(" ")}" fill="none" stroke="${css("--pen")}" stroke-width="2.5" stroke-linejoin="round"/>`;
      pts.forEach((p, i) => { s += `<circle cx="${sx(p.x)}" cy="${sy(p.y)}" r="${i === 0 ? 7 : 5}" fill="${i === 0 ? css("--green") : css("--ink")}"/>${pts.length <= 8 ? `<text class="lbl" x="${sx(p.x) + 8}" y="${sy(p.y) - 7}">${p.name}</text>` : ""}`; });
      $("[data-map]", el).innerHTML = s;
      const mx = Math.max(...hist), mn = Math.min(...hist) * 0.9, n = Math.max(hist.length - 1, 1);
      const cx = (i) => 40 + (i / n) * 260, cy = (v) => 260 - ((v - mn) / (mx - mn || 1)) * 220;
      $("[data-ch]", el).innerHTML = `<line class="axis" x1="40" y1="260" x2="300" y2="260"/><line class="axis" x1="40" y1="30" x2="40" y2="260"/>
        <text class="lbl" x="44" y="24">tour length (km)</text><text class="lbl" x="300" y="280" text-anchor="end">improvements</text>
        <text class="lbl" x="34" y="${cy(mx) + 4}" text-anchor="end">${fmt(mx, 0)}</text><text class="lbl" x="34" y="${cy(hist[hist.length - 1]) + 4}" text-anchor="end">${fmt(hist[hist.length - 1], 0)}</text>
        <polyline class="curve" points="${hist.map((v, i) => cx(i) + "," + cy(v)).join(" ")}"/>${hist.map((v, i) => `<circle class="marker" cx="${cx(i)}" cy="${cy(v)}" r="3.5"/>`).join("")}`;
      $(".readout", el).textContent = `${msg}\nCurrent length: ${fmt(len(route), 2)} km · improvements so far: ${hist.length - 1}`;
    }
    $("[data-st]", el).addEventListener("click", step);
    $("[data-run]", el).addEventListener("click", () => { let k = 0; while (step() && k++ < 200); });
    $("[data-sh]", el).addEventListener("click", () => reset(true));
    $("[data-rand]", el).addEventListener("click", () => { pts = Array.from({ length: 12 }, (_, i) => ({ name: "P" + (i + 1), x: Math.random() * 10, y: Math.random() * 10 })); reset(false); });
    reset(false);
  };

  /* ---------------- Week 3: N-Queens min-conflicts ---------------- */
  W.nQueens = function (el) {
    const N = 8; let board, steps;
    el.innerHTML = `<div class="widget"><div class="widget-row"><button class="btn small primary" data-st>Step</button><button class="btn small" data-run>Solve</button><button class="btn small quiet" data-new>New random board</button></div>
      <svg viewBox="0 0 320 320" style="max-width:340px" role="img" aria-label="Chess board with eight queens"></svg><div class="readout" aria-live="polite"></div></div>`;
    const conf = (c, r) => { let k = 0; for (let j = 0; j < N; j++) if (j !== c && (board[j] === r || Math.abs(board[j] - r) === Math.abs(j - c))) k++; return k; };
    const total = () => { let k = 0; for (let c = 0; c < N; c++) k += conf(c, board[c]); return k / 2; };
    function fresh() { board = Array.from({ length: N }, () => Math.floor(Math.random() * N)); steps = 0; draw("Random start."); }
    function step() {
      const bad = []; for (let c = 0; c < N; c++) if (conf(c, board[c])) bad.push(c);
      if (!bad.length) { draw("Solved: zero conflicts."); return false; }
      const c = bad[Math.floor(Math.random() * bad.length)], sc = Array.from({ length: N }, (_, r) => conf(c, r)), m = Math.min(...sc);
      const opts = sc.map((v, r) => (v === m ? r : -1)).filter((r) => r >= 0), from = board[c];
      board[c] = opts[Math.floor(Math.random() * opts.length)]; steps++;
      draw(`Moved the queen in column ${c + 1} from row ${from + 1} to row ${board[c] + 1} (${m} conflict${m === 1 ? "" : "s"} there).`);
      return true;
    }
    function draw(msg) {
      const S = 40; let s = "";
      for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) s += `<rect x="${c * S}" y="${r * S}" width="${S}" height="${S}" fill="${(r + c) % 2 ? css("--wash") : css("--paper")}" stroke="${css("--rule")}" stroke-width=".5"/>`;
      for (let a = 0; a < N; a++) for (let b = a + 1; b < N; b++) if (board[a] === board[b] || Math.abs(board[a] - board[b]) === b - a)
        s += `<line x1="${a * S + 20}" y1="${board[a] * S + 20}" x2="${b * S + 20}" y2="${board[b] * S + 20}" stroke="${css("--red")}" stroke-width="2" opacity=".75"/>`;
      for (let c = 0; c < N; c++) s += `<text x="${c * S + 20}" y="${board[c] * S + 22}" text-anchor="middle" dominant-baseline="central" font-size="26" style="fill:${conf(c, board[c]) ? css("--red") : css("--ink")}">♛</text>`;
      $("svg", el).innerHTML = s;
      $(".readout", el).textContent = `${msg}\nAttacking pairs: ${total()} · steps: ${steps}`;
    }
    $("[data-st]", el).addEventListener("click", step);
    $("[data-run]", el).addEventListener("click", () => { let k = 0; while (step() && k++ < 500); });
    $("[data-new]", el).addEventListener("click", fresh);
    fresh();
  };

  /* ---------------- Week 4: tic-tac-toe vs Minimax ---------------- */
  W.ticTacToe = function (el) {
    const LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
    const memo = new Map();
    const win = (b) => { for (const [a, c, d] of LINES) if (b[a] !== "." && b[a] === b[c] && b[a] === b[d]) return b[a]; return null; };
    function value(b, p) {           // value from X's point of view
      const k = b + p; if (memo.has(k)) return memo.get(k);
      const w = win(b); let v;
      if (w) v = w === "X" ? 1 : -1; else if (!b.includes(".")) v = 0;
      else { const vals = []; for (let i = 0; i < 9; i++) if (b[i] === ".") vals.push(value(b.slice(0, i) + p + b.slice(i + 1), p === "X" ? "O" : "X")); v = p === "X" ? Math.max(...vals) : Math.min(...vals); }
      memo.set(k, v); return v;
    }
    let b = ".........", over = false, msg = "";
    el.innerHTML = `<div class="widget"><div class="two-col"><div><div class="ttt" role="grid" aria-label="Tic-tac-toe board"></div>
      <div class="widget-row"><label><input type="checkbox" data-vals checked> Show Minimax values</label><button class="btn small quiet" data-new>New game</button><button class="btn small quiet" data-o>Let O start</button></div></div>
      <div class="readout" aria-live="polite"></div></div></div>`;
    const board = $(".ttt", el);
    function oMove() {
      let best = -1, bv = 2;
      for (let i = 0; i < 9; i++) if (b[i] === ".") { const v = value(b.slice(0, i) + "O" + b.slice(i + 1), "X"); if (v < bv) { bv = v; best = i; } }
      b = b.slice(0, best) + "O" + b.slice(best + 1);
      msg = `O played square ${best + 1}. Its Minimax value was ${bv} (O wants it as low as possible).`;
    }
    function check() { const w = win(b); if (w || !b.includes(".")) { over = true; msg += `\n${w ? (w === "X" ? "You won!" : "O wins. A mistake gave O a forced win.") : "Draw: the result of perfect play by both sides."}`; } }
    function draw() {
      const show = $("[data-vals]", el).checked;
      board.innerHTML = [...b].map((ch, i) => {
        let mv = "";
        if (ch === "." && !over && show) { const v = value(b.slice(0, i) + "X" + b.slice(i + 1), "O"); mv = `<span class="mv ${v > 0 ? "p" : v < 0 ? "n" : "z"}">${v > 0 ? "+1" : v}</span>`; }
        return `<button class="${ch === "X" ? "x" : ch === "O" ? "o" : ""}" data-i="${i}" ${ch !== "." || over ? "disabled" : ""} aria-label="Square ${i + 1}${ch !== "." ? ", " + ch : ""}">${ch === "." ? "" : ch}${mv}</button>`;
      }).join("");
      $(".readout", el).textContent = (msg || "Your move. Squares marked −1 lose against perfect play.") + `\nMinimax value of this position for you: ${value(b, "X")}.  Positions memoized: ${memo.size}`;
    }
    board.addEventListener("click", (e) => {
      const t = e.target.closest("button"); if (!t || over) return;
      const i = +t.dataset.i; if (b[i] !== ".") return;
      b = b.slice(0, i) + "X" + b.slice(i + 1); msg = "";
      check(); if (!over) { oMove(); check(); }
      draw();
    });
    $("[data-vals]", el).addEventListener("change", draw);
    $("[data-new]", el).addEventListener("click", () => { b = "........."; over = false; msg = ""; draw(); });
    $("[data-o]", el).addEventListener("click", () => { b = "........."; over = false; msg = ""; oMove(); draw(); });
    draw();
  };

  /* ---------------- Week 5: gridworld value iteration ---------------- */
  W.gridworld = function (el) {
    const R = 3, C = 4, WALL = "1,1", TERM = { "0,3": 1, "1,3": -1 };
    const A = { "↑": [-1, 0], "↓": [1, 0], "←": [0, -1], "→": [0, 1] }, SIDE = { "↑": ["←", "→"], "↓": ["←", "→"], "←": ["↑", "↓"], "→": ["↑", "↓"] };
    const u = uid("gw"); let V, k;
    el.innerHTML = `<div class="widget">${slider(u + "g", "γ (discount)", 0.5, 1, 0.01, 0.9)}${slider(u + "r", "Step reward", -0.6, 0, 0.01, -0.04)}${slider(u + "n", "Noise (slip chance)", 0, 0.6, 0.05, 0.2)}
      <div class="widget-row"><button class="btn small primary" data-one>One sweep</button><button class="btn small" data-all>Run to convergence</button><button class="btn small quiet" data-z>Reset values</button></div>
      <div class="gw" style="grid-template-columns:repeat(${C},1fr)" role="img" aria-label="Gridworld values and policy"></div><div class="readout" aria-live="polite"></div></div>`;
    const states = []; for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) if (r + "," + c !== WALL) states.push([r, c]);
    const move = (r, c, a) => { const nr = r + A[a][0], nc = c + A[a][1]; return nr < 0 || nr >= R || nc < 0 || nc >= C || nr + "," + nc === WALL ? [r, c] : [nr, nc]; };
    const P = () => { const n = +$("#" + u + "n", el).value; return [1 - n, n / 2, n / 2]; };
    function q(r, c, a) { const g = +$("#" + u + "g", el).value, sr = +$("#" + u + "r", el).value, p = P(); return [a, ...SIDE[a]].reduce((s, b, i) => { const [nr, nc] = move(r, c, b); return s + p[i] * (sr + g * V[nr + "," + nc]); }, 0); }
    function reset() { V = {}; states.forEach(([r, c]) => (V[r + "," + c] = TERM[r + "," + c] ?? 0)); k = 0; draw("Values start at 0 except the two terminals."); }
    function sweep() {
      const nv = {}; let delta = 0;
      states.forEach(([r, c]) => { const key = r + "," + c; nv[key] = key in TERM ? TERM[key] : Math.max(...Object.keys(A).map((a) => q(r, c, a))); delta = Math.max(delta, Math.abs(nv[key] - V[key])); });
      V = nv; k++; return delta;
    }
    function draw(msg) {
      $(".gw", el).innerHTML = Array.from({ length: R * C }, (_, i) => {
        const r = Math.floor(i / C), c = i % C, key = r + "," + c;
        if (key === WALL) return `<div class="wall"></div>`;
        const v = V[key], t = Math.max(-1, Math.min(1, v));
        const bg = t >= 0 ? `color-mix(in srgb, ${css("--green")} ${Math.round(t * 55)}%, ${css("--paper")})` : `color-mix(in srgb, ${css("--red")} ${Math.round(-t * 55)}%, ${css("--paper")})`;
        let arrow = "";
        if (!(key in TERM)) { let best = "↑", bv = -1e9; Object.keys(A).forEach((a) => { const qv = q(r, c, a); if (qv > bv + 1e-12) { bv = qv; best = a; } }); arrow = `<span class="ar">${best}</span>`; }
        return `<div style="background:${bg}">${arrow}<span>${key in TERM ? (v > 0 ? "+1" : "−1") : fmt(v, 2)}</span></div>`;
      }).join("");
      $(".readout", el).textContent = `${msg}\nSweeps so far: ${k}`;
    }
    const labels = () => { $("#" + u + "g-o", el).textContent = fmt($("#" + u + "g", el).value, 2); $("#" + u + "r-o", el).textContent = fmt($("#" + u + "r", el).value, 2); $("#" + u + "n-o", el).textContent = fmt($("#" + u + "n", el).value, 2); };
    $$("input", el).forEach((x) => x.addEventListener("input", () => { labels(); draw("Settings changed. Run more sweeps to update the values."); }));
    $("[data-one]", el).addEventListener("click", () => { const d = sweep(); draw(`Largest change in this sweep: ${fmt(d, 4)}`); });
    $("[data-all]", el).addEventListener("click", () => { let d, n = 0; do { d = sweep(); } while (d > 1e-6 && ++n < 500); draw(`Converged (largest change below 0.000001).`); });
    $("[data-z]", el).addEventListener("click", reset);
    labels(); reset();
  };

  /* ---------------- Week 6: 100 days ---------------- */
  W.conditionDays = function (el) {
    // From the lecture table: rain → 24 heavy, 4 medium, 2 light; no rain → 21 heavy, 25 medium, 24 light
    const days = [];
    [["rain", "heavy", 24], ["rain", "med", 4], ["rain", "light", 2], ["dry", "heavy", 21], ["dry", "med", 25], ["dry", "light", 24]].forEach(([w, t, n]) => { for (let i = 0; i < n; i++) days.push({ w, t }); });
    const r = rng(11); for (let i = days.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [days[i], days[j]] = [days[j], days[i]]; }
    el.innerHTML = `<div class="widget"><div class="widget-row" role="group" aria-label="Condition on"><button class="chip" data-c="all" aria-pressed="true">All 100 days</button><button class="chip" data-c="rain" aria-pressed="false">Only rainy days</button><button class="chip" data-c="dry" aria-pressed="false">Only dry days</button></div>
      <div class="days" role="img" aria-label="100 squares, one per day"></div>
      <div class="legend"><span><i style="background:${css("--red")}"></i>heavy traffic</span><span><i style="background:color-mix(in srgb, ${css("--red")} 45%, ${css("--paper")})"></i>medium</span><span><i></i>light</span><span><i style="border-color:${css("--pen")};border-width:2px"></i>rainy day</span></div>
      <p>P(Heavy${"<span data-g></span>"}) = <span class="big-result" aria-live="polite"></span></p></div>`;
    function draw(c) {
      $$(".chip", el).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.c === c)));
      $(".days", el).innerHTML = days.map((d) => `<i class="${d.w === "rain" ? "rain" : ""} ${d.t === "heavy" ? "heavy" : d.t === "med" ? "med" : ""} ${c !== "all" && d.w !== c ? "dim" : ""}"></i>`).join("");
      const kept = days.filter((d) => c === "all" || d.w === c), heavy = kept.filter((d) => d.t === "heavy").length;
      $("[data-g]", el).textContent = c === "all" ? "" : c === "rain" ? " | Rain" : " | No rain";
      $(".big-result", el).textContent = `${heavy} / ${kept.length} = ${fmt(heavy / kept.length, 2)}`;
    }
    el.addEventListener("click", (e) => { const b = e.target.closest("[data-c]"); if (b) draw(b.dataset.c); });
    draw("all");
  };

  /* ---------------- Week 6: Bayesian network with evidence ---------------- */
  W.bayesNet = function (el) {
    const ev = { R: null, S: null, W: null };
    const pR = 0.2, pS = (r) => (r ? 0.01 : 0.4), pW = (r, s) => (r && s ? 0.99 : r ? 0.8 : s ? 0.9 : 0);
    const NODES = { R: ["Rain", 70, 40], S: ["Sprinkler", 330, 40], W: ["Wet grass", 200, 190] };
    el.innerHTML = `<div class="widget"><svg viewBox="0 0 460 290" role="img" aria-label="Bayesian network: Rain and Sprinkler both point to Wet grass; Rain also points to Sprinkler"></svg><div class="readout" aria-live="polite"></div>
      <div class="widget-row"><button class="btn small quiet" data-clear>Clear evidence</button><button class="btn small quiet" data-ea>Show explaining away</button></div></div>`;
    function posterior() {
      const tot = { R: 0, S: 0, W: 0 }; let Z = 0;
      for (const r of [true, false]) for (const s of [true, false]) for (const w of [true, false]) {
        if ((ev.R !== null && ev.R !== r) || (ev.S !== null && ev.S !== s) || (ev.W !== null && ev.W !== w)) continue;
        const p = (r ? pR : 1 - pR) * (s ? pS(r) : 1 - pS(r)) * (w ? pW(r, s) : 1 - pW(r, s));
        Z += p; if (r) tot.R += p; if (s) tot.S += p; if (w) tot.W += p;
      }
      return Z > 0 ? { R: tot.R / Z, S: tot.S / Z, W: tot.W / Z, Z } : null;
    }
    function draw() {
      const post = posterior();
      const box = (k) => { const [name, x, y] = NODES[k], v = ev[k];
        const p = post ? post[k] : 0;
        return `<g class="bn-node ${v === true ? "ev-true" : v === false ? "ev-false" : ""}" data-k="${k}" tabindex="0" role="button" aria-label="${name}: ${v === null ? "unknown" : v}. Probability true ${pct(p, 1)}">
          <rect class="bn-box" x="${x - 4}" y="${y}" width="128" height="88" rx="6"/><text x="${x + 60}" y="${y + 18}" text-anchor="middle" font-weight="700">${name}</text>
          <text x="${x + 60}" y="${y + 36}" text-anchor="middle" font-size="12" style="fill:${css("--graphite")}">${v === null ? "unknown, click to set" : "observed: " + v}</text>
          <rect class="bn-track" x="${x + 6}" y="${y + 48}" width="108" height="10"/><rect class="bn-bar" x="${x + 6}" y="${y + 48}" width="${108 * p}" height="10"/>
          <text x="${x + 60}" y="${y + 76}" text-anchor="middle" font-size="12">P(true) = ${pct(p, 1)}</text></g>`; };
      const arr = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${css("--graphite")}" stroke-width="1.8" marker-end="url(#bnm)"/>`;
      $("svg", el).innerHTML = `<defs><marker id="bnm" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="${css("--graphite")}"/></marker></defs>
        ${arr(194, 84, 322, 84)}${arr(130, 128, 210, 186)}${arr(390, 128, 300, 186)}${box("R")}${box("S")}${box("W")}`;
      const evs = Object.entries(ev).filter(([, v]) => v !== null).map(([k, v]) => `${NODES[k][0]} = ${v}`);
      $(".readout", el).textContent = post ? `Evidence: ${evs.join(", ") || "none"}\nP(evidence) = ${fmt(post.Z, 5)}\nP(Rain | evidence) = ${fmt(post.R, 4)}   P(Sprinkler | evidence) = ${fmt(post.S, 4)}   P(Wet | evidence) = ${fmt(post.W, 4)}` : "This combination of evidence has probability 0 in the model (for example, wet grass with neither rain nor sprinkler). Change the evidence.";
    }
    const cycle = (k) => { ev[k] = ev[k] === null ? true : ev[k] === true ? false : null; draw(); };
    el.addEventListener("click", (e) => { const g = e.target.closest(".bn-node"); if (g) cycle(g.dataset.k); });
    el.addEventListener("keydown", (e) => { const g = e.target.closest && e.target.closest(".bn-node"); if (g && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); cycle(g.dataset.k); } });
    $("[data-clear]", el).addEventListener("click", () => { ev.R = ev.S = ev.W = null; draw(); });
    $("[data-ea]", el).addEventListener("click", () => { ev.R = null; ev.W = true; ev.S = true; draw(); $(".readout", el).textContent += "\nCompare: with Wet = true alone, P(Rain) is 35.8 %. Knowing the sprinkler was on drops it below 1 %."; });
    draw();
  };

  /* ---------------- Week 7: HMM over a sequence ---------------- */
  W.hmmChart = function (el) {
    const T = [[0.9, 0.1], [0.2, 0.8]], E = [[0.8, 0.2], [0.3, 0.7]], PI = [0.8, 0.2];
    let obs = [1, 1, 0, 1, 1, 1, 0, 0, 0, 1, 0, 0];   // 1 = HIGH
    el.innerHTML = `<div class="widget"><div class="seq" aria-label="Sensor readings; click one to flip it"></div>
      <div class="widget-row"><button class="btn small quiet" data-rand>Random readings</button><button class="btn small quiet" data-high>All HIGH</button><button class="btn small quiet" data-lect>Lecture: HIGH, HIGH</button></div>
      <svg class="plot-svg" viewBox="0 0 640 260" role="img" aria-label="Line chart of the probability of a fault over time"></svg>
      <div class="legend"><span><i style="background:${css("--red")}"></i>filtered P(Faulty)</span><span><i style="background:${css("--pen")}"></i>smoothed P(Faulty)</span><span><i style="background:${css("--ink")}"></i>Viterbi: Faulty</span></div></div>`;
    function compute() {
      const n = obs.length, f = [], b = Array(n);
      let a = [PI[0] * E[0][obs[0]], PI[1] * E[1][obs[0]]]; let z = a[0] + a[1]; f.push([a[0] / z, a[1] / z]);
      for (let t = 1; t < n; t++) { const p = f[t - 1]; a = [0, 1].map((j) => (p[0] * T[0][j] + p[1] * T[1][j]) * E[j][obs[t]]); z = a[0] + a[1]; f.push([a[0] / z, a[1] / z]); }
      b[n - 1] = [1, 1];
      for (let t = n - 2; t >= 0; t--) { const nb = [0, 1].map((i) => T[i][0] * E[0][obs[t + 1]] * b[t + 1][0] + T[i][1] * E[1][obs[t + 1]] * b[t + 1][1]); const s = nb[0] + nb[1]; b[t] = [nb[0] / s, nb[1] / s]; }
      const sm = f.map((x, t) => { const u = [x[0] * b[t][0], x[1] * b[t][1]], s = u[0] + u[1]; return u[1] / s; });
      let d = [Math.log(PI[0] * E[0][obs[0]]), Math.log(PI[1] * E[1][obs[0]])]; const back = [];
      for (let t = 1; t < n; t++) { const bp = [], nd = []; for (let j = 0; j < 2; j++) { const c0 = d[0] + Math.log(T[0][j]), c1 = d[1] + Math.log(T[1][j]); bp.push(c0 >= c1 ? 0 : 1); nd.push(Math.max(c0, c1) + Math.log(E[j][obs[t]])); } back.push(bp); d = nd; }
      let s = d[0] >= d[1] ? 0 : 1; const path = [s]; for (let t = back.length - 1; t >= 0; t--) { s = back[t][s]; path.unshift(s); }
      return { filt: f.map((x) => x[1]), sm, path };
    }
    function draw() {
      $(".seq", el).innerHTML = obs.map((o, t) => `<button class="obs-chip ${o ? "High" : "Normal"}" data-t="${t}" aria-label="Reading ${t + 1}: ${o ? "HIGH" : "NORMAL"}. Click to flip.">${t + 1}: ${o ? "HIGH" : "NORM"}</button>`).join("");
      const { filt, sm, path } = compute(), n = obs.length;
      const x = (t) => 50 + (n > 1 ? (t / (n - 1)) * 560 : 280), y = (p) => 200 - p * 170;
      let s = `<line class="axis" x1="50" y1="200" x2="610" y2="200"/><line class="axis" x1="50" y1="30" x2="50" y2="200"/>`;
      [0, 0.5, 1].forEach((p) => { s += `<line class="gridl" x1="50" y1="${y(p)}" x2="610" y2="${y(p)}"/><text class="lbl" x="44" y="${y(p) + 4}" text-anchor="end">${p}</text>`; });
      s += `<polyline class="curve3" style="stroke:${css("--pen")};stroke-width:2.5" points="${sm.map((p, t) => x(t) + "," + y(p)).join(" ")}"/>`;
      s += `<polyline class="curve2" points="${filt.map((p, t) => x(t) + "," + y(p)).join(" ")}"/>`;
      filt.forEach((p, t) => { s += `<circle cx="${x(t)}" cy="${y(p)}" r="3.5" fill="${css("--red")}"/>`; });
      path.forEach((st, t) => { s += `<rect x="${x(t) - 9}" y="220" width="18" height="18" fill="${st ? css("--ink") : css("--paper")}" stroke="${css("--ink")}"/><text class="lbl" x="${x(t)}" y="252" text-anchor="middle">${t + 1}</text>`; });
      s += `<text class="lbl" x="56" y="24">P(Faulty)</text><text class="lbl" x="610" y="214" text-anchor="end">time</text>`;
      $("svg", el).innerHTML = s;
    }
    el.addEventListener("click", (e) => { const b = e.target.closest("[data-t]"); if (b) { obs[+b.dataset.t] ^= 1; draw(); } });
    $("[data-rand]", el).addEventListener("click", () => { obs = obs.map(() => (Math.random() < 0.5 ? 1 : 0)); draw(); });
    $("[data-high]", el).addEventListener("click", () => { obs = obs.map(() => 1); draw(); });
    $("[data-lect]", el).addEventListener("click", () => { obs = [1, 1]; draw(); });
    draw();
  };

  /* ---------------- Week 8: regression ---------------- */
  W.regressionFit = function (el) {
    const X = [15, 20, 25, 30, 35], Y = [174, 201, 224, 251, 278], u = uid("rg");
    el.innerHTML = `<div class="widget">${slider(u + "w", "Slope w", 2, 8, 0.01, 4)}${slider(u + "b", "Intercept b", 40, 160, 0.1, 120)}
      <div class="widget-row"><button class="btn small primary" data-fit>Fit with least squares</button></div>
      <svg class="plot-svg" viewBox="0 0 600 320" role="img" aria-label="Scatter plot of consumption against temperature with the current line"></svg>
      <p>MSE = <span class="big-result" aria-live="polite"></span></p></div>`;
    const W_ = $("#" + u + "w", el), B_ = $("#" + u + "b", el);
    const sx = (x) => 60 + ((x - 10) / 30) * 500, sy = (y) => 290 - ((y - 140) / 160) * 260;
    function draw() {
      const w = +W_.value, b = +B_.value;
      $("#" + u + "w-o", el).textContent = fmt(w, 2); $("#" + u + "b-o", el).textContent = fmt(b, 1);
      let s = `<line class="axis" x1="60" y1="290" x2="570" y2="290"/><line class="axis" x1="60" y1="20" x2="60" y2="290"/>`;
      [15, 20, 25, 30, 35].forEach((x) => { s += `<text class="lbl" x="${sx(x)}" y="306" text-anchor="middle">${x} °C</text>`; });
      [150, 200, 250, 300].forEach((y) => { s += `<line class="gridl" x1="60" y1="${sy(y)}" x2="570" y2="${sy(y)}"/><text class="lbl" x="54" y="${sy(y) + 4}" text-anchor="end">${y}</text>`; });
      let se = 0;
      X.forEach((x, i) => {
        const yh = w * x + b, r = Y[i] - yh; se += r * r;
        const side = Math.abs(sy(Y[i]) - sy(yh));
        s += `<rect x="${sx(x)}" y="${Math.min(sy(Y[i]), sy(yh))}" width="${side}" height="${side}" fill="${css("--hl")}" opacity=".55" stroke="${css("--ink")}" stroke-width=".6"/>`;
        s += `<line x1="${sx(x)}" y1="${sy(Y[i])}" x2="${sx(x)}" y2="${sy(yh)}" stroke="${css("--red")}" stroke-width="1.5"/>`;
      });
      s += `<line class="curve" x1="${sx(10)}" y1="${sy(w * 10 + b)}" x2="${sx(40)}" y2="${sy(w * 40 + b)}"/>`;
      X.forEach((x, i) => { s += `<circle cx="${sx(x)}" cy="${sy(Y[i])}" r="5.5" fill="${css("--ink")}"/>`; });
      s += `<text class="lbl" x="66" y="16">consumption (kWh)</text><text class="lbl" x="566" y="40" text-anchor="end">ŷ = ${fmt(w, 2)}x + ${fmt(b, 1)}</text>`;
      $("svg", el).innerHTML = s;
      $(".big-result", el).textContent = fmt(se / X.length, 2) + (Math.abs(w - 5.16) < 0.006 && Math.abs(b - 96.6) < 0.06 ? " (the minimum)" : "");
    }
    W_.addEventListener("input", draw); B_.addEventListener("input", draw);
    $("[data-fit]", el).addEventListener("click", () => { W_.value = 5.16; B_.value = 96.6; draw(); });
    draw();
  };

  /* ---------------- Week 8: K-Means ---------------- */
  W.kmeans = function (el) {
    const r = rng(5), centers = [[2.5, 7], [7, 7.5], [5, 2.5]], pts = [];
    centers.forEach(([cx, cy]) => { for (let i = 0; i < 22; i++) { const a = r() * 6.283, d = Math.sqrt(-2 * Math.log(r() + 1e-9)) * 0.9; pts.push([cx + d * Math.cos(a), cy + d * Math.sin(a)]); } });
    const u = uid("km"); let K = 3, cent, lab, phase, J = [];
    el.innerHTML = `<div class="widget"><div class="widget-row"><label for="${u}k">K</label><select id="${u}k">${[2, 3, 4, 5].map((k) => `<option ${k === 3 ? "selected" : ""}>${k}</option>`).join("")}</select>
      <button class="btn small primary" data-st>Step</button><button class="btn small" data-run>Run to convergence</button><button class="btn small quiet" data-new>New random centroids</button></div>
      <div class="two-col"><svg class="plot-svg" data-p viewBox="0 0 300 300" role="img" aria-label="Scatter plot of points coloured by cluster"></svg><svg class="plot-svg" data-j viewBox="0 0 300 300" role="img" aria-label="Objective J after each step"></svg></div>
      <div class="readout" aria-live="polite"></div></div>`;
    const COLORS = () => [css("--pen"), css("--red"), css("--green"), css("--tok-num"), css("--tok-kw")];
    const d2 = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2;
    const obj = () => pts.reduce((s, p, i) => s + (lab[i] >= 0 ? d2(p, cent[lab[i]]) : 0), 0);
    function init() { cent = Array.from({ length: K }, () => pts[Math.floor(Math.random() * pts.length)].slice()); lab = pts.map(() => -1); phase = "assign"; J = []; draw("Centroids placed on random points. Next step: assign."); }
    function step() {
      if (phase === "assign") {
        const nl = pts.map((p) => { let b = 0; cent.forEach((c, k) => { if (d2(p, c) < d2(p, cent[b])) b = k; }); return b; });
        const changed = nl.some((v, i) => v !== lab[i]); lab = nl; J.push(obj()); phase = "update";
        draw(changed ? "Assigned each point to its nearest centroid. Next step: update." : "No point changed cluster: K-Means has converged."); return changed;
      }
      cent = cent.map((c, k) => { const m = pts.filter((_, i) => lab[i] === k); return m.length ? [m.reduce((s, p) => s + p[0], 0) / m.length, m.reduce((s, p) => s + p[1], 0) / m.length] : c; });
      J.push(obj()); phase = "assign"; draw("Moved each centroid to the mean of its points. Next step: assign."); return true;
    }
    function draw(msg) {
      const C = COLORS(), sx = (x) => 15 + x * 27, sy = (y) => 285 - y * 27;
      $("[data-p]", el).innerHTML = pts.map((p, i) => `<circle cx="${sx(p[0])}" cy="${sy(p[1])}" r="4" fill="${lab[i] >= 0 ? C[lab[i]] : css("--graphite")}" opacity=".85"/>`).join("") +
        cent.map((c, k) => `<g transform="translate(${sx(c[0])} ${sy(c[1])})"><path d="M-9 -9L9 9M9 -9L-9 9" stroke="${css("--paper")}" stroke-width="6"/><path d="M-9 -9L9 9M9 -9L-9 9" stroke="${C[k]}" stroke-width="3.5"/></g>`).join("");
      const mx = Math.max(...J, 1), n = Math.max(J.length - 1, 1);
      $("[data-j]", el).innerHTML = `<line class="axis" x1="40" y1="260" x2="290" y2="260"/><line class="axis" x1="40" y1="30" x2="40" y2="260"/><text class="lbl" x="44" y="24">objective J</text><text class="lbl" x="290" y="280" text-anchor="end">step</text>` +
        (J.length ? `<polyline class="curve" points="${J.map((v, i) => `${40 + (i / n) * 250},${260 - (v / mx) * 220}`).join(" ")}"/>` + J.map((v, i) => `<circle class="marker" cx="${40 + (i / n) * 250}" cy="${260 - (v / mx) * 220}" r="3.5"/>`).join("") : "");
      $(".readout", el).textContent = `${msg}${J.length ? `\nJ = ${fmt(J[J.length - 1], 2)}` : ""}`;
    }
    $("#" + u + "k", el).addEventListener("change", (e) => { K = +e.target.value; init(); });
    $("[data-st]", el).addEventListener("click", step);
    $("[data-run]", el).addEventListener("click", () => { let k = 0; while (step() && k++ < 100); });
    $("[data-new]", el).addEventListener("click", init);
    init();
  };

  /* ---------------- Week 9: neural network playground ---------------- */
  W.nnPlayground = function (el) {
    const u = uid("nn");
    el.innerHTML = `<div class="widget"><div class="widget-row"><label for="${u}d">Data</label><select id="${u}d"><option value="xor">XOR (four corners)</option><option value="circle">Circle</option><option value="line">Linearly separable</option></select>
      <label for="${u}h">Hidden units</label><select id="${u}h">${[1, 2, 3, 4, 6, 8].map((h) => `<option ${h === 4 ? "selected" : ""}>${h}</option>`).join("")}</select>
      <button class="btn small primary" data-go>Train</button><button class="btn small quiet" data-re>Reset weights</button></div>
      ${slider(u + "lr", "Learning rate", 0.05, 2, 0.05, 0.5)}
      <div class="nn-wrap"><canvas width="280" height="280" aria-label="Decision boundary" role="img"></canvas><div><svg class="plot-svg" data-net viewBox="0 0 320 170" role="img" aria-label="Network diagram"></svg><svg class="plot-svg" data-loss viewBox="0 0 320 140" role="img" aria-label="Loss curve"></svg></div></div>
      <div class="readout" aria-live="polite"></div></div>`;
    let data, H, W1, b1, W2, b2, losses, epoch, timer = null, rand;
    function makeData(kind) {
      const r = rng(3), out = [];
      for (let i = 0; i < 160; i++) {
        const x = r() * 2 - 1, y = r() * 2 - 1;
        let c = kind === "xor" ? (x * y > 0 ? 1 : 0) : kind === "circle" ? (x * x + y * y < 0.45 ? 1 : 0) : (y > 0.6 * x - 0.1 ? 1 : 0);
        if (kind === "xor" && (Math.abs(x) < 0.08 || Math.abs(y) < 0.08)) continue;
        out.push([x, y, c]);
      }
      return out;
    }
    function init() {
      rand = rng(7); H = +$("#" + u + "h", el).value; data = makeData($("#" + u + "d", el).value);
      const g = () => (rand() * 2 - 1) * 1.2;
      W1 = Array.from({ length: H }, () => [g(), g()]); b1 = Array.from({ length: H }, () => g() * 0.3);
      W2 = Array.from({ length: H }, g); b2 = 0; losses = []; epoch = 0; draw();
    }
    const sig = (z) => 1 / (1 + Math.exp(-z));
    function forward(x, y) { const h = W1.map((w, j) => Math.tanh(w[0] * x + w[1] * y + b1[j])); const o = sig(h.reduce((s, v, j) => s + v * W2[j], b2)); return [h, o]; }
    function trainEpoch() {
      const lr = +$("#" + u + "lr", el).value, gW1 = W1.map(() => [0, 0]), gb1 = b1.map(() => 0), gW2 = W2.map(() => 0); let gb2 = 0, L = 0;
      data.forEach(([x, y, c]) => {
        const [h, o] = forward(x, y), d = o - c;              // cross-entropy + sigmoid gradient
        L += -(c * Math.log(o + 1e-9) + (1 - c) * Math.log(1 - o + 1e-9));
        gb2 += d;
        h.forEach((hv, j) => { gW2[j] += d * hv; const dh = d * W2[j] * (1 - hv * hv); gW1[j][0] += dh * x; gW1[j][1] += dh * y; gb1[j] += dh; });
      });
      const n = data.length;
      W2 = W2.map((w, j) => w - (lr * gW2[j]) / n); b2 -= (lr * gb2) / n;
      W1 = W1.map((w, j) => [w[0] - (lr * gW1[j][0]) / n, w[1] - (lr * gW1[j][1]) / n]); b1 = b1.map((b, j) => b - (lr * gb1[j]) / n);
      losses.push(L / n); epoch++;
    }
    function draw() {
      const cv = $("canvas", el), ctx = cv.getContext("2d"), S = 280, G = 56, cell = S / G;
      const c1 = css("--pen"), c0 = css("--red"), paper = css("--paper");
      ctx.fillStyle = paper; ctx.fillRect(0, 0, S, S);
      for (let i = 0; i < G; i++) for (let j = 0; j < G; j++) {
        const x = (i + 0.5) / G * 2 - 1, y = 1 - (j + 0.5) / G * 2, o = forward(x, y)[1];
        ctx.fillStyle = o > 0.5 ? c1 : c0; ctx.globalAlpha = Math.abs(o - 0.5) * 0.6; ctx.fillRect(i * cell, j * cell, cell + 0.5, cell + 0.5);
      }
      ctx.globalAlpha = 1;
      data.forEach(([x, y, c]) => { ctx.beginPath(); ctx.arc((x + 1) / 2 * S, (1 - y) / 2 * S, 3.6, 0, 7); ctx.fillStyle = c ? c1 : c0; ctx.fill(); ctx.strokeStyle = paper; ctx.lineWidth = 1.2; ctx.stroke(); });
      // network diagram
      const inY = [55, 115], hy = (j) => 20 + (H === 1 ? 65 : (j * 130) / (H - 1)), wcol = (w) => (w >= 0 ? c1 : c0), ww = (w) => Math.min(6, 0.6 + Math.abs(w) * 1.4);
      let s = "";
      W1.forEach((w, j) => { s += `<line x1="40" y1="${inY[0]}" x2="160" y2="${hy(j)}" stroke="${wcol(w[0])}" stroke-width="${ww(w[0])}" opacity=".75"/><line x1="40" y1="${inY[1]}" x2="160" y2="${hy(j)}" stroke="${wcol(w[1])}" stroke-width="${ww(w[1])}" opacity=".75"/>`; s += `<line x1="160" y1="${hy(j)}" x2="280" y2="85" stroke="${wcol(W2[j])}" stroke-width="${ww(W2[j])}" opacity=".75"/>`; });
      ["x₁", "x₂"].forEach((t, i) => { s += `<circle cx="40" cy="${inY[i]}" r="13" fill="${paper}" stroke="${css("--ink")}"/><text x="40" y="${inY[i] + 4}" text-anchor="middle" font-size="12">${t}</text>`; });
      W1.forEach((_, j) => { s += `<circle cx="160" cy="${hy(j)}" r="11" fill="${paper}" stroke="${css("--ink")}"/><text x="160" y="${hy(j) + 4}" text-anchor="middle" font-size="10">tanh</text>`; });
      s += `<circle cx="280" cy="85" r="13" fill="${paper}" stroke="${css("--ink")}"/><text x="280" y="89" text-anchor="middle" font-size="12">ŷ</text>`;
      $("[data-net]", el).innerHTML = s;
      const mx = Math.max(...losses, 0.8), n = Math.max(losses.length - 1, 1);
      $("[data-loss]", el).innerHTML = `<line class="axis" x1="34" y1="118" x2="310" y2="118"/><line class="axis" x1="34" y1="10" x2="34" y2="118"/><text class="lbl" x="38" y="14">loss</text><text class="lbl" x="310" y="134" text-anchor="end">epochs</text>` +
        (losses.length > 1 ? `<polyline class="curve2" points="${losses.map((v, i) => `${34 + (i / n) * 276},${118 - (v / mx) * 104}`).join(" ")}"/>` : "");
      const acc = data.filter(([x, y, c]) => (forward(x, y)[1] > 0.5 ? 1 : 0) === c).length / data.length;
      $(".readout", el).textContent = `epoch ${epoch}   loss ${losses.length ? fmt(losses[losses.length - 1], 4) : "–"}   training accuracy ${pct(acc, 1)}` + (H === 1 && $("#" + u + "d", el).value !== "line" ? "\nWith one hidden unit the boundary is (almost) a single line, so XOR and the circle cannot be learned." : "");
      $("#" + u + "lr-o", el).textContent = fmt($("#" + u + "lr", el).value, 2);
    }
    function stop() { if (timer) { clearInterval(timer); timer = null; } $("[data-go]", el).textContent = "Train"; }
    $("[data-go]", el).addEventListener("click", () => {
      if (timer) return stop();
      if (reduceMotion) { for (let i = 0; i < 600; i++) trainEpoch(); return draw(); }
      $("[data-go]", el).textContent = "Pause";
      timer = setInterval(() => { for (let i = 0; i < 10; i++) trainEpoch(); draw(); if (epoch >= 3000) stop(); }, 40);
    });
    $("[data-re]", el).addEventListener("click", () => { stop(); init(); });
    $("#" + u + "d", el).addEventListener("change", () => { stop(); init(); });
    $("#" + u + "h", el).addEventListener("change", () => { stop(); init(); });
    $("#" + u + "lr", el).addEventListener("input", () => { $("#" + u + "lr-o", el).textContent = fmt($("#" + u + "lr", el).value, 2); });
    init();
  };

  /* ---------------- Week 9: activation functions ---------------- */
  W.activations = function (el) {
    const u = uid("ac");
    const F = { step: [(z) => (z > 0 ? 1 : 0), "--graphite"], sigmoid: [(z) => 1 / (1 + Math.exp(-z)), "--pen"], tanh: [Math.tanh, "--green"], ReLU: [(z) => Math.max(0, z), "--red"] };
    el.innerHTML = `<div class="widget"><div class="widget-row">${Object.keys(F).map((k) => `<label><input type="checkbox" data-f="${k}" checked> ${k}</label>`).join("")}</div>
      ${slider(u + "z", "Input z", -4, 4, 0.1, 1)}
      <svg class="plot-svg" viewBox="0 0 600 260" role="img" aria-label="Plot of activation functions"></svg><div class="readout" aria-live="polite"></div></div>`;
    function draw() {
      const z0 = +$("#" + u + "z", el).value, sx = (z) => 300 + z * 65, sy = (v) => 170 - v * 70;
      let s = `<line class="axis" x1="30" y1="${sy(0)}" x2="570" y2="${sy(0)}"/><line class="axis" x1="300" y1="15" x2="300" y2="250"/>`;
      [-1, 1, 2].forEach((v) => { s += `<line class="gridl" x1="30" y1="${sy(v)}" x2="570" y2="${sy(v)}"/><text class="lbl" x="294" y="${sy(v) + 4}" text-anchor="end">${v}</text>`; });
      [-4, -2, 2, 4].forEach((z) => { s += `<text class="lbl" x="${sx(z)}" y="${sy(0) + 16}" text-anchor="middle">${z}</text>`; });
      s += `<line x1="${sx(z0)}" y1="15" x2="${sx(z0)}" y2="250" stroke="${css("--hl")}" stroke-width="3"/>`;
      const out = [];
      $$("[data-f]", el).forEach((cb) => {
        if (!cb.checked) return;
        const [f, c] = F[cb.dataset.f]; let d = "";
        for (let z = -4; z <= 4.001; z += 0.02) { const v = Math.max(-1.3, Math.min(2.2, f(z))); d += (d ? " L" : "M") + sx(z).toFixed(1) + " " + sy(v).toFixed(1); }
        s += `<path d="${d}" fill="none" stroke="${css(c)}" stroke-width="2.6"/><circle cx="${sx(z0)}" cy="${sy(Math.min(2.2, f(z0)))}" r="5" fill="${css(c)}"/>`;
        out.push(`${cb.dataset.f.padEnd(8)}(${fmt(z0, 1)}) = ${fmt(f(z0), 3)}`);
      });
      $("svg", el).innerHTML = s;
      $("#" + u + "z-o", el).textContent = fmt(z0, 1);
      $(".readout", el).textContent = out.join("\n") || "Tick at least one function.";
    }
    $$("input", el).forEach((x) => x.addEventListener("input", draw));
    draw();
  };

  /* ---------------- Week 10: attention ---------------- */
  W.attention = function (el) {
    const tok = ["The", "robot", "picked", "up", "the", "box", "because", "it", "was", "light"];
    // Illustrative relevance scores (not from a trained model)
    const rel = { robot: { The: 2 }, picked: { robot: 2.2, box: 1.8, up: 1.2 }, up: { picked: 2.4 }, box: { the: 1.6, picked: 1.4 }, because: { picked: 1, light: 1 }, it: { box: 3.2, robot: 1.4, light: 0.6 }, was: { it: 2 }, light: { box: 2.4, it: 1.8 }, the: { box: 1.5 }, The: { robot: 1.5 } };
    const scores = tok.map((a, i) => tok.map((b, j) => (i === j ? 1 : 0) + ((rel[a] || {})[b] || 0) - Math.abs(i - j) * 0.12));
    const W = scores.map((row) => { const m = Math.max(...row), e = row.map((x) => Math.exp(x - m)), s = e.reduce((p, q) => p + q, 0); return e.map((x) => x / s); });
    let sel = 7;
    el.innerHTML = `<div class="widget"><span class="am-badge">from extra sources, illustrative weights</span><div class="attn-tokens" role="group" aria-label="Choose a word"></div>
      <div class="token-bars"></div>
      <h3>All words at once</h3><div class="table-wrap"><table class="heat"></table></div></div>`;
    const pen = css("--pen");
    function draw() {
      $(".attn-tokens", el).innerHTML = tok.map((t, i) => `<button aria-pressed="${i === sel}" data-i="${i}" style="background:color-mix(in srgb, ${pen} ${Math.round(W[sel][i] * 90)}%, ${css("--paper")})">${t}</button>`).join("");
      $(".token-bars", el).innerHTML = `<p>“${tok[sel]}” attends to:</p>` + tok.map((t, i) => ({ t, w: W[sel][i] })).sort((a, b) => b.w - a.w).slice(0, 5).map(({ t, w }) => `<div class="tb"><span><strong>${t}</strong></span><div class="track"><div class="fill" style="width:${(w * 100).toFixed(1)}%"></div></div><output>${pct(w, 1)}</output></div>`).join("");
      $(".heat", el).innerHTML = `<thead><tr><th scope="col">query ↓ / key →</th>${tok.map((t) => `<th scope="col">${t}</th>`).join("")}</tr></thead><tbody>${W.map((row, i) => `<tr><th scope="row">${tok[i]}</th>${row.map((w) => `<td style="background:color-mix(in srgb, ${pen} ${Math.round(w * 90)}%, ${css("--paper")});${w > 0.45 ? `color:${css("--paper")}` : ""}">${fmt(w, 2)}</td>`).join("")}</tr>`).join("")}</tbody>`;
    }
    el.addEventListener("click", (e) => { const b = e.target.closest("[data-i]"); if (b) { sel = +b.dataset.i; draw(); } });
    draw();
  };

  window.ATLAS_VISUALS = { widgets: W, byWeek };
})();
