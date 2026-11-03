/* =====================================================================
   THE THINKING MACHINE ATLAS — script.js
   Application logic. Content lives in js/content-*.js, Python labs in
   js/labs.js, extra figures in js/visuals.js (all on window.BOOK / window.ATLAS_VISUALS).

   Sections:
     1. Helpers and storage
     2. Page registry and router
     3. Shared components (Qai, contents, quiz, code, Python runner)
     4. Page renderers (cover, chapter, reference pages)
     5. Interactive widgets (one main figure per chapter)
     6. Boot
   No library is required. Optional: Pyodide (Python in the browser) is
   loaded from cdn.jsdelivr.net only when a reader presses "Run"; if it
   cannot load, the saved output of each lab is shown instead.
   ===================================================================== */
(function () {
  "use strict";

  const BOOK = window.BOOK;
  const CH = BOOK.chapters.slice().sort((a, b) => a.week - b.week);

  /* ------------------------------------------------------------------
     1. Helpers and storage
     ------------------------------------------------------------------ */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const fmt = (x, d = 2) => Number(x).toFixed(d);
  const pct = (x, d = 1) => (100 * x).toFixed(d) + " %";
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const dot = (s) => String(s).replace(/\s·\s/g, ": ");   // "Station 2 · Name" → "Station 2: Name"

  /** Safe localStorage wrapper: the book works even if storage is blocked. */
  const store = {
    get(key, fallback) {
      try { const v = localStorage.getItem("atlas-" + key); return v ? JSON.parse(v) : fallback; }
      catch (e) { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem("atlas-" + key, JSON.stringify(value)); } catch (e) { /* ignore */ }
    }
  };
  const visited = new Set(store.get("visited", []));
  const scores = store.get("scores", {});

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  /** Turn HTML entities in authored code (&lt; …) back into plain text. */
  function decode(html) { const t = document.createElement("textarea"); t.innerHTML = html; return t.value; }

  /* ------------------------------------------------------------------
     2. Page registry and router (hash-based, works offline)
     ------------------------------------------------------------------ */
  const SHORT = ["Agents and environments", "Search and A*", "Local search", "Games", "MDPs and RL", "Probability", "Hidden Markov models", "Decisions and classical ML", "Neural networks", "Generative AI and safety"];

  const PAGES = [
    { id: "home", title: "Cover and contents", group: "Start", render: renderHome },
    ...CH.map((c) => ({ id: c.id, title: c.title, short: SHORT[c.week - 1], num: c.week, group: "Ten stations", am: !!c.sourceWarning, render: (root) => renderChapter(c, root) })),
    { id: "realworld", title: "AI in the real world", group: "Looking back", render: renderRealWorld },
    { id: "risks", title: "Limitations and risks", group: "Looking back", render: renderRisks },
    { id: "ethics", title: "Ethics and responsible AI", group: "Looking back", render: renderEthics },
    { id: "compare", title: "Algorithm comparison", group: "Reference", render: renderCompare },
    { id: "timeline", title: "AI timeline", group: "Reference", render: renderTimeline },
    { id: "glossary", title: "Glossary", group: "Reference", render: renderGlossary },
    { id: "final-quiz", title: "Final quiz", group: "Reference", render: renderFinalQuiz },
    { id: "sources", title: "Sources", group: "About this book", render: renderSources },
    { id: "disclosure", title: "AI use disclosure", group: "About this book", render: renderDisclosure },
    { id: "about", title: "Course map and how to use", group: "About this book", render: renderAbout }
  ];
  const pageIndex = (id) => PAGES.findIndex((p) => p.id === id);
  let stopCover = null;          // stops the cover animation when leaving the page

  function currentId() {
    const id = (location.hash || "#home").slice(1).split("/")[0];
    return pageIndex(id) >= 0 ? id : "home";
  }

  function route() {
    if (stopCover) { stopCover(); stopCover = null; }
    const id = currentId();
    const page = PAGES[pageIndex(id)];
    const app = $("#app");
    app.innerHTML = "";
    const wrap = document.createElement("div");
    wrap.className = "page";
    app.appendChild(wrap);
    page.render(wrap);
    if (id !== "home") wrap.appendChild(pager(id));
    document.title = (id === "home" ? "" : page.title + " | ") + "The Thinking Machine Atlas";
    if (id.startsWith("week-")) { visited.add(id); store.set("visited", [...visited]); }
    updateProgress();
    buildToc();
    closeMenu();
    enhance(wrap);
    window.scrollTo({ top: 0, behavior: "auto" });
    app.focus({ preventScroll: true });
  }

  /* ------------------------------------------------------------------
     3. Shared components
     ------------------------------------------------------------------ */
  function buildToc() {
    const cur = currentId();
    const groups = [];
    PAGES.forEach((p) => {
      let g = groups.find((x) => x.name === p.group);
      if (!g) { g = { name: p.group, items: [] }; groups.push(g); }
      g.items.push(p);
    });
    $("#toc").innerHTML = groups.map((g) =>
      `<div class="toc-group"><p class="toc-title">${g.name}</p><div class="toc">` +
      g.items.map((p) => {
        const isCur = p.id === cur ? ' aria-current="page"' : "";
        const vis = visited.has(p.id) ? " visited" : "";
        const am = p.am ? `<span class="am-dot" title="Written from Additional Material">extra</span>` : "";
        const sr = visited.has(p.id) ? '<span class="sr-only"> (visited)</span>' : "";
        return `<a href="#${p.id}" class="${vis}"${isCur}><span class="num" aria-hidden="true">${p.num || ""}</span><span>${p.num ? p.short : p.title}${sr}</span>${am}</a>`;
      }).join("") + `</div></div>`
    ).join("");
  }

  function updateProgress() {
    const n = CH.filter((c) => visited.has(c.id)).length;
    $("#jpBar").setAttribute("aria-valuenow", n);
    $("#jpLabel").textContent = n === 0 ? "not started yet" : n === 10 ? "all 10 stations visited" : `${n} of 10 stations visited`;
  }

  /** Qai, the guide (original line drawing, inks follow the theme). */
  function qaiSvg(size = 64) {
    return `<svg viewBox="0 0 76 76" width="${size}" height="${size}" role="img" aria-label="Qai, the robot guide" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M38 6v10"/><circle cx="38" cy="5" r="3"/>
      <path d="M14 22c0-4 3-6 7-6h34c4 0 7 2 7 6v32c0 4-3 6-7 6H21c-4 0-7-2-7-6z"/>
      <circle cx="29" cy="37" r="4.5"/><circle cx="47" cy="37" r="4.5"/>
      <path d="M30 49c5 4 11 4 16 0"/><path d="M8 32v12M68 32v12"/><path d="M28 60v8h20v-8"/>
    </svg>`;
  }

  function pager(id) {
    const i = pageIndex(id);
    const prev = PAGES[i - 1], next = PAGES[i + 1];
    const label = (p) => (p.num ? `${p.num}. ${p.title}` : p.title);
    const el = document.createElement("nav");
    el.className = "pager";
    el.setAttribute("aria-label", "Previous and next page");
    el.innerHTML =
      (prev ? `<a class="prev" href="#${prev.id}"><small>Previous</small><span>${label(prev)}</span></a>` : "<span></span>") +
      (next ? `<a class="next" href="#${next.id}"><small>Next</small><span>${label(next)}</span></a>` : "");
    return el;
  }

  function stationStrip(week) {
    return `<nav aria-label="Stations"><ol class="station-strip">${CH.map((c) => `<li><a href="#${c.id}" class="${visited.has(c.id) ? "visited" : ""}" ${c.week === week ? 'aria-current="page"' : ""} title="${c.week}. ${esc(c.title)}">${c.week}</a></li>`).join("")}</ol></nav>`;
  }

  /** Random order of option indices. */
  function shuffled(n) {
    const a = [...Array(n).keys()];
    for (let i = n - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }

  /** Quiz styled as an exam sheet; instant feedback with explanation. */
  function quiz(container, questions, key, opts = {}) {
    const answered = new Array(questions.length).fill(null);
    const id = "q" + Math.random().toString(36).slice(2, 7);
    container.innerHTML = questions.map((q, i) => `
      <div class="quiz-q" data-i="${i}">
        <fieldset>
          <legend><span class="qnum">${i + 1}.</span>${opts.weekTag && q.w ? `<span class="sr-only">Week ${q.w}. </span>` : ""}${q.q}${opts.weekTag && q.w ? ` <a class="badge course" href="#week-${q.w}">week ${q.w}</a>` : ""}</legend>
          ${shuffled(q.o.length).map((j) => `<label class="opt"><input type="radio" name="${id}-${i}" value="${j}"><span class="box" aria-hidden="true"></span><span class="t">${q.o[j]}</span><span class="verdict" aria-hidden="true"></span></label>`).join("")}
        </fieldset>
        <div class="feedback" role="status" aria-live="polite"></div>
      </div>`).join("") +
      `<div class="quiz-actions"><span class="score" aria-live="polite"></span>
        <span class="score-pill" data-best></span>
        <button class="btn small quiet" data-act="reveal">Show all answers</button>
        <button class="btn small quiet" data-act="reset">Start again</button></div>
      <div class="quiz-result"></div>`;
    const scoreEl = $(".score", container), bestEl = $("[data-best]", container);
    const showBest = () => { const b = scores[key]; bestEl.textContent = b != null ? `best so far: ${b} of ${questions.length}` : ""; };
    showBest();
    function mark(i, choice, reveal) {
      const q = questions[i], box = $(`.quiz-q[data-i="${i}"]`, container);
      $$(".opt", box).forEach((lab) => {
        const j = +$("input", lab).value;
        lab.classList.toggle("correct", j === q.a);
        lab.classList.toggle("wrong", j === choice && choice !== q.a);
        $(".verdict", lab).textContent = j === q.a ? "✓" : j === choice ? "✗" : "";
        $("input", lab).disabled = true;
      });
      const fb = $(".feedback", box);
      fb.className = "feedback show";
      fb.innerHTML = (reveal && choice == null ? "<strong>Answer.</strong> " : choice === q.a ? "<strong>Correct.</strong> " : "<strong>Not this one.</strong> ") + q.e;
    }
    function update() {
      const done = answered.filter((x) => x !== null).length;
      const right = answered.filter((x, i) => x === questions[i].a).length;
      scoreEl.textContent = done ? `${right} / ${questions.length}` : "";
      if (done === questions.length) {
        if (scores[key] == null || right > scores[key]) { scores[key] = right; store.set("scores", scores); }
        showBest();
        if (opts.onComplete) opts.onComplete(right, answered, $(".quiz-result", container));
      }
    }
    container.addEventListener("change", (e) => {
      if (e.target.type !== "radio") return;
      const i = +e.target.closest(".quiz-q").dataset.i;
      if (answered[i] !== null) return;
      answered[i] = +e.target.value;
      mark(i, answered[i], false);
      update();
    });
    container.addEventListener("click", (e) => {
      const act = e.target.dataset && e.target.dataset.act;
      if (act === "reveal") questions.forEach((q, i) => { if (answered[i] === null) mark(i, null, true); });
      if (act === "reset") quiz(container, questions, key, opts);
    });
  }

  /* ---- Python syntax highlighting (small, dependency-free) ---- */
  const PY_KW = /^(def|return|if|elif|else|for|while|in|not|and|or|import|from|as|lambda|True|False|None|break|continue|class|with|try|except|is|yield|global|pass|print)$/;
  function highlightLine(line) {
    const re = /(#.*$)|([rfbu]?"(?:[^"\\]|\\.)*"|[rfbu]?'(?:[^'\\]|\\.)*')|([A-Za-z_]\w*)(?=\s*\()|([A-Za-z_]\w*)|(\b\d+\.?\d*(?:e-?\d+)?\b)/g;
    let out = "", last = 0, m;
    while ((m = re.exec(line))) {
      out += esc(line.slice(last, m.index));
      const [tok] = m;
      if (m[1]) out += `<span class="t-com">${esc(tok)}</span>`;
      else if (m[2]) out += `<span class="t-str">${esc(tok)}</span>`;
      else if (m[3]) out += PY_KW.test(tok) ? `<span class="t-kw">${tok}</span>` : `<span class="t-fn">${tok}</span>`;
      else if (m[4]) out += PY_KW.test(tok) ? `<span class="t-kw">${tok}</span>` : esc(tok);
      else if (m[5]) out += `<span class="t-num">${tok}</span>`;
      last = m.index + tok.length;
    }
    return out + esc(line.slice(last));
  }
  const codeHTML = (src) => `<pre class="code" tabindex="0"><code>${src.split("\n").map((l) => `<span class="ln">${highlightLine(l) || " "}</span>`).join("")}</code></pre>`;

  /* ---- Optional in-browser Python (Pyodide) ---- */
  const PYODIDE = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/";
  let pyPromise = null;
  function loadPython() {
    if (pyPromise) return pyPromise;
    pyPromise = new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("timed out")), 90000);
      const s = document.createElement("script");
      s.src = PYODIDE + "pyodide.js";
      s.onload = async () => {
        try { const py = await window.loadPyodide({ indexURL: PYODIDE }); clearTimeout(timer); resolve(py); }
        catch (e) { clearTimeout(timer); reject(e); }
      };
      s.onerror = () => { clearTimeout(timer); reject(new Error("could not download Python")); };
      document.head.appendChild(s);
    });
    pyPromise.catch(() => { pyPromise = null; });
    return pyPromise;
  }
  async function runPython(code, onStatus) {
    onStatus("Loading Python (first run takes a few seconds)…");
    const py = await loadPython();
    onStatus("Loading libraries…");
    await py.loadPackagesFromImports(code);
    let out = "";
    py.setStdout({ batched: (s) => { out += s + "\n"; } });
    py.setStderr({ batched: (s) => { out += s + "\n"; } });
    onStatus("Running…");
    try { await py.runPythonAsync(code); }
    catch (e) { out += String(e.message || e).trim().split("\n").slice(-4).join("\n"); }
    return out.replace(/\s+$/, "");
  }

  /** One Python lab: highlighted code, Run / Edit / Copy, saved output. */
  function labHTML(lab, n) {
    return `<section class="lab" aria-labelledby="lab-${n.replace(".", "-")}">
      <h3 id="lab-${n.replace(".", "-")}"><span class="lab-n">Lab ${n}</span>${lab.title}</h3>
      <p>${lab.intro}</p>
      <div class="code-wrap" data-lab>${codeHTML(lab.code)}</div>
      <div class="lab-bar">
        <button class="btn small primary" data-run>Run in browser</button>
        <button class="btn small quiet" data-edit>Edit code</button>
        <button class="btn small quiet" data-copy>Copy</button>
        <span class="status" aria-live="polite"></span>
      </div>
      <div class="lab-out"><div class="out-label">output</div><pre>${esc(lab.output)}</pre></div>
    </section>`;
  }
  function wireLab(sec, lab) {
    let code = lab.code, editing = false;
    const wrap = $("[data-lab]", sec), status = $(".status", sec), out = $(".lab-out pre", sec), label = $(".out-label", sec);
    $("[data-edit]", sec).addEventListener("click", (e) => {
      if (!editing) {
        wrap.innerHTML = `<label class="sr-only" for="${sec.id}-ta">Edit the Python code</label><textarea spellcheck="false">${esc(code)}</textarea>`;
        e.target.textContent = "Done editing"; editing = true; $("textarea", wrap).focus();
      } else {
        code = $("textarea", wrap).value; wrap.innerHTML = codeHTML(code);
        e.target.textContent = "Edit code"; editing = false;
      }
    });
    $("[data-copy]", sec).addEventListener("click", (e) => {
      const text = editing ? $("textarea", wrap).value : code;
      const ok = () => { e.target.textContent = "Copied"; setTimeout(() => (e.target.textContent = "Copy"), 1400); };
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(ok, () => fallbackCopy(text, ok));
      else fallbackCopy(text, ok);
    });
    $("[data-run]", sec).addEventListener("click", async (e) => {
      const btn = e.target; btn.disabled = true;
      const src = editing ? $("textarea", wrap).value : code;
      try {
        const result = await runPython(src, (s) => (status.textContent = s));
        out.textContent = result || "(no output)";
        label.textContent = "output, just now in your browser";
        status.textContent = "Done. Results can differ slightly from the saved output with other library versions.";
      } catch (err) {
        label.textContent = "output (saved)";
        status.textContent = "Python could not be loaded here (" + err.message + "). The saved output below was produced by running this exact code.";
      }
      btn.disabled = false;
    });
  }

  /** Wire code copy buttons on algorithm snippets, widgets, scroll links. */
  function enhance(root) {
    $$("[data-widget]", root).forEach((el) => { const w = WIDGETS[el.dataset.widget]; if (w) w(el); });
    $$("[data-scroll]", root).forEach((a) => a.addEventListener("click", (e) => {
      e.preventDefault();
      const t = document.getElementById(a.dataset.scroll);
      if (t) { t.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" }); t.focus({ preventScroll: true }); }
    }));
  }
  function fallbackCopy(text, done) {
    const ta = document.createElement("textarea");
    ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); done(); } catch (e) { /* ignore */ }
    ta.remove();
  }
  function srcLinks(list) {
    return `<ul class="src-list">${list.map((s) => `<li>${s.url ? `<a href="${s.url}" target="_blank" rel="noopener">${s.label}</a>` : s.label}</li>`).join("")}</ul>`;
  }

  /* ------------------------------------------------------------------
     4. Page renderers
     ------------------------------------------------------------------ */

  /** The cover's one moving element: A* searching across the graph paper. */
  function coverSearch(canvas) {
    const ctx = canvas.getContext("2d");
    const css = getComputedStyle(document.documentElement);
    const col = (v) => css.getPropertyValue(v).trim();
    const CELL = 24;
    let W, H, cols, rows, walls, start, goal, open, g, came, closed, timer = null, done = false, pause = 0;
    function setup() {
      const r = canvas.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
      canvas.width = r.width * dpr; canvas.height = r.height * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      W = r.width; H = r.height; cols = Math.floor(W / CELL); rows = Math.floor(H / CELL);
      walls = new Set();
      for (let i = 0; i < cols * rows * 0.24; i++) walls.add(Math.floor(Math.random() * cols) + "," + Math.floor(Math.random() * rows));
      // On phones the title box covers most of the cover, so search inside the strip above it.
      const band = W < 720 ? Math.max(4, Math.floor(170 / CELL)) : rows;
      start = W < 720 ? [1, band - 2] : [Math.max(2, Math.floor(cols * 0.08)), Math.floor(rows * 0.82)];
      goal = W < 720 ? [cols - 2, 1] : [cols - 3, Math.floor(rows * 0.18)];
      walls.delete(start.join(",")); walls.delete(goal.join(","));
      open = [[...start]]; g = new Map([[start.join(","), 0]]); came = new Map(); closed = new Set(); done = false; pause = 0;
      ctx.clearRect(0, 0, W, H);
      const ink = col("--ink");
      ctx.fillStyle = ink; ctx.globalAlpha = 0.85;
      walls.forEach((k) => { const [x, y] = k.split(",").map(Number); ctx.fillRect(x * CELL + 1, y * CELL + 1, CELL - 1, CELL - 1); });
      ctx.globalAlpha = 1;
      mark(start, col("--green")); mark(goal, col("--red"));
    }
    const h = (p) => Math.abs(p[0] - goal[0]) + Math.abs(p[1] - goal[1]);
    function mark(p, c) { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(p[0] * CELL + CELL / 2 + .5, p[1] * CELL + CELL / 2 + .5, 7, 0, 7); ctx.fill(); }
    function step() {
      if (done) { if (++pause > 90) setup(); return; }
      for (let k = 0; k < 3 && open.length; k++) {
        let bi = 0;
        for (let i = 1; i < open.length; i++) { const a = open[i], b = open[bi]; const fa = g.get(a.join(",")) + h(a), fb = g.get(b.join(",")) + h(b); if (fa < fb || (fa === fb && h(a) < h(b))) bi = i; }
        const cur = open.splice(bi, 1)[0], ck = cur.join(",");
        if (closed.has(ck)) continue;
        closed.add(ck);
        if (cur[0] === goal[0] && cur[1] === goal[1]) { drawPath(); done = true; return; }
        if (ck !== start.join(",")) { ctx.fillStyle = col("--pen"); ctx.globalAlpha = 0.16; ctx.fillRect(cur[0] * CELL + 1, cur[1] * CELL + 1, CELL - 1, CELL - 1); ctx.globalAlpha = 1; }
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const n = [cur[0] + dx, cur[1] + dy], nk = n.join(",");
          if (n[0] < 0 || n[1] < 0 || n[0] >= cols || n[1] >= rows || walls.has(nk)) continue;
          const ng = g.get(ck) + 1;
          if (ng < (g.get(nk) ?? Infinity)) { g.set(nk, ng); came.set(nk, cur); open.push(n); }
        }
      }
      if (!open.length) { done = true; }
    }
    function drawPath() {
      const pts = []; let k = goal.join(",");
      while (k) { const [x, y] = k.split(",").map(Number); pts.unshift([x, y]); const p = came.get(k); k = p ? p.join(",") : null; }
      ctx.strokeStyle = col("--hl"); ctx.lineWidth = 12; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.globalAlpha = 0.9;
      ctx.beginPath(); pts.forEach(([x, y], i) => { const px = x * CELL + CELL / 2, py = y * CELL + CELL / 2; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }); ctx.stroke();
      ctx.globalAlpha = 1; ctx.strokeStyle = col("--ink"); ctx.lineWidth = 1.6; ctx.stroke();
      mark(start, col("--green")); mark(goal, col("--red"));
    }
    setup();
    if (reduceMotion) { while (!done) step(); return () => {}; }
    timer = setInterval(step, 30);
    const onResize = () => setup();
    window.addEventListener("resize", onResize);
    return () => { clearInterval(timer); window.removeEventListener("resize", onResize); };
  }

  function renderHome(root) {
    const m = BOOK.meta;
    root.innerHTML = `
      <section class="cover" aria-labelledby="bookTitle">
        <canvas aria-hidden="true"></canvas>
        <div class="cover-text">
          <p class="cover-note">AI Fundamentals, autumn 2026</p>
          <h1 id="bookTitle">The Thinking Machine Atlas</h1>
          <p class="subtitle">${m.subtitle}</p>
          <p class="team">Written by ${m.team.map(esc).join(", ")}</p>
          <div class="actions"><a class="btn primary" href="#week-1">Start reading</a><a class="btn" href="#about">How to use this book</a></div>
        </div>
        <p class="cover-legend" aria-hidden="true">behind this page: <b>A*</b> searching from the green dot to the red one</p>
      </section>
      <div class="home-grid">
        <div>
          <h2 style="margin-top:0">Contents</h2>
          <ol class="contents">${CH.map((c) => `<li><a href="#${c.id}"><span class="cn">${c.week}</span><span><span class="ct">${c.title}</span><span class="cs">${dot(c.station).replace(/^Station \d+: /, "")}</span></span>${visited.has(c.id) ? '<span class="cv">read ✓</span>' : c.sourceWarning ? '<span class="cam">extra sources</span>' : "<span></span>"}</a></li>`).join("")}</ol>
          <h3>At the back of the book</h3>
          <ol class="contents back">${PAGES.filter((p) => !p.num && p.id !== "home").map((p, i) => `<li><a href="#${p.id}"><span class="cn">${String.fromCharCode(65 + i)}</span><span class="ct">${p.title}</span></a></li>`).join("")}</ol>
        </div>
        <aside class="margin-qai">${qaiSvg(76)}Hi, I'm Qai. I can sense and act, but I don't know how to be clever yet. Each station teaches me one new trick, and every chapter has figures you can play with and Python you can run.</aside>
      </div>
      <h2>About this book</h2>
      <p>${m.description}</p>
      <p>The ten stations follow the ten weeks of the course. Weeks 9 and 10 are marked <span class="am-inline">extra sources</span> because their lecture slides were not among the files used to write the book; they follow the syllabus and cite outside sources.</p>`;
    stopCover = coverSearch($(".cover canvas", root));
  }

  /** Chapter page. Section numbers (w.1, w.2 …) are a real sequence. */
  function renderChapter(c, root) {
    const w = c.week, idp = c.id;
    let s = 0;
    const H = (key, title) => `<h2 id="${idp}-${key}" tabindex="-1"><span class="sec">${w}.${++s}</span>${title}</h2>`;
    const figures = [c.diagram, ...((window.ATLAS_VISUALS && window.ATLAS_VISUALS.byWeek[w]) || [])];
    const labs = (BOOK.labs && BOOK.labs[w]) || [];
    root.innerHTML = `<article class="chapter">
      <header class="ch-open">
        <div class="ch-num" aria-hidden="true">${w}</div>
        <div><p class="station">${dot(c.station)}</p><h1>${c.title}</h1><p class="lede">${c.subtitle}</p></div>
      </header>
      <p class="src-line">Written from: ${c.source}</p>
      ${c.sourceWarning ? `<div class="source-warning" role="note"><span class="hand">Note on sources</span>${c.sourceWarning}</div>` : ""}
      ${stationStrip(w)}
      <aside class="mnote">${qaiSvg(56)}${c.story.replace(/<[^>]+>/g, "")}</aside>

      ${H("obj", "What you will learn")}
      <ul class="objectives">${c.objectives.map((o) => `<li>${o}</li>`).join("")}</ul>

      ${H("concepts", "Key concepts")}
      ${c.sections.map((x) => `<div class="concept"><h3>${x.h}</h3>${x.html.replace(/<p class='am-inline'>Additional Material<\/p>/g, "<p class='am-inline'>from extra sources</p>")}</div>`).join("")}

      ${H("terms", "Terms to know")}
      <dl class="terms">${c.terms.map((t) => `<div><dt><span>${t.t}</span></dt><dd>${t.d}</dd></div>`).join("")}</dl>

      ${H("algo", "Algorithms, step by step")}
      ${c.algorithms.map((a) => `<h3>${a.title}</h3><ol class="steps">${a.steps.map((x) => `<li>${x}</li>`).join("")}</ol>${a.code ? codeHTML(decode(a.code)).replace('class="code"', 'class="code plain-rad"') : ""}`).join("")}

      ${H("formulas", "Formulas")}
      <div class="formula-list">${c.formulas.map((f) => `<div class="formula-card"><span class="fname">${f.name}</span><div class="fbody">${f.f}</div><span class="fnote">${f.note}</span></div>`).join("")}</div>

      ${H("example", "Worked example")}
      <h3 style="margin-top:0">${c.example.title.replace(/^Practical examples?: /, "")}</h3>${c.example.html}

      ${H("app", "In the real world")}
      <h3 style="margin-top:0">${c.application.title.replace(/^Real-world applications?:? ?(from the lecture's case studies)?:? ?/, "") || "Applications"}</h3>${c.application.html}

      ${H("diagram", "Explore it yourself")}
      ${figures.map((f, k) => `<figure class="fig"><div data-widget="${f.widget}"></div><figcaption><b>Figure ${w}.${k + 1}.</b>${cap(f.title.replace(/^Interactive: /, ""))}. ${f.caption}</figcaption></figure>`).join("")}

      ${labs.length ? `${H("lab", "Python lab")}
      <aside class="mnote">Every output here was made by running the code. Press Run to try it yourself, or Edit to change it.</aside>
      <p>${labs.length} short programs that turn this station's ideas into code. They use plain Python, NumPy and scikit-learn, the tools listed in the syllabus, and run in Google Colab or Jupyter as they are.</p>
      ${labs.map((l, k) => labHTML(l, `${w}.${k + 1}`)).join("")}` : ""}

      <section class="key-idea" id="${idp}-key"><span class="hand">Key idea</span><p><span>${c.keyIdea}</span></p></section>

      ${c.additional.map((a) => `<section class="am-block"><span class="am-badge">from extra sources</span><h3 style="margin-top:0">${a.title.replace(/^Additional Material: /, "")}</h3>${a.html}${a.src ? srcLinks(a.src) : ""}</section>`).join("")}

      ${H("quiz", "Quiz")}
      <div class="quiz-box"></div>

      ${H("cyu", "Check your understanding")}
      <p>Try to answer in your own words before you open each one.</p>
      ${c.check.map((q) => `<details class="cyu"><summary>${q.q}</summary><div class="ans">${q.a}</div></details>`).join("")}

      ${H("connect", "Where this leads")}
      <div class="connect"><p><b>coming from</b>${c.connect.prev}</p><p><b>heading to</b>${c.connect.next}</p></div>
    </article>`;
    quiz($(".quiz-box", root), c.quiz, c.id);
    $$(".lab", root).forEach((sec, k) => wireLab(sec, labs[k]));
  }

  function cap(t) { return t.charAt(0).toUpperCase() + t.slice(1); }

  function pageHead(kicker, title, lede) {
    return `<header class="page-head"><p class="station">${kicker}</p><h1>${title}</h1>${lede ? `<p class="lede">${lede}</p>` : ""}</header>`;
  }

  function renderRealWorld(root) {
    root.innerHTML = pageHead("Looking back", "AI in the real world", "Where each station's ideas are used outside the classroom") +
      `<ul class="ref-list">${BOOK.realWorld.map((r) => `<li><h3>${r.title}<span class="wk">${r.weeks.toLowerCase()}</span></h3><p>${r.text}</p></li>`).join("")}</ul>
      <h2>One problem through the whole course</h2>
      <p>Predictive maintenance appears in almost every lecture. Followed from start to finish, it shows how the stations fit together:</p>
      <ol class="steps">
        <li><strong>Week 1.</strong> PEAS: performance is uptime and cost; sensors read temperature and vibration; actuators continue, reduce load or maintain.</li>
        <li><strong>Week 5.</strong> An MDP: CONTINUE earns +10 now, MAINTAIN costs −15, but a failure later costs −200.</li>
        <li><strong>Week 6.</strong> Bayes: a HIGH temperature raises the failure probability from 2 % to 15.52 %.</li>
        <li><strong>Week 7.</strong> An HMM: two HIGH readings in a row raise P(Faulty) to 72.3 %.</li>
        <li><strong>Week 8.</strong> A classifier predicts P(failure); maintain when it exceeds C<sub>maint</sub>/C<sub>failure</sub>.</li>
        <li><strong>Weeks 9–10.</strong> Neural networks read raw sensor signals; safety rules keep a person able to override.</li>
      </ol>`;
  }

  function renderRisks(root) {
    root.innerHTML = pageHead("Looking back", "Limitations and risks", "What can go wrong, collected from every station") +
      `<ul class="ref-list">${BOOK.risks.map((r) => `<li><h3>${r.title}<span class="wk">${r.week.toLowerCase()}</span></h3><p>${r.text}</p></li>`).join("")}</ul>
      <p class="note">Hallucination is covered in Week 10, which is based on extra sources. Every other risk comes from the lecture slides.</p>`;
  }

  function renderEthics(root) {
    const E = BOOK.ethics;
    root.innerHTML = pageHead("Looking back", "Ethics and responsible AI", "Technical correctness is necessary, but not enough") +
      `<p class="section-intro">${E.intro}</p>
      <h2>Six principles from the course</h2>
      <ul class="ref-list">${E.principles.map((p) => `<li><h3>${p.title}</h3><p>${p.text}</p></li>`).join("")}</ul>
      <h2>Three dilemmas to discuss</h2>
      ${E.dilemmas.map((d) => `<details class="cyu"><summary>${d.q}</summary><div class="ans">${d.a}</div></details>`).join("")}
      <section class="am-block"><span class="am-badge">from extra sources</span><h3 style="margin-top:0">Further reading</h3>
      <p>International frameworks turn these ideas into risk-management processes and shared values such as fairness, transparency, accountability and human oversight.</p>${srcLinks(E.src)}</section>`;
  }

  function renderCompare(root) {
    const C = BOOK.comparison;
    root.innerHTML = pageHead("Reference", "Algorithm comparison", "Every main algorithm of the course in one table") +
      `<div class="filter-row" role="group" aria-label="Show algorithms from one week">
        <button class="chip" aria-pressed="true" data-w="all">All weeks</button>
        ${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((w) => `<button class="chip" aria-pressed="false" data-w="${w}">Week ${w}</button>`).join("")}
      </div>
      <div class="table-wrap" style="max-width:none"><table class="cmp-table"><caption>Algorithms with their problem type, central idea, guarantee and main weakness. ${C.note.replace("Additional Material", "extra sources")}</caption>
        <thead><tr>${C.columns.map((c) => `<th scope="col">${c}</th>`).join("")}</tr></thead>
        <tbody>${C.rows.map((r) => `<tr data-weeks="${r[1].replace(/\s/g, "")}">${r.map((x) => `<td>${x}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
    const chips = $$(".chip", root);
    chips.forEach((ch) => ch.addEventListener("click", () => {
      chips.forEach((x) => x.setAttribute("aria-pressed", String(x === ch)));
      const w = ch.dataset.w;
      $$("tbody tr", root).forEach((tr) => { tr.hidden = w !== "all" && !tr.dataset.weeks.split(",").includes(w); });
    }));
  }

  function renderTimeline(root) {
    root.innerHTML = pageHead("Reference", "AI timeline", "Milestones behind the methods in this book") +
      `<p class="section-intro">The slides mention a few milestones: checkers being solved, Deep Blue in 1997 and AlphaGo (Week 4), and DQN (Week 5). The course has no full history of AI, so the other entries come from extra sources, each linked to its original paper or archive.</p>
      <div class="filter-row" role="group" aria-label="Filter the timeline">
        <button class="chip" aria-pressed="true" data-f="all">All</button>
        <button class="chip" aria-pressed="false" data-f="course">Named in the lectures</button>
        <button class="chip" aria-pressed="false" data-f="add">From extra sources</button>
      </div>
      <ol class="timeline">${BOOK.timeline.map((t) => `
        <li class="tl-item ${t.course ? "course" : "add"}"><span class="tl-year">${t.year}</span><div class="tl-card">
          <h3>${t.title}${t.course ? '<span class="badge course">in the lectures</span>' : '<span class="badge add">extra source</span>'}</h3>
          <p>${t.text}</p><a class="src" href="${t.src.url}" target="_blank" rel="noopener">${t.src.label}</a></div></li>`).join("")}</ol>`;
    const chips = $$(".chip", root);
    chips.forEach((ch) => ch.addEventListener("click", () => {
      chips.forEach((x) => x.setAttribute("aria-pressed", String(x === ch)));
      $$(".tl-item", root).forEach((li) => { li.hidden = ch.dataset.f !== "all" && !li.classList.contains(ch.dataset.f); });
    }));
  }

  function glossaryTerms() {
    const map = new Map();
    CH.forEach((c) => c.terms.forEach((t) => {
      const k = t.t.replace(/<[^>]+>/g, "").toLowerCase();
      if (!map.has(k)) map.set(k, { t: t.t, d: t.d, weeks: [c.week] });
      else if (!map.get(k).weeks.includes(c.week)) map.get(k).weeks.push(c.week);
    }));
    return [...map.values()].sort((a, b) => a.t.replace(/<[^>]+>/g, "").localeCompare(b.t.replace(/<[^>]+>/g, ""), "en", { sensitivity: "base" }));
  }

  function renderGlossary(root) {
    const terms = glossaryTerms();
    root.innerHTML = pageHead("Reference", "Glossary", `${terms.length} terms from all ten stations`) +
      `<div class="filter-row"><label for="gsearch" class="sr-only">Search the glossary</label>
        <input type="search" id="gsearch" placeholder="Search terms and definitions" autocomplete="off">
        <select id="gweek" aria-label="Show terms from one week"><option value="">All weeks</option>${CH.map((c) => `<option value="${c.week}">Week ${c.week}: ${SHORT[c.week - 1]}</option>`).join("")}</select></div>
      <p class="widget-caption" id="gcount" aria-live="polite"></p>
      <dl class="glossary-list" id="glist"></dl>`;
    const list = $("#glist", root), q = $("#gsearch", root), wk = $("#gweek", root), count = $("#gcount", root);
    function draw() {
      const s = q.value.trim().toLowerCase(), w = +wk.value || 0;
      const items = terms.filter((t) => (!s || (t.t + " " + t.d).replace(/<[^>]+>/g, "").toLowerCase().includes(s)) && (!w || t.weeks.includes(w)));
      let last = "", html = "";
      items.forEach((t) => {
        const L = t.t.replace(/<[^>]+>/g, "").charAt(0).toUpperCase(), letter = /[A-Z]/.test(L) ? L : "#";
        if (letter !== last) { html += `<div class="letter-head" aria-hidden="true">${letter}</div>`; last = letter; }
        html += `<div class="gt"><dt>${t.t}<span class="wk">${t.weeks.map((x) => `<a href="#week-${x}">week ${x}</a>`).join(", ")}</span></dt><dd>${t.d}</dd></div>`;
      });
      list.innerHTML = html || "<p>No term matches. Try a shorter word.</p>";
      count.textContent = `${items.length} term${items.length === 1 ? "" : "s"} shown`;
    }
    q.addEventListener("input", draw); wk.addEventListener("change", draw); draw();
  }

  function renderFinalQuiz(root) {
    root.innerHTML = pageHead("Reference", "Final quiz", "Twenty questions, two from every station") +
      `<aside class="mnote">${qaiSvg(56)}Last checkpoint. At the end you'll see which stations are worth a second visit.</aside><div id="fq"></div>`;
    quiz($("#fq", root), BOOK.finalQuiz, "final", {
      weekTag: true,
      onComplete(right, ans, box) {
        const per = {};
        BOOK.finalQuiz.forEach((q, i) => { per[q.w] = per[q.w] || [0, 0]; per[q.w][1]++; if (ans[i] === q.a) per[q.w][0]++; });
        const msg = right >= 18 ? "Excellent. You could teach this course." : right >= 14 ? "Strong result. Revisit the weeks shown in red." : right >= 10 ? "Good start. Revisit the weeks shown in red before the exam." : "Revisit the weeks shown in red, then take the quiz again.";
        box.innerHTML = `<div class="result-box"><div class="big">${right} / ${BOOK.finalQuiz.length}</div><p>${msg}</p>
          <div class="week-break">${Object.keys(per).map((w) => { const [r, n] = per[w]; return `<div class="${r === n ? "full" : r === 0 ? "zero" : ""}"><a href="#week-${w}">week ${w}</a><br>${r} of ${n}</div>`; }).join("")}</div></div>`;
      }
    });
  }

  function renderSources(root) {
    const S = BOOK.sources;
    root.innerHTML = pageHead("About this book", "Sources", "") +
      `<h2 style="margin-top:0">Course materials</h2><p>The required, primary source for everything in the book.</p><ol>${S.primary.map((s) => `<li>${s}</li>`).join("")}</ol>
      <h2>Textbook and syllabus literature</h2>${srcLinks(S.textbook)}
      <section class="am-block"><span class="am-badge">extra sources</span><h3 style="margin-top:0">Used for the material marked as extra</h3>${srcLinks(S.additional)}</section>`;
  }

  function renderDisclosure(root) {
    const D = BOOK.disclosure;
    root.innerHTML = pageHead("About this book", "AI use disclosure", "Following the AI Use Declaration Form in the syllabus appendix") +
      `<div class="table-wrap"><table><caption>AI use declaration</caption><thead><tr><th scope="col">Field</th><th scope="col">Content</th></tr></thead>
      <tbody>${D.rows.map((r) => `<tr><th scope="row">${r[0]}</th><td>${r[1]}</td></tr>`).join("")}</tbody></table></div>
      <h2>Libraries and services</h2><p>${D.libraries}</p>`;
  }

  function renderAbout(root) {
    const M = BOOK.courseMap;
    root.innerHTML = pageHead("About this book", "Course map and how to use", "How the book was built from the course materials") +
      `<h2 style="margin-top:0">Week, topic and section</h2>
      <div class="table-wrap"><table><caption>Connection between each week, its topic and the book section</caption>
      <thead><tr><th scope="col">Week</th><th scope="col">Syllabus topic</th><th scope="col">Source used</th><th scope="col">Book section</th><th scope="col">Status</th></tr></thead>
      <tbody>${M.rows.map((r) => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td><a href="#week-${r[0]}">${dot(r[3])}</a></td><td>${r[4].replace("Additional Material", "extra sources")}</td></tr>`).join("")}</tbody></table></div>
      <h2>Gaps and inconsistencies found in the materials</h2><ul>${M.findings.map((f) => `<li>${f.replace(/Additional Material/g, "extra sources")}</li>`).join("")}</ul>
      <h2>How to use this book</h2>
      <ul><li>Read the stations in order; each one ends by explaining how it connects to the next.</li>
      <li>Use the contents list on the left (the menu button on phones) to jump anywhere.</li>
      <li>Every chapter has interactive figures and a Python lab. Press <em>Run in browser</em> to execute a lab; with no internet connection, the saved output is shown.</li>
      <li>Your visited stations and best quiz scores are kept in this browser only.</li>
      <li>Material marked <span class="am-inline">extra sources</span> is not in the lecture slides and always comes with a link.</li>
      <li>Switch between the light and dark theme with the sun and moon button; turn pages with <kbd>←</kbd> and <kbd>→</kbd>.</li></ul>
      <button class="btn small quiet" id="resetProgress">Reset my progress and scores</button>`;
    $("#resetProgress", root).addEventListener("click", (e) => {
      visited.clear(); Object.keys(scores).forEach((k) => delete scores[k]);
      store.set("visited", []); store.set("scores", {});
      updateProgress(); buildToc();
      e.target.textContent = "Progress reset";
    });
  }

  /* ------------------------------------------------------------------
     5. Interactive widgets
     Each widget receives an empty container element and builds itself.
     ------------------------------------------------------------------ */
  const WIDGETS = {};

  /* small UI builders */
  function sliderHTML(id, label, min, max, step, value) {
    return `<div class="slider"><label for="${id}">${label}</label><input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${value}"><output for="${id}" id="${id}-o"></output></div>`;
  }
  const uid = (p) => p + Math.random().toString(36).slice(2, 7);

  /* ---------- Week 1: agent loop + reflex agent ---------- */
  WIDGETS.reflexAgent = function (el) {
    const u = uid("ra");
    el.innerHTML = `<div class="widget">
      <svg class="loop-svg" viewBox="0 0 640 200" role="img" aria-label="Agent–environment loop: the environment sends percepts to the agent and the agent sends actions back">
        <defs><marker id="arrowHead" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="var(--primary)"/></marker></defs>
        <g class="node"><rect x="20" y="50" width="220" height="100" rx="16"/><text x="130" y="85" text-anchor="middle" font-weight="800">ENVIRONMENT</text><text x="130" y="112" text-anchor="middle" font-size="13" id="${u}-env">Smart office</text></g>
        <g class="node agent"><rect x="400" y="50" width="220" height="100" rx="16"/><text x="510" y="85" text-anchor="middle" font-weight="800">AGENT</text><text x="510" y="112" text-anchor="middle" font-size="13">IF–THEN rules</text></g>
        <path id="${u}-p1" class="arrow" d="M240 75 C 300 30, 340 30, 400 75"/><text x="320" y="30" text-anchor="middle" font-size="13" font-weight="700">percept ↑ (sensors)</text>
        <path id="${u}-p2" class="arrow" d="M400 125 C 340 170, 300 170, 240 125"/><text x="320" y="190" text-anchor="middle" font-size="13" font-weight="700" id="${u}-act">action ↓ (actuators)</text>
        ${reduceMotion ? "" : `<circle r="6" class="pulse"><animateMotion dur="2.4s" repeatCount="indefinite"><mpath href="#${u}-p1"/></animateMotion></circle><circle r="6" class="pulse" style="fill:var(--warm)"><animateMotion dur="2.4s" begin="1.2s" repeatCount="indefinite"><mpath href="#${u}-p2"/></animateMotion></circle>`}
      </svg>
      <div class="two-col">
        <div>
          <h3 style="margin-top:0">Percepts</h3>
          ${sliderHTML(u + "t", "Temperature (°C)", 10, 35, 1, 24)}
          ${sliderHTML(u + "c", "CO₂ (ppm)", 400, 1600, 50, 1100)}
          ${sliderHTML(u + "p", "People in room", 0, 20, 1, 6)}
          <div class="widget-row"><button class="btn small" id="${u}-order">Reverse rule order</button><button class="btn small" id="${u}-demo">Try 19 °C, 6 people</button></div>
        </div>
        <div>
          <h3 style="margin-top:0">Rules (checked top to bottom)</h3>
          <ol class="rules" id="${u}-rules"></ol>
          <p>Selected action: <span class="big-result" id="${u}-out" aria-live="polite"></span></p>
        </div>
      </div></div>`;
    let rules = [
      { txt: "people == 0", f: (s) => s.p === 0, act: "Energy-saving mode" },
      { txt: "temperature < 20", f: (s) => s.t < 20, act: "Heating ON" },
      { txt: "temperature > 26", f: (s) => s.t > 26, act: "Cooling ON" },
      { txt: "co2 > 1000", f: (s) => s.c > 1000, act: "Fresh-air fan ON" }
    ];
    const T = $("#" + u + "t", el), C = $("#" + u + "c", el), P = $("#" + u + "p", el);
    function draw() {
      const s = { t: +T.value, c: +C.value, p: +P.value };
      $("#" + u + "t-o", el).textContent = s.t; $("#" + u + "c-o", el).textContent = s.c; $("#" + u + "p-o", el).textContent = s.p;
      let fired = -1;
      rules.forEach((r, i) => { if (fired < 0 && r.f(s)) fired = i; });
      $("#" + u + "-rules", el).innerHTML = rules.map((r, i) => {
        const v = r.f(s);
        const cls = i === fired ? "fired" : v ? "true" : "false";
        const tag = i === fired ? "FIRES" : v ? "true (ignored)" : "false";
        return `<li class="${cls}">${i === 0 ? "if" : "elif"} ${esc(r.txt)} → "${r.act}" <span class="tag">${tag}</span></li>`;
      }).join("") + `<li class="${fired < 0 ? "fired" : "false"}">else → "No action" <span class="tag">${fired < 0 ? "FIRES" : ""}</span></li>`;
      const action = fired < 0 ? "No action" : rules[fired].act;
      $("#" + u + "-out", el).textContent = action;
      $("#" + u + "-act", el).textContent = "action ↓ " + action;
      $("#" + u + "-env", el).textContent = `${s.t} °C · ${s.c} ppm · ${s.p} people`;
    }
    [T, C, P].forEach((x) => x.addEventListener("input", draw));
    $("#" + u + "-order", el).addEventListener("click", () => { rules = rules.slice().reverse(); draw(); });
    $("#" + u + "-demo", el).addEventListener("click", () => { T.value = 19; P.value = 6; C.value = 1200; draw(); });
    draw();
  };

  /* ---------- Week 2: grid search (BFS, DFS, UCS, A*) ---------- */
  WIDGETS.searchGrid = function (el) {
    const u = uid("sg");
    const W = 14, H = 9, START = [4, 1], GOAL = [3, 12]; // [row, col]
    const layout = [
      "..............",
      ".....#........",
      ".....#...mm...",
      ".....#...mm...",
      ".....#...mm...",
      ".....#####....",
      "..mmm.........",
      "..mmm....#....",
      ".........#...."
    ];
    let grid = layout.map((r) => r.split(""));
    el.innerHTML = `<div class="widget">
      <div class="widget-row">
        <label for="${u}-alg">Algorithm</label>
        <select id="${u}-alg"><option value="bfs">BFS (FIFO queue)</option><option value="dfs">DFS (LIFO stack)</option><option value="ucs">UCS (lowest g)</option><option value="astar" selected>A* (lowest g + h)</option></select>
        <button class="btn small primary" id="${u}-run">▶ Run</button>
        <button class="btn small" id="${u}-step">Step</button>
        <button class="btn small" id="${u}-reset">Reset search</button>
        <button class="btn small" id="${u}-cmp">Compare all four</button>
        <button class="btn small" id="${u}-clear">Clear walls</button>
      </div>
      <div class="grid-board" id="${u}-g" style="grid-template-columns: repeat(${W}, 1fr)" role="grid" aria-label="Search grid. Click a cell to cycle between empty, wall and mud."></div>
      <div class="legend"><span><i style="background:var(--accent)"></i>Start</span><span><i style="background:var(--danger)"></i>Goal</span><span><i style="background:var(--ink)"></i>Wall</span><span><i style="background:color-mix(in srgb, var(--warm) 28%, var(--surface))"></i>Mud (cost 5)</span><span><i style="background:color-mix(in srgb, var(--primary) 26%, var(--surface))"></i>Expanded</span><span><i style="box-shadow:inset 0 0 0 3px var(--accent)"></i>Frontier</span><span><i style="background:var(--path)"></i>Solution path</span></div>
      <div class="stats" id="${u}-stats" aria-live="polite"></div>
      <div id="${u}-cmpout"></div></div>`;
    const board = $("#" + u + "-g", el);
    const key = (r, c) => r * W + c;
    const cells = [];
    for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) {
      const b = document.createElement("button");
      b.className = "cell"; b.type = "button";
      b.setAttribute("aria-label", `Row ${r + 1}, column ${c + 1}`);
      b.addEventListener("click", () => {
        if ((r === START[0] && c === START[1]) || (r === GOAL[0] && c === GOAL[1])) return;
        grid[r][c] = grid[r][c] === "." ? "#" : grid[r][c] === "#" ? "m" : ".";
        resetSearch();
      });
      board.appendChild(b); cells.push(b);
    }
    const stepCost = (r, c) => (grid[r][c] === "m" ? 5 : 1);
    const hMan = (r, c) => Math.abs(r - GOAL[0]) + Math.abs(c - GOAL[1]);
    function neighbors(r, c) {
      const out = [];
      [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([dr, dc]) => {          // up, down, left, right
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < H && nc >= 0 && nc < W && grid[nr][nc] !== "#") out.push([nr, nc]);
      });
      return out;
    }

    /** Create a step-able search. Returns { step() → state }. */
    function makeSearch(alg) {
      let counter = 0;
      const start = { r: START[0], c: START[1], g: 0, parent: null };
      let frontier = [start];
      const best = new Map([[key(START[0], START[1]), 0]]);
      const seen = new Set([key(START[0], START[1])]);   // BFS: visited-on-push
      const expanded = new Set();
      let done = false, path = null, cost = 0;
      start.order = counter++;
      const pr = (n) => (alg === "ucs" ? n.g : n.g + hMan(n.r, n.c));
      function pop() {
        if (alg === "bfs") return frontier.shift();
        if (alg === "dfs") return frontier.pop();
        let bi = 0;
        for (let i = 1; i < frontier.length; i++) {
          const a = frontier[i], b = frontier[bi];
          if (pr(a) < pr(b) || (pr(a) === pr(b) && a.order < b.order)) bi = i;
        }
        return frontier.splice(bi, 1)[0];
      }
      return {
        step() {
          if (done) return this.state();
          while (frontier.length) {
            const n = pop(), k = key(n.r, n.c);
            if (alg === "dfs" && expanded.has(k)) continue;
            if ((alg === "ucs" || alg === "astar") && n.g > (best.get(k) ?? Infinity)) continue; // stale entry
            if (n.r === GOAL[0] && n.c === GOAL[1]) {
              done = true; path = []; cost = n.g;
              for (let x = n; x; x = x.parent) path.unshift(key(x.r, x.c));
              expanded.add(k);
              return this.state();
            }
            expanded.add(k);
            for (const [nr, nc] of neighbors(n.r, n.c)) {
              const nk = key(nr, nc), g = n.g + stepCost(nr, nc);
              if (alg === "bfs") { if (seen.has(nk)) continue; seen.add(nk); }
              if (alg === "dfs" && expanded.has(nk)) continue;
              if (alg === "ucs" || alg === "astar") { if (g >= (best.get(nk) ?? Infinity)) continue; best.set(nk, g); }
              frontier.push({ r: nr, c: nc, g, parent: n, order: counter++ });
            }
            return this.state();
          }
          done = true;
          return this.state();
        },
        state() { return { expanded, frontier: new Set(frontier.map((n) => key(n.r, n.c))), done, path, cost }; }
      };
    }

    let search = null, timer = null;
    function paint(st) {
      cells.forEach((b, i) => {
        const r = Math.floor(i / W), c = i % W;
        b.className = "cell" + (grid[r][c] === "#" ? " wall" : grid[r][c] === "m" ? " mud" : "");
        if (st) {
          if (st.expanded.has(i)) b.classList.add("expanded");
          if (st.frontier.has(i)) b.classList.add("frontier");
          if (st.path && st.path.includes(i) && i !== key(START[0], START[1]) && i !== key(GOAL[0], GOAL[1])) b.classList.add("path");
        }
        if (r === START[0] && c === START[1]) b.classList.add("start");
        if (r === GOAL[0] && c === GOAL[1]) b.classList.add("goal");
      });
      const alg = $("#" + u + "-alg", el).selectedOptions[0].text;
      $("#" + u + "-stats", el).innerHTML = st ? `
        <div><b>${st.expanded.size}</b><span>nodes expanded</span></div>
        <div><b>${st.frontier.size}</b><span>on the frontier</span></div>
        <div><b>${st.path ? st.path.length - 1 : "–"}</b><span>path length (steps)</span></div>
        <div><b>${st.path ? st.cost : "–"}</b><span>path cost</span></div>
        <div><b style="font-size:1rem">${st.done ? (st.path ? "Goal found" : "No path") : "Searching…"}</b><span>${esc(alg)}</span></div>` : "";
    }
    function resetSearch() { stop(); search = null; paint(null); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } $("#" + u + "-run", el).textContent = "▶ Run"; }
    function ensure() { if (!search) search = makeSearch($("#" + u + "-alg", el).value); }
    $("#" + u + "-step", el).addEventListener("click", () => { stop(); ensure(); paint(search.step()); });
    $("#" + u + "-run", el).addEventListener("click", () => {
      if (timer) { stop(); return; }
      ensure();
      if (reduceMotion) { let s; do { s = search.step(); } while (!s.done); paint(s); return; }
      $("#" + u + "-run", el).textContent = "❚❚ Pause";
      timer = setInterval(() => { const s = search.step(); paint(s); if (s.done) stop(); }, 45);
    });
    $("#" + u + "-reset", el).addEventListener("click", resetSearch);
    $("#" + u + "-alg", el).addEventListener("change", resetSearch);
    $("#" + u + "-clear", el).addEventListener("click", () => { grid = layout.map((r) => r.replace(/[#m]/g, ".").split("")); resetSearch(); });
    $("#" + u + "-cmp", el).addEventListener("click", () => {
      stop();
      const names = { bfs: "BFS", dfs: "DFS", ucs: "UCS", astar: "A*" };
      const rows = Object.keys(names).map((a) => { const s = makeSearch(a); let st; do { st = s.step(); } while (!st.done); return [names[a], st.expanded.size, st.path ? st.path.length - 1 : "–", st.path ? st.cost : "–"]; });
      $("#" + u + "-cmpout", el).innerHTML = `<div class="table-wrap"><table class="compare-table"><caption>Same grid, four frontier policies</caption><thead><tr><th scope="col">Algorithm</th><th scope="col">Expanded</th><th scope="col">Steps</th><th scope="col">Cost</th></tr></thead><tbody>${rows.map((r) => `<tr>${r.map((x) => `<td>${x}</td>`).join("")}</tr>`).join("")}</tbody></table></div>
        <p class="widget-caption">UCS and A* always find the cheapest path; A* usually expands fewer nodes thanks to the admissible Manhattan heuristic. BFS finds the fewest steps, not the lowest cost. DFS finds <em>a</em> path, often a long one.</p>`;
    });
    paint(null);
  };

  /* ---------- Week 3: local search on a 1-D landscape ---------- */
  WIDGETS.localSearch = function (el) {
    const u = uid("ls");
    const LAND = {
      lecture: [1, 3, 5, 8, 6, 4, 2],
      peaks: [2, 4, 7, 9, 7, 5, 3, 4, 6, 9, 12, 15, 12, 8, 5, 3, 6, 8, 6, 4]
    };
    let vals = LAND.peaks;
    el.innerHTML = `<div class="widget">
      <div class="widget-row"><label for="${u}-l">Landscape</label>
        <select id="${u}-l"><option value="peaks">Two peaks (local max 9, global max 15)</option><option value="lecture">Lecture: [1, 3, 5, 8, 6, 4, 2]</option></select>
        <label for="${u}-s">Start index</label><input type="number" id="${u}-s" min="0" value="0"></div>
      <div class="widget-row">
        <button class="btn small primary" id="${u}-hc">Hill climbing</button>
        <button class="btn small" id="${u}-rr">Random restart ×5</button>
        <button class="btn small" id="${u}-sa">Simulated annealing</button>
      </div>
      <svg class="bar-svg" id="${u}-svg" viewBox="0 0 640 230" role="img" aria-label="Bar chart of the landscape values; the current position is highlighted"></svg>
      <div class="legend"><span><i style="background:var(--warm)"></i>Current / final position</span><span><i style="background:color-mix(in srgb, var(--primary) 40%, var(--surface))"></i>Visited</span><span><i style="background:var(--accent)"></i>Global maximum</span></div>
      <div class="readout" id="${u}-log" aria-live="polite">Choose a start index and an algorithm.</div></div>`;
    const svg = $("#" + u + "-svg", el), log = $("#" + u + "-log", el), sIn = $("#" + u + "-s", el);
    let anim = null;
    function draw(cur = -1, visitedSet = new Set()) {
      const n = vals.length, max = Math.max(...vals), bw = 600 / n;
      const gi = vals.indexOf(max);
      svg.innerHTML = vals.map((v, i) => {
        const h = (v / max) * 170, x = 20 + i * bw, y = 200 - h;
        const cls = i === cur ? "bar cur" : i === gi ? "bar best" : visitedSet.has(i) ? "bar visited" : "bar";
        return `<rect class="${cls}" x="${x + 2}" y="${y}" width="${bw - 4}" height="${h}" rx="3"/><text x="${x + bw / 2}" y="${y - 6}" text-anchor="middle" font-size="12" font-weight="700">${v}</text><text x="${x + bw / 2}" y="218" text-anchor="middle" font-size="10" fill="var(--muted)">${i}</text>`;
      }).join("") + (cur >= 0 ? `<text x="${20 + cur * bw + bw / 2}" y="20" text-anchor="middle" font-size="20">▼</text>` : "");
    }
    function hill(start) {
      const trace = [start]; let cur = start;
      while (true) {
        let best = cur;
        [cur - 1, cur + 1].forEach((nb) => { if (nb >= 0 && nb < vals.length && vals[nb] > vals[best]) best = nb; });
        if (best === cur) break;
        cur = best; trace.push(cur);
      }
      return trace;
    }
    function play(trace, done) {
      if (anim) clearInterval(anim);
      const vis = new Set(); let i = 0;
      if (reduceMotion) { trace.forEach((t) => vis.add(t)); draw(trace[trace.length - 1], vis); done(); return; }
      anim = setInterval(() => { vis.add(trace[i]); draw(trace[i], vis); i++; if (i >= trace.length) { clearInterval(anim); anim = null; done(); } }, 160);
    }
    const startIdx = () => clamp(Math.round(+sIn.value || 0), 0, vals.length - 1);
    $("#" + u + "-l", el).addEventListener("change", (e) => { vals = LAND[e.target.value]; sIn.max = vals.length - 1; sIn.value = 0; draw(); log.textContent = "Landscape changed."; });
    sIn.max = vals.length - 1;
    sIn.addEventListener("input", () => draw(startIdx()));
    $("#" + u + "-hc", el).addEventListener("click", () => {
      const tr = hill(startIdx());
      play(tr, () => {
        const end = tr[tr.length - 1], gmax = Math.max(...vals);
        log.textContent = `Hill climbing: values ${tr.map((i) => vals[i]).join(" → ")}.\nStopped at index ${end} (value ${vals[end]}). ` + (vals[end] === gmax ? "This is the global maximum." : `Stuck on a LOCAL maximum — the global maximum is ${gmax}.`);
      });
    });
    $("#" + u + "-rr", el).addEventListener("click", () => {
      const runs = []; for (let k = 0; k < 5; k++) { const s = Math.floor(Math.random() * vals.length); const tr = hill(s); runs.push([s, tr[tr.length - 1]]); }
      const best = runs.reduce((a, b) => (vals[b[1]] > vals[a[1]] ? b : a));
      const vis = new Set(runs.map((r) => r[1]));
      draw(best[1], vis);
      log.textContent = "Random restarts (start → end value):\n" + runs.map((r, i) => `  run ${i + 1}: start ${r[0]} → peak ${vals[r[1]]} at index ${r[1]}`).join("\n") + `\nBest result kept: ${vals[best[1]]}.`;
    });
    $("#" + u + "-sa", el).addEventListener("click", () => {
      let cur = startIdx(), T = 10, worse = 0, steps = 0; const tr = [cur];
      while (T > 0.1) {
        const nb = clamp(cur + (Math.random() < 0.5 ? -1 : 1), 0, vals.length - 1);
        const dE = vals[nb] - vals[cur];
        if (dE > 0 || Math.random() < Math.exp(dE / T)) { if (dE < 0) worse++; cur = nb; }
        T *= 0.95; steps++; tr.push(cur);
      }
      const gmax = Math.max(...vals);
      play(tr, () => { log.textContent = `Simulated annealing: ${steps} steps, T cooled from 10 to 0.1 (T ← 0.95·T).\nAccepted ${worse} worse moves while exploring.\nFinal position: index ${cur}, value ${vals[cur]}` + (vals[cur] === gmax ? " — the global maximum." : ". Run again: results vary because the search is random."); });
    });
    draw();
  };

  /* ---------- Week 4: Minimax / Alpha–Beta tree + Expectimax ---------- */
  WIDGETS.minimaxTree = function (el) {
    const u = uid("mm");
    let leaves = [3, 12, 8, 2, 4, 6, 14, 5, 2];
    el.innerHTML = `<div class="widget">
      <div class="widget-row">
        <label><input type="checkbox" id="${u}-ab"> Alpha–Beta pruning</label>
        <button class="btn small primary" id="${u}-step">Step</button>
        <button class="btn small" id="${u}-all">Run all</button>
        <button class="btn small" id="${u}-reset">Reset</button>
      </div>
      <svg class="tree-svg" id="${u}-svg" viewBox="0 0 720 300" role="img" aria-label="Game tree with a MAX root, three MIN nodes and nine leaves"></svg>
      <div class="leaf-inputs" aria-label="Edit leaf values">${leaves.map((v, i) => `<input type="number" aria-label="Leaf ${i + 1} value" data-i="${i}" value="${v}">`).join("")}</div>
      <div class="readout" id="${u}-log" aria-live="polite">Press Step to evaluate the tree from the leaves upward.</div>
      <div class="sub-widget"><h3>Expectimax: value of a chance node</h3>
        <div id="${u}-ex"></div>
        <p>Chance value = <span class="big-result" id="${u}-exv"></span></p>
      </div></div>`;
    const svg = $("#" + u + "-svg", el), log = $("#" + u + "-log", el);
    const MINX = [130, 360, 590], LEAFX = [], LY = 255, MY = 145, RY = 45;
    MINX.forEach((x) => LEAFX.push(x - 70, x, x + 70));
    let events = [], ei = 0, state;

    function buildEvents(ab) {
      const ev = []; let alpha = -Infinity, rootV = -Infinity, best = -1;
      for (let m = 0; m < 3; m++) {
        let v = Infinity;
        ev.push({ t: "enter", m, alpha, beta: Infinity });
        for (let k = 0; k < 3; k++) {
          const li = m * 3 + k;
          v = Math.min(v, leaves[li]);
          ev.push({ t: "leaf", m, li, v, msg: `MIN node ${m + 1} sees leaf ${leaves[li]} → current value min = ${v}.` });
          if (ab && v <= alpha && k < 2) {
            const pr = []; for (let j = k + 1; j < 3; j++) pr.push(m * 3 + j);
            ev.push({ t: "prune", m, pr, v, msg: `Prune! ${v} ≤ α = ${alpha}: MAX already has ${alpha}, so MIN node ${m + 1} can't help MAX. Skipping leaves ${pr.map((i) => leaves[i]).join(", ")}.` });
            break;
          }
        }
        ev.push({ t: "min", m, v, msg: `MIN node ${m + 1} returns ${v}.` });
        if (v > rootV) { rootV = v; best = m; }
        alpha = Math.max(alpha, v);
        ev.push({ t: "root", m, v: rootV, alpha, best, msg: `MAX updates its best value to max(…) = ${rootV}` + (ab ? `; α = ${alpha}.` : ".") });
      }
      ev.push({ t: "done", v: rootV, best, msg: `Root value = ${rootV}. MAX plays move ${best + 1}.` });
      return ev;
    }
    function reset() {
      state = { minV: [null, null, null], seen: new Set(), pruned: new Set(), active: null, root: null, best: -1, ab: {}, done: false };
      events = buildEvents($("#" + u + "-ab", el).checked); ei = 0; draw();
      log.textContent = "Press Step to evaluate the tree from the leaves upward.";
    }
    function apply(e) {
      state.active = e.m;
      if (e.t === "enter") state.ab[e.m] = e.alpha;
      if (e.t === "leaf") { state.seen.add(e.li); state.minV[e.m] = e.v; }
      if (e.t === "prune") e.pr.forEach((i) => state.pruned.add(i));
      if (e.t === "min") state.minV[e.m] = e.v;
      if (e.t === "root") { state.root = e.v; state.best = e.best; }
      if (e.t === "done") { state.done = true; state.active = null; }
      if (e.msg) log.textContent = e.msg;
    }
    const fmtInf = (x) => (x === -Infinity ? "−∞" : x === Infinity ? "+∞" : x);
    function tri(x, y, up) { return up ? `${x},${y - 26} ${x - 30},${y + 20} ${x + 30},${y + 20}` : `${x},${y + 26} ${x - 30},${y - 20} ${x + 30},${y - 20}`; }
    function draw() {
      let s = "";
      MINX.forEach((x, m) => {
        s += `<line x1="360" y1="${RY + 20}" x2="${x}" y2="${MY - 20}"/>`;
        for (let k = 0; k < 3; k++) { const li = m * 3 + k; s += `<line class="${state.pruned.has(li) ? "pruned" : ""}" x1="${x}" y1="${MY + 26}" x2="${LEAFX[li]}" y2="${LY - 18}"/>`; }
      });
      s += `<g class="tnode max ${state.done ? "done" : ""}"><polygon points="${tri(360, RY, true)}"/><text x="360" y="${RY + 4}">${state.root ?? "?"}</text></g><text x="420" y="${RY}" class="ab">MAX</text>`;
      MINX.forEach((x, m) => {
        const cls = ["tnode", "min", state.minV[m] != null ? "done" : "", state.active === m ? "active" : "", state.done && state.best === m ? "best" : ""].join(" ");
        s += `<g class="${cls}"><polygon points="${tri(x, MY, false)}"/><text x="${x}" y="${MY - 4}">${state.minV[m] ?? "?"}</text></g>`;
        if ($("#" + u + "-ab", el).checked && state.ab[m] !== undefined) s += `<text x="${x + 52}" y="${MY - 6}" class="ab">α=${fmtInf(state.ab[m])}</text>`;
        s += `<text x="${x - 52}" y="${MY - 6}" class="ab">MIN</text>`;
      });
      LEAFX.forEach((x, i) => {
        const cls = ["tnode", state.pruned.has(i) ? "pruned" : "", state.seen.has(i) ? "done" : ""].join(" ");
        s += `<g class="${cls}"><rect x="${x - 22}" y="${LY - 18}" width="44" height="36" rx="7"/><text x="${x}" y="${LY}">${leaves[i]}</text></g>`;
        if (state.pruned.has(i)) s += `<text x="${x}" y="${LY + 34}" class="ab" style="fill:var(--danger)">pruned</text>`;
      });
      svg.innerHTML = s;
    }
    $("#" + u + "-step", el).addEventListener("click", () => { if (ei < events.length) { apply(events[ei++]); draw(); } });
    $("#" + u + "-all", el).addEventListener("click", () => {
      while (ei < events.length) apply(events[ei++]);
      draw();
      const evaluated = state.seen.size;
      log.textContent += ` Leaves evaluated: ${evaluated} of 9` + (state.pruned.size ? ` (${state.pruned.size} pruned).` : ".");
    });
    $("#" + u + "-reset", el).addEventListener("click", reset);
    $("#" + u + "-ab", el).addEventListener("change", reset);
    $$(".leaf-inputs input", el).forEach((inp) => inp.addEventListener("change", () => { leaves[+inp.dataset.i] = Math.round(+inp.value || 0); reset(); }));
    reset();

    // Expectimax calculator
    const ex = $("#" + u + "-ex", el);
    const outs = [[8, "1/2"], [24, "1/3"], [-12, "1/6"]];
    ex.innerHTML = outs.map((o, i) => `<div class="widget-row"><label>Outcome ${i + 1}: value <input type="number" data-v="${i}" value="${o[0]}" aria-label="Outcome ${i + 1} value"></label><label>probability <input type="text" data-p="${i}" value="${o[1]}" aria-label="Outcome ${i + 1} probability" style="width:70px;font:inherit;padding:6px 10px;border-radius:8px;border:1px solid var(--line);background:var(--surface);color:var(--ink)"></label></div>`).join("");
    const parseP = (s) => { s = String(s).trim(); if (s.includes("/")) { const [a, b] = s.split("/").map(Number); return b ? a / b : NaN; } return Number(s); };
    function calc() {
      let sum = 0, ps = 0; const parts = [];
      outs.forEach((_, i) => { const v = +$(`[data-v="${i}"]`, ex).value, p = parseP($(`[data-p="${i}"]`, ex).value); sum += v * p; ps += p; parts.push(`${fmt(p, 3)}·(${v})`); });
      $("#" + u + "-exv", el).textContent = Math.abs(ps - 1) > 1e-6 ? "probabilities must sum to 1" : `${parts.join(" + ")} = ${fmt(sum, 2)}`;
    }
    ex.addEventListener("input", calc); calc();
  };

  /* ---------- Week 5: Q-learning on the 5-state chain ---------- */
  WIDGETS.qLearning = function (el) {
    const u = uid("ql");
    const N = 5, GOAL = 4, LEFT = 0, RIGHT = 1;
    let Q, episodes, lastTraj;
    el.innerHTML = `<div class="widget">
      ${sliderHTML(u + "a", "α (learning rate)", 0.05, 1, 0.05, 0.5)}
      ${sliderHTML(u + "g", "γ (discount)", 0, 0.99, 0.01, 0.9)}
      ${sliderHTML(u + "e", "ε (exploration)", 0, 1, 0.05, 0.1)}
      <div class="chain" id="${u}-chain" aria-label="Five-state chain"></div>
      <div class="widget-row">
        <button class="btn small primary" id="${u}-one">Train 1 episode</button>
        <button class="btn small" id="${u}-fifty">Train 50 episodes</button>
        <button class="btn small" id="${u}-reset">Reset Q-table</button>
      </div>
      <div class="two-col">
        <div class="table-wrap"><table class="qtable"><caption>Q-table (rows = states, columns = actions)</caption><thead><tr><th scope="col">State</th><th scope="col">LEFT</th><th scope="col">RIGHT</th><th scope="col">Greedy</th></tr></thead><tbody id="${u}-q"></tbody></table></div>
        <div class="readout" id="${u}-log" aria-live="polite"></div>
      </div>
      <div class="sub-widget"><h3>Discounting and value iteration</h3>
        ${sliderHTML(u + "d", "γ for this panel", 0, 0.99, 0.01, 0.9)}
        <div class="readout" id="${u}-dout"></div>
        <div class="widget-row"><button class="btn small" id="${u}-vi">Next value-iteration sweep</button><button class="btn small" id="${u}-vir">Reset</button></div>
        <div class="readout" id="${u}-viout"></div>
      </div></div>`;
    const A = $("#" + u + "a", el), G = $("#" + u + "g", el), E = $("#" + u + "e", el), D = $("#" + u + "d", el);
    function reset() { Q = Array.from({ length: N }, () => [0, 0]); episodes = 0; lastTraj = [0]; draw(); $("#" + u + "-log", el).textContent = "Q-table starts at zero: the agent knows nothing yet."; }
    const argmax = (row) => (row[RIGHT] > row[LEFT] ? RIGHT : LEFT);       // ties → LEFT, like np.argmax
    function step(s, a) { const ns = a === LEFT ? Math.max(0, s - 1) : Math.min(GOAL, s + 1); return [ns, ns === GOAL ? 10 : -1]; }
    function episode() {
      const alpha = +A.value, gamma = +G.value, eps = +E.value;
      let s = 0, n = 0; const traj = [0];
      while (s !== GOAL && n < 300) {
        const a = Math.random() < eps ? (Math.random() < 0.5 ? LEFT : RIGHT) : argmax(Q[s]);
        const [ns, r] = step(s, a);
        const target = r + (ns === GOAL ? 0 : gamma * Math.max(...Q[ns]));
        Q[s][a] += alpha * (target - Q[s][a]);
        s = ns; n++; traj.push(s);
      }
      episodes++; lastTraj = traj;
    }
    function draw(agentAt = null) {
      $("#" + u + "a-o", el).textContent = fmt(A.value, 2); $("#" + u + "g-o", el).textContent = fmt(G.value, 2); $("#" + u + "e-o", el).textContent = fmt(E.value, 2);
      $("#" + u + "-chain", el).innerHTML = Array.from({ length: N }, (_, i) => {
        const pol = i === GOAL ? "GOAL" : (Q[i][0] === Q[i][1] ? "?" : argmax(Q[i]) === RIGHT ? "→" : "←");
        return (i ? '<span class="arrowtxt" aria-hidden="true">·</span>' : "") + `<div class="st ${i === GOAL ? "goal" : ""} ${agentAt === i ? "agent" : ""}">${i === GOAL ? "+10" : pol}<small>state ${i}</small></div>`;
      }).join("");
      $("#" + u + "-q", el).innerHTML = Q.map((row, i) => {
        if (i === GOAL) return `<tr><th scope="row">${i} (goal)</th><td colspan="3">terminal</td></tr>`;
        const b = row[0] === row[1] ? -1 : argmax(row);
        return `<tr><th scope="row">${i}</th><td class="${b === 0 ? "best" : ""}">${fmt(row[0], 2)}</td><td class="${b === 1 ? "best" : ""}">${fmt(row[1], 2)}</td><td>${b < 0 ? "tie" : b ? "RIGHT" : "LEFT"}</td></tr>`;
      }).join("");
    }
    function report() {
      const policy = Q.slice(0, GOAL).map((r) => (argmax(r) ? "R" : "L")).join(" ");
      const t = lastTraj.length > 24 ? lastTraj.slice(0, 24).join("→") + "→…" : lastTraj.join("→");
      $("#" + u + "-log", el).textContent = `Episodes trained: ${episodes}\nLast episode: ${lastTraj.length - 1} steps\n${t}\nGreedy policy (states 0–3): ${policy}` + (policy === "R R R R" ? "\n✓ The agent learned to go RIGHT everywhere." : "");
    }
    $("#" + u + "-one", el).addEventListener("click", () => {
      episode(); report();
      if (reduceMotion) { draw(); return; }
      let i = 0; const tr = lastTraj.slice(0, 60);
      const t = setInterval(() => { draw(tr[i]); i++; if (i >= tr.length) { clearInterval(t); draw(); } }, 140);
    });
    $("#" + u + "-fifty", el).addEventListener("click", () => { for (let k = 0; k < 50; k++) episode(); draw(); report(); });
    $("#" + u + "-reset", el).addEventListener("click", reset);
    [A, G, E].forEach((x) => x.addEventListener("input", () => draw()));
    reset();

    // Discount + value iteration (lecture's deterministic chain)
    let V, k;
    function dDraw() {
      const g = +D.value;
      $("#" + u + "d-o", el).textContent = fmt(g, 2);
      $("#" + u + "-dout", el).textContent = `Reward 100 ten steps away is worth γ¹⁰ × 100 = ${fmt(Math.pow(g, 10) * 100, 2)} today.\nRewards 5, 10, 20 → G = 5 + ${fmt(g, 2)}·10 + ${fmt(g * g, 4)}·20 = ${fmt(5 + g * 10 + g * g * 20, 2)}`;
    }
    function viReset() { V = [0, 0, 0, 10]; k = 0; viDraw(); }
    function viDraw() { $("#" + u + "-viout", el).textContent = `Chain: state0 → state1 → state2 → GOAL(10), step reward −1\nIteration ${k}: [${V.map((x) => fmt(x, 2)).join(", ")}]`; }
    $("#" + u + "-vi", el).addEventListener("click", () => {
      const g = +D.value, nv = V.slice();
      nv[2] = -1 + g * V[3]; nv[1] = -1 + g * V[2]; nv[0] = -1 + g * V[1];
      V = nv; k++; viDraw();
    });
    $("#" + u + "-vir", el).addEventListener("click", viReset);
    D.addEventListener("input", () => { dDraw(); viReset(); });
    dDraw(); viReset();
  };

  /* ---------- Week 6: Bayes calculator + sprinkler sampling ---------- */
  WIDGETS.bayes = function (el) {
    const u = uid("by");
    el.innerHTML = `<div class="widget">
      <h3 style="margin-top:0">Medical test: prior × likelihood → posterior</h3>
      ${sliderHTML(u + "pr", "Prevalence P(D)", 0.001, 0.5, 0.001, 0.01)}
      ${sliderHTML(u + "se", "Sensitivity P(+|D)", 0.5, 1, 0.01, 0.95)}
      ${sliderHTML(u + "fp", "False-positive P(+|¬D)", 0, 0.5, 0.01, 0.1)}
      <p>P(Disease | positive test) = <span class="big-result" id="${u}-post" aria-live="polite"></span></p>
      <div class="readout" id="${u}-calc"></div>
      <div class="people" id="${u}-ppl" role="img" aria-label="1,000 squares representing people"></div>
      <div class="legend"><span><i style="background:var(--danger)"></i>Ill and positive (true positive)</span><span><i style="background:var(--warm)"></i>Healthy but positive (false positive)</span><span><i style="background:color-mix(in srgb, var(--danger) 35%, var(--surface))"></i>Ill but negative</span><span><i style="background:var(--surface-3)"></i>Healthy and negative</span></div>
      <p class="widget-caption">Each square represents 10 of 10,000 people (counts rounded).</p>
      <div class="sub-widget"><h3>Sprinkler network: P(Rain | Wet grass)</h3>
        <p class="widget-caption">CPTs: P(Rain) = 0.20 · P(Sprinkler | Rain) = 0.01, P(Sprinkler | ¬Rain) = 0.40 · P(Wet | R, S) = 0.99 / 0.80 / 0.90 / 0.00.</p>
        <div class="widget-row"><button class="btn small primary" id="${u}-s1">Rejection sampling: 1,000</button><button class="btn small" id="${u}-s2">10,000</button><button class="btn small" id="${u}-s3">100,000</button><label><input type="checkbox" id="${u}-sp"> Also observe Sprinkler = ON (explaining away)</label></div>
        <div class="belief-bars"><div class="bb"><span>Exact</span><div class="track"><div class="fill p" id="${u}-ex"></div></div><output id="${u}-exo"></output></div>
        <div class="bb"><span>Sampled</span><div class="track"><div class="fill h" id="${u}-sm"></div></div><output id="${u}-smo">–</output></div></div>
        <div class="readout" id="${u}-slog" aria-live="polite"></div>
        <div class="obs-strip" id="${u}-chips" aria-label="Last 24 samples"></div>
      </div></div>`;
    const PR = $("#" + u + "pr", el), SE = $("#" + u + "se", el), FP = $("#" + u + "fp", el);
    function med() {
      const p = +PR.value, s = +SE.value, f = +FP.value;
      $("#" + u + "pr-o", el).textContent = pct(p, 1); $("#" + u + "se-o", el).textContent = pct(s, 0); $("#" + u + "fp-o", el).textContent = pct(f, 0);
      const pPos = s * p + f * (1 - p), post = pPos ? (s * p) / pPos : 0;
      $("#" + u + "-post", el).textContent = pct(post, 2);
      const ill = Math.round(10000 * p), tp = Math.round(ill * s), fpN = Math.round((10000 - ill) * f);
      $("#" + u + "-calc", el).textContent = `P(+) = ${fmt(s, 2)}×${fmt(p, 3)} + ${fmt(f, 2)}×${fmt(1 - p, 3)} = ${fmt(pPos, 4)}\nP(D|+) = ${fmt(s * p, 4)} / ${fmt(pPos, 4)} = ${fmt(post, 4)}\nOf 10,000 people: ${ill} ill → ${tp} test positive; ${10000 - ill} healthy → ${fpN} test positive.\nOnly ${tp} of ${tp + fpN} positives are ill.`;
      const ill10 = Math.round(1000 * p), tp10 = Math.round(ill10 * s), fp10 = Math.round((1000 - ill10) * f);
      let html = "";
      for (let i = 0; i < 1000; i++) html += i < tp10 ? '<i class="tp"></i>' : i < ill10 ? '<i class="fn"></i>' : i < ill10 + fp10 ? '<i class="fp"></i>' : "<i></i>";
      $("#" + u + "-ppl", el).innerHTML = html;
    }
    [PR, SE, FP].forEach((x) => x.addEventListener("input", med)); med();

    const pS = (r) => (r ? 0.01 : 0.4);
    const pW = (r, s) => ({ "11": 0.99, "10": 0.8, "01": 0.9, "00": 0 }[(r ? 1 : 0) + "" + (s ? 1 : 0)]);
    const spOn = () => $("#" + u + "-sp", el).checked;
    function exact() {
      if (spOn()) { const a = 0.2 * 0.01 * 0.99, b = 0.8 * 0.4 * 0.9; return { v: a / (a + b), txt: `P(R,S,W) = 0.2×0.01×0.99 = ${fmt(a, 5)}; P(¬R,S,W) = 0.8×0.4×0.9 = ${fmt(b, 5)}\nP(Rain | Wet, Sprinkler) = ${fmt(a / (a + b), 4)} — knowing the sprinkler was on 'explains away' the wet grass.` }; }
      const a = 0.2 * (0.01 * 0.99 + 0.99 * 0.8), b = 0.8 * (0.4 * 0.9 + 0.6 * 0);
      return { v: a / (a + b), txt: `Enumeration: P(R,W) = 0.2×[0.01×0.99 + 0.99×0.80] = ${fmt(a, 5)}; P(¬R,W) = 0.8×[0.40×0.90 + 0.60×0] = ${fmt(b, 3)}\nP(Rain | Wet) = ${fmt(a, 5)} / ${fmt(a + b, 5)} = ${fmt(a / (a + b), 4)}` };
    }
    function showExact() { const e = exact(); $("#" + u + "-ex", el).style.width = pct(e.v, 2).replace(" ", ""); $("#" + u + "-exo", el).textContent = pct(e.v, 2); $("#" + u + "-slog", el).textContent = e.txt; $("#" + u + "-sm", el).style.width = "0"; $("#" + u + "-smo", el).textContent = "–"; $("#" + u + "-chips", el).innerHTML = ""; }
    function sample(n) {
      let acc = 0, rw = 0; const last = [];
      for (let i = 0; i < n; i++) {
        const r = Math.random() < 0.2, s = Math.random() < pS(r), w = Math.random() < pW(r, s);
        const keep = w && (!spOn() || s);
        if (keep) { acc++; if (r) rw++; }
        if (i < 24) last.push([r, w, keep]);
      }
      const est = acc ? rw / acc : 0;
      $("#" + u + "-sm", el).style.width = pct(est, 2).replace(" ", ""); $("#" + u + "-smo", el).textContent = pct(est, 2);
      $("#" + u + "-slog", el).textContent = exact().txt + `\n\nRejection sampling with ${n.toLocaleString("en-US")} samples: kept ${acc.toLocaleString("en-US")} (${pct(acc / n, 1)}), of which ${rw.toLocaleString("en-US")} had rain → estimate ${fmt(est, 4)}.`;
      $("#" + u + "-chips", el).innerHTML = last.map(([r, w, k]) => `<span class="obs-chip ${k ? "Normal" : "High"}">R:${r ? "Y" : "N"} W:${w ? "Y" : "N"} ${k ? "KEEP" : "REJECT"}</span>`).join("");
    }
    $("#" + u + "-s1", el).addEventListener("click", () => sample(1000));
    $("#" + u + "-s2", el).addEventListener("click", () => sample(10000));
    $("#" + u + "-s3", el).addEventListener("click", () => sample(100000));
    $("#" + u + "-sp", el).addEventListener("change", showExact);
    showExact();
  };

  /* ---------- Week 7: HMM filtering, prediction and Viterbi ---------- */
  WIDGETS.hmm = function (el) {
    const u = uid("hm");
    const T = [[0.9, 0.1], [0.2, 0.8]], O = { High: [0.2, 0.7], Normal: [0.8, 0.3] }, PI = [0.8, 0.2];
    let obs = [];
    el.innerHTML = `<div class="widget">
      <div class="widget-row"><button class="btn small primary" id="${u}-h">+ HIGH reading</button><button class="btn small" id="${u}-n">+ NORMAL reading</button><button class="btn small" id="${u}-u">Undo</button><button class="btn small" id="${u}-r">Reset</button><button class="btn small" id="${u}-demo">Lecture example: HIGH, HIGH</button></div>
      <div class="obs-strip" id="${u}-obs" aria-label="Observation sequence"></div>
      <div class="two-col">
        <div><h3 style="margin-top:0">Filtered belief now</h3>
          <div class="belief-bars"><div class="bb"><span>Healthy</span><div class="track"><div class="fill h" id="${u}-bh"></div></div><output id="${u}-bho"></output></div>
          <div class="bb"><span>Faulty</span><div class="track"><div class="fill f" id="${u}-bf"></div></div><output id="${u}-bfo"></output></div></div>
          <h3>Prediction for the next step</h3>
          <div class="belief-bars"><div class="bb"><span>Faulty next</span><div class="track"><div class="fill p" id="${u}-pf"></div></div><output id="${u}-pfo"></output></div></div>
          <p>Viterbi best path: <span id="${u}-vit" aria-live="polite"></span></p>
        </div>
        <div class="readout" id="${u}-log" aria-live="polite"></div>
      </div>
      <p class="widget-caption">Model: π = [0.8, 0.2]; T = [[0.9, 0.1], [0.2, 0.8]]; P(High | Healthy) = 0.2, P(High | Faulty) = 0.7.</p></div>`;
    const mul = (b, M) => [b[0] * M[0][0] + b[1] * M[1][0], b[0] * M[0][1] + b[1] * M[1][1]];
    function run() {
      let b = PI.slice(), log = obs.length ? "" : "No readings yet: belief = initial π.";
      obs.forEach((o, t) => {
        let pred = b;
        if (t > 0) pred = mul(b, T);
        const sc = [pred[0] * O[o][0], pred[1] * O[o][1]], z = sc[0] + sc[1];
        b = [sc[0] / z, sc[1] / z];
        if (t === obs.length - 1) {
          log = `Step ${t + 1}: reading ${o}\n` + (t > 0 ? `1 Predict: [${fmt(pred[0], 4)}, ${fmt(pred[1], 4)}] (belief @ T)\n` : "1 Predict: not needed at time 1 (use π)\n") +
            `2 Correct: × emission [${O[o].join(", ")}] → [${fmt(sc[0], 4)}, ${fmt(sc[1], 4)}]\n3 Normalize by ${fmt(z, 4)} → [${fmt(b[0], 3)}, ${fmt(b[1], 3)}]`;
        }
      });
      const nxt = mul(b, T);
      const set = (id, v) => { $("#" + u + id, el).style.width = (100 * v).toFixed(1) + "%"; $("#" + u + id + "o", el).textContent = pct(v, 1); };
      set("-bh", b[0]); set("-bf", b[1]); set("-pf", nxt[1]);
      $("#" + u + "-log", el).textContent = log;
      $("#" + u + "-obs", el).innerHTML = obs.map((o, i) => `<span class="obs-chip ${o}">t${i + 1}: ${o.toUpperCase()}</span>`).join("") || '<span class="widget-caption">Add readings to start filtering.</span>';
      // Viterbi
      if (!obs.length) { $("#" + u + "-vit", el).textContent = "–"; return; }
      let d = [PI[0] * O[obs[0]][0], PI[1] * O[obs[0]][1]]; const back = [];
      for (let t = 1; t < obs.length; t++) {
        const nd = [], bp = [];
        for (let j = 0; j < 2; j++) {
          const c0 = d[0] * T[0][j], c1 = d[1] * T[1][j];
          bp.push(c0 >= c1 ? 0 : 1); nd.push(Math.max(c0, c1) * O[obs[t]][j]);
        }
        back.push(bp); d = nd;
      }
      let s = d[0] >= d[1] ? 0 : 1; const path = [s];
      for (let t = back.length - 1; t >= 0; t--) { s = back[t][s]; path.unshift(s); }
      $("#" + u + "-vit", el).innerHTML = path.map((x) => `<span class="obs-chip ${x ? "High" : "Normal"}">${x ? "Faulty" : "Healthy"}</span>`).join(" ") + ` <small>(score ${Math.max(...d).toExponential(3)})</small>`;
    }
    $("#" + u + "-h", el).addEventListener("click", () => { if (obs.length < 14) obs.push("High"); run(); });
    $("#" + u + "-n", el).addEventListener("click", () => { if (obs.length < 14) obs.push("Normal"); run(); });
    $("#" + u + "-u", el).addEventListener("click", () => { obs.pop(); run(); });
    $("#" + u + "-r", el).addEventListener("click", () => { obs = []; run(); });
    $("#" + u + "-demo", el).addEventListener("click", () => { obs = ["High", "High"]; run(); });
    run();
  };

  /* ---------- Week 8: thresholds, sigmoid, confusion matrix ---------- */
  WIDGETS.decisionML = function (el) {
    const u = uid("dm");
    el.innerHTML = `<div class="widget">
      <h3 style="margin-top:0">1 · Maintain or continue?</h3>
      ${sliderHTML(u + "cm", "Maintenance cost ($)", 500, 10000, 100, 2000)}
      ${sliderHTML(u + "cf", "Failure cost ($)", 1000, 50000, 500, 10000)}
      ${sliderHTML(u + "p", "P(failure)", 0, 1, 0.01, 0.3)}
      <svg class="plot-svg" id="${u}-cost" viewBox="0 0 600 220" role="img" aria-label="Expected cost of continuing rises with failure probability; maintenance cost is constant; they cross at the threshold"></svg>
      <p>Decision: <span class="big-result" id="${u}-dec" aria-live="polite"></span></p>
      <div class="readout" id="${u}-dlog"></div>
      <div class="sub-widget"><h3>2 · Sigmoid: score → probability</h3>
        ${sliderHTML(u + "z", "Score z = wᵀx + b", -6, 6, 0.1, 0)}
        ${sliderHTML(u + "tau", "Threshold τ", 0.05, 0.95, 0.05, 0.5)}
        <svg class="plot-svg" id="${u}-sig" viewBox="0 0 600 220" role="img" aria-label="S-shaped sigmoid curve with the current score marked"></svg>
        <div class="readout" id="${u}-slog" aria-live="polite"></div>
      </div>
      <div class="sub-widget"><h3>3 · Confusion matrix and metrics</h3>
        <div class="widget-row"><button class="btn small" data-pre="always">“Always normal” (2 % failures)</button><button class="btn small" data-pre="A">Model A</button><button class="btn small" data-pre="B">Model B</button></div>
        <div class="conf-grid">
          <span></span><span class="hd">Predicted failure</span><span class="hd">Predicted normal</span>
          <span class="hd">Actual failure</span><input type="number" min="0" id="${u}-tp" aria-label="True positives" value="60"><input type="number" min="0" id="${u}-fn" aria-label="False negatives" value="40">
          <span class="hd">Actual normal</span><input type="number" min="0" id="${u}-fp" aria-label="False positives" value="10"><input type="number" min="0" id="${u}-tn" aria-label="True negatives" value="890">
        </div>
        <div class="metric-row" id="${u}-met" aria-live="polite"></div>
        <p class="widget-caption">Model A and Model B use illustrative counts (1,000 cases, 100 failures) that reproduce the lecture's percentages: A = 95 % accuracy / 60 % recall, B = 92 % accuracy / 90 % recall.</p>
      </div></div>`;
    const CM = $("#" + u + "cm", el), CF = $("#" + u + "cf", el), P = $("#" + u + "p", el), Z = $("#" + u + "z", el), TAU = $("#" + u + "tau", el);
    const X0 = 50, X1 = 580, Y0 = 190, Y1 = 20;
    function cost() {
      const cm = +CM.value, cf = +CF.value, p = +P.value, thr = cm / cf;
      $("#" + u + "cm-o", el).textContent = cm; $("#" + u + "cf-o", el).textContent = cf; $("#" + u + "p-o", el).textContent = pct(p, 0);
      const ymax = Math.max(cf, cm) * 1.05, sx = (x) => X0 + x * (X1 - X0), sy = (y) => Y0 - (y / ymax) * (Y0 - Y1);
      const t = Math.min(thr, 1);
      $("#" + u + "-cost", el).innerHTML = `
        <line class="axis" x1="${X0}" y1="${Y0}" x2="${X1}" y2="${Y0}"/><line class="axis" x1="${X0}" y1="${Y0}" x2="${X0}" y2="${Y1}"/>
        ${[0, 0.25, 0.5, 0.75, 1].map((x) => `<text class="lbl" x="${sx(x)}" y="${Y0 + 16}" text-anchor="middle">${x * 100}%</text>`).join("")}
        <text class="lbl" x="${X1}" y="${Y0 - 6}" text-anchor="end">P(failure)</text>
        <line class="curve" x1="${sx(0)}" y1="${sy(0)}" x2="${sx(1)}" y2="${sy(cf)}"/>
        <line class="curve" style="stroke:var(--accent)" x1="${sx(0)}" y1="${sy(cm)}" x2="${sx(1)}" y2="${sy(cm)}"/>
        <text class="lbl" x="${sx(0.98)}" y="${sy(cf) + 16}" text-anchor="end">continue: p × ${cf}</text>
        <text class="lbl" x="${sx(0.02)}" y="${sy(cm) - 6}">maintain: ${cm}</text>
        ${thr <= 1 ? `<line class="thr" x1="${sx(t)}" y1="${Y0}" x2="${sx(t)}" y2="${Y1}"/><text class="lbl" x="${sx(t) + 4}" y="${Y1 + 12}">threshold ${fmt(thr, 2)}</text>` : ""}
        <circle class="marker" cx="${sx(p)}" cy="${sy(p * cf)}" r="7"/>`;
      const cc = p * cf, dec = cc > cm ? "Maintain" : cc < cm ? "Continue" : "Either (tie)";
      $("#" + u + "-dec", el).textContent = dec;
      $("#" + u + "-dlog", el).textContent = `Expected cost of continuing = ${fmt(p, 2)} × ${cf} = ${fmt(cc, 0)}\nCost of maintaining = ${cm}\nThreshold = C_maint / C_failure = ${cm} / ${cf} = ${fmt(thr, 3)} → maintain when P(failure) > ${fmt(thr, 3)}`;
    }
    function sig() {
      const z = +Z.value, tau = +TAU.value, s = 1 / (1 + Math.exp(-z));
      $("#" + u + "z-o", el).textContent = fmt(z, 1); $("#" + u + "tau-o", el).textContent = fmt(tau, 2);
      const sx = (x) => X0 + ((x + 6) / 12) * (X1 - X0), sy = (y) => Y0 - y * (Y0 - Y1);
      let d = ""; for (let x = -6; x <= 6.001; x += 0.2) d += (d ? " L " : "M ") + sx(x).toFixed(1) + " " + sy(1 / (1 + Math.exp(-x))).toFixed(1);
      $("#" + u + "-sig", el).innerHTML = `
        <line class="axis" x1="${X0}" y1="${Y0}" x2="${X1}" y2="${Y0}"/><line class="axis" x1="${sx(0)}" y1="${Y0}" x2="${sx(0)}" y2="${Y1}"/>
        <line class="gridl" x1="${X0}" y1="${sy(tau)}" x2="${X1}" y2="${sy(tau)}"/><text class="lbl" x="${X1}" y="${sy(tau) - 5}" text-anchor="end">τ = ${fmt(tau, 2)}</text>
        ${[-6, -4, -2, 0, 2, 4, 6].map((x) => `<text class="lbl" x="${sx(x)}" y="${Y0 + 16}" text-anchor="middle">${x}</text>`).join("")}
        <text class="lbl" x="${sx(0) - 6}" y="${sy(1) + 4}" text-anchor="end">1</text><text class="lbl" x="${sx(0) - 6}" y="${sy(0.5) + 4}" text-anchor="end">0.5</text>
        <path class="curve" d="${d}"/><circle class="marker" cx="${sx(z)}" cy="${sy(s)}" r="7"/>`;
      $("#" + u + "-slog", el).textContent = `σ(${fmt(z, 1)}) = 1 / (1 + e^${fmt(-z, 1)}) = ${fmt(s, 3)}\nWith threshold τ = ${fmt(tau, 2)} → predict ${s >= tau ? "FAILURE (positive class)" : "NORMAL"}`;
    }
    const ids = ["tp", "fn", "fp", "tn"], inp = (k) => $("#" + u + "-" + k, el);
    function met() {
      const [tp, fn, fp, tn] = ids.map((k) => Math.max(0, +inp(k).value || 0)), n = tp + fn + fp + tn;
      const acc = n ? (tp + tn) / n : 0, rec = tp + fn ? tp / (tp + fn) : 0, pre = tp + fp ? tp / (tp + fp) : 0, f1 = pre + rec ? (2 * pre * rec) / (pre + rec) : 0;
      $("#" + u + "-met", el).innerHTML = `<div><b>${pct(acc, 1)}</b><span>Accuracy (TP+TN)/N</span></div><div><b>${pct(pre, 1)}</b><span>Precision TP/(TP+FP)</span></div><div><b>${pct(rec, 1)}</b><span>Recall TP/(TP+FN)</span></div><div><b>${fmt(f1, 3)}</b><span>F1 = 2PR/(P+R)</span></div>`;
    }
    const PRE = { always: [0, 20, 0, 980], A: [60, 40, 10, 890], B: [90, 10, 70, 830] };
    $$("[data-pre]", el).forEach((b) => b.addEventListener("click", () => { PRE[b.dataset.pre].forEach((v, i) => (inp(ids[i]).value = v)); met(); }));
    [CM, CF, P].forEach((x) => x.addEventListener("input", cost));
    [Z, TAU].forEach((x) => x.addEventListener("input", sig));
    ids.forEach((k) => inp(k).addEventListener("input", met));
    cost(); sig(); met();
  };

  /* ---------- Week 9: perceptron trainer ---------- */
  WIDGETS.perceptron = function (el) {
    const u = uid("pc");
    const X = [[0, 0], [0, 1], [1, 0], [1, 1]];
    const DATA = { AND: [0, 0, 0, 1], OR: [0, 1, 1, 1], XOR: [0, 1, 1, 0] };
    // Weights are stored in tenths (integers) so that α = 0.1 updates are exact.
    let w, b, idx, epoch, epochErr, y, logLines;
    el.innerHTML = `<div class="widget"><span class="am-badge">from extra sources</span>
      <div class="widget-row"><label for="${u}-d">Dataset</label><select id="${u}-d"><option>AND</option><option>OR</option><option>XOR</option></select>
        <button class="btn small primary" id="${u}-s">Train step</button><button class="btn small" id="${u}-e">Train epoch</button><button class="btn small" id="${u}-c">Train until converged</button><button class="btn small" id="${u}-r">Reset</button></div>
      <div class="two-col">
        <svg class="plot-svg" id="${u}-svg" viewBox="0 0 300 300" role="img" aria-label="The four input points and the perceptron's current decision line"></svg>
        <div><div class="readout" id="${u}-w" aria-live="polite"></div><div class="readout" id="${u}-log" style="max-height:190px;overflow:auto"></div></div>
      </div>
      <div class="legend"><span><i style="background:var(--accent)"></i>Label 1</span><span><i style="background:var(--danger)"></i>Label 0</span><span><i style="background:var(--warm)"></i>Decision line w₁x₁ + w₂x₂ + b = 0 (shaded side = predicted 1)</span></div></div>`;
    const svg = $("#" + u + "-svg", el);
    const pred = (x) => (w[0] * x[0] + w[1] * x[1] + b > 0 ? 1 : 0);   // integer arithmetic (tenths)
    function reset() { w = [0, 0]; b = 0; idx = 0; epoch = 1; epochErr = 0; y = DATA[$("#" + u + "-d", el).value]; logLines = []; draw(-1); }
    function trainOne() {
      const x = X[idx], p = pred(x), err = y[idx] - p;
      if (err) { w[0] += err * x[0]; w[1] += err * x[1]; b += err; epochErr++; }
      logLines.push(`epoch ${epoch}, x=(${x}) y=${y[idx]} ŷ=${p}` + (err ? ` → update w=(${w[0] / 10}, ${w[1] / 10}) b=${b / 10}` : " ✓"));
      const cur = idx; idx++;
      let ended = null;
      if (idx === 4) { ended = epochErr; logLines.push(`— end of epoch ${epoch}: ${epochErr} error(s)`); idx = 0; epoch++; epochErr = 0; }
      draw(cur); return ended;
    }
    function draw(cur) {
      const sx = (x) => 50 + x * 200, sy = (v) => 250 - v * 200;
      const W1 = w[0] / 10, W2 = w[1] / 10, B = b / 10;
      let line = "", shade = "";
      // Shade the predicted-1 region by sampling a coarse grid
      for (let gx = -0.25; gx <= 1.26; gx += 0.1) for (let gy = -0.25; gy <= 1.26; gy += 0.1) if (W1 * gx + W2 * gy + B > 1e-9) shade += `<rect x="${sx(gx) - 10}" y="${sy(gy) - 10}" width="20" height="20" fill="var(--accent)" opacity=".08"/>`;
      if (Math.abs(W2) > 1e-9) { const ya = (-B - W1 * -0.25) / W2, yb = (-B - W1 * 1.25) / W2; line = `<line class="bound" x1="${sx(-0.25)}" y1="${sy(ya)}" x2="${sx(1.25)}" y2="${sy(yb)}"/>`; }
      else if (Math.abs(W1) > 1e-9) { const xv = -B / W1; line = `<line class="bound" x1="${sx(xv)}" y1="${sy(-0.25)}" x2="${sx(xv)}" y2="${sy(1.25)}"/>`; }
      svg.innerHTML = `<defs><clipPath id="${u}-clip"><rect x="0" y="0" width="300" height="300"/></clipPath></defs><g clip-path="url(#${u}-clip)">${shade}
        <line class="axis" x1="20" y1="${sy(0)}" x2="290" y2="${sy(0)}"/><line class="axis" x1="${sx(0)}" y1="10" x2="${sx(0)}" y2="280"/>${line}
        ${X.map((x, i) => `<circle class="${y[i] ? "pt1" : "pt0"}" cx="${sx(x[0])}" cy="${sy(x[1])}" r="${i === cur ? 15 : 11}"/><text x="${sx(x[0])}" y="${sy(x[1]) + 30}" text-anchor="middle" font-size="12">(${x}) → ${y[i]}</text>`).join("")}</g>`;
      const all = X.every((x, i) => pred(x) === y[i]);
      $("#" + u + "-w", el).textContent = `w₁ = ${W1}, w₂ = ${W2}, b = ${B}\nPredictions: ${X.map((x) => pred(x)).join(", ")} (targets ${y.join(", ")})\n${all ? "✓ All four points classified correctly." : "Not yet separated."}`;
      $("#" + u + "-log", el).textContent = logLines.slice(-40).join("\n") || "Press Train step to process one example.";
      const lg = $("#" + u + "-log", el); lg.scrollTop = lg.scrollHeight;
    }
    $("#" + u + "-s", el).addEventListener("click", () => trainOne());
    $("#" + u + "-e", el).addEventListener("click", () => { let r = null; do { r = trainOne(); } while (r === null); });
    $("#" + u + "-c", el).addEventListener("click", () => {
      for (let k = 0; k < 25; k++) { let r = null; do { r = trainOne(); } while (r === null); if (r === 0) return; }
      logLines.push("Stopped after 25 epochs without converging" + ($("#" + u + "-d", el).value === "XOR" ? ": XOR is not linearly separable, so no single line works." : "."));
      draw(-1);
    });
    $("#" + u + "-r", el).addEventListener("click", reset);
    $("#" + u + "-d", el).addEventListener("change", reset);
    reset();
  };

  /* ---------- Week 10: next-token sampling with temperature ---------- */
  WIDGETS.tokens = function (el) {
    const u = uid("tk");
    const toks = [["box", 0.45], ["cup", 0.25], ["tool", 0.2], ["sky", 0.1]];
    let counts = null;
    el.innerHTML = `<div class="widget"><span class="am-badge">from extra sources, illustrative numbers</span>
      <p>Context: <strong>“The robot picked up the …”</strong></p>
      ${sliderHTML(u + "t", "Temperature T", 0.1, 2, 0.05, 1)}
      <div class="token-bars" id="${u}-bars"></div>
      <div class="widget-row"><button class="btn small primary" id="${u}-one">Generate one continuation</button><button class="btn small" id="${u}-100">Sample 100 times</button></div>
      <div class="readout" id="${u}-log" aria-live="polite"></div></div>`;
    const T = $("#" + u + "t", el);
    const probs = () => { const t = +T.value, z = toks.map(([, p]) => Math.log(p) / t), m = Math.max(...z), e = z.map((x) => Math.exp(x - m)), s = e.reduce((a, b) => a + b, 0); return e.map((x) => x / s); };
    const pick = (ps) => { let r = Math.random(), i = 0; while (i < ps.length - 1 && r >= ps[i]) { r -= ps[i]; i++; } return i; };
    function draw() {
      $("#" + u + "t-o", el).textContent = fmt(T.value, 2);
      const ps = probs();
      $("#" + u + "-bars", el).innerHTML = toks.map(([w], i) => `<div class="tb"><span><strong>${w}</strong></span><div class="track"><div class="fill" style="width:${(100 * ps[i]).toFixed(1)}%"></div></div><output>${pct(ps[i], 1)}${counts ? ` · ${counts[i]}×` : ""}</output></div>`).join("");
    }
    T.addEventListener("input", () => { counts = null; draw(); });
    $("#" + u + "-one", el).addEventListener("click", () => { const i = pick(probs()); $("#" + u + "-log", el).textContent = `“The robot picked up the ${toks[i][0]}.”  (T = ${fmt(T.value, 2)})`; });
    $("#" + u + "-100", el).addEventListener("click", () => {
      const ps = probs(); counts = [0, 0, 0, 0];
      for (let k = 0; k < 100; k++) counts[pick(ps)]++;
      draw();
      $("#" + u + "-log", el).textContent = `100 samples at T = ${fmt(T.value, 2)}: ` + toks.map(([w], i) => `${w} ${counts[i]}`).join(", ") + `.\n${+T.value < 0.5 ? "Low temperature: almost always the most likely word." : +T.value > 1.4 ? "High temperature: unlikely words like “sky” appear much more often." : "T = 1 keeps the model's original probabilities."}`;
    });
    draw();
  };

  /* Extra figures from js/visuals.js */
  if (window.ATLAS_VISUALS) Object.assign(WIDGETS, window.ATLAS_VISUALS.widgets);

  /* ------------------------------------------------------------------
     6. Boot: menu, theme, keyboard, reading progress, router
     ------------------------------------------------------------------ */
  function openMenu() { $("#sidebar").classList.add("open"); $("#scrim").hidden = false; $("#menuBtn").setAttribute("aria-expanded", "true"); }
  function closeMenu() { $("#sidebar").classList.remove("open"); $("#scrim").hidden = true; $("#menuBtn").setAttribute("aria-expanded", "false"); }
  $("#menuBtn").addEventListener("click", () => ($("#sidebar").classList.contains("open") ? closeMenu() : openMenu()));
  $("#scrim").addEventListener("click", closeMenu);

  function setThemeLabel() {
    const dark = document.documentElement.getAttribute("data-theme") === "dark";
    $("#themeBtn").setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
  }
  $("#themeBtn").addEventListener("click", () => {
    const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem("atlas-theme", next); } catch (e) { /* ignore */ }
    setThemeLabel();
  });
  setThemeLabel();

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
    const tag = (e.target.tagName || "").toLowerCase();
    if (["input", "textarea", "select"].includes(tag) || e.target.isContentEditable) return;
    const i = pageIndex(currentId());
    if (e.key === "ArrowRight" && PAGES[i + 1]) location.hash = PAGES[i + 1].id;
    if (e.key === "ArrowLeft" && PAGES[i - 1]) location.hash = PAGES[i - 1].id;
  });

  window.addEventListener("scroll", () => {
    const h = document.documentElement, max = h.scrollHeight - h.clientHeight;
    $("#readBar").style.width = (max > 0 ? (100 * h.scrollY) / max : 0) + "%";
  }, { passive: true });

  window.addEventListener("hashchange", route);
  route();
})();
