/* =====================================================================
   loader.js — neural-network page loader (plays on EVERY visit, ~5 seconds)
   Load this file with a script tag placed directly under the loader markup
   at the top of the page body (see the install instructions).
   ===================================================================== */
/* =====================================================================
   KS NEURAL LOADER
   Everything is driven by one clock, render(t), so each frame is a pure
   function of time — easy to tweak, and `?freeze=0.5` shows a still
   frame at 50% of the animation (handy while you adjust the design).
   ===================================================================== */
(function () {
  "use strict";

  /* ---------- CONFIG: the knobs you're most likely to change ---------- */
  var CONFIG = {
    duration: 5000,                    // total length in ms (5000 = 5 seconds) — loader is gone at this moment
    inputNodes: 3,
    hiddenNodes: 4,
    outputNodes: 2,
    outputLabels: ["USER", "BOT"],     // first one is the "winner"
    title: "ks-loader — classify(visitor)",
    resultTitle: "USER",
    resultWord: "recognized",
    // Stage timings in ms on a 2000ms design clock (auto-scaled if you change `duration`)
    stages: {
      windowIn: [0, 150],
      userIn:   [60, 220],
      cookies:  [200, 330],            // cookies are auto-accepted at the END of this window
      toInput:  [340, 540],
      toHidden: [540, 770],
      toOutput: [770, 1000],
      toResult: [1000, 1130],
      cardIn:   [1090, 1190],
      count:    [1130, 1580],          // 0% -> 100%
      fadeOut:  [1860, 2000]
    },
    phases: [                          // text shown in the status line
      [0,    "initializing network…"],
      [200,  "user detected — accepting cookies"],
      [330,  "cookies accepted — forward pass"],
      [540,  "hidden layer — weighting signals"],
      [770,  "output layer — classifying"],
      [1000, "decision: USER"]
    ],
    donePhase: "result: USER — confidence 100%"
  };

  var DESIGN = 2000;                                       // the clock the stages are written against — leave this at 2000;
                                                           // everything stretches to `duration` automatically
  var S = CONFIG.stages, NS = "http://www.w3.org/2000/svg";
  var $ = function (id) { return document.getElementById(id); };
  var loaderEl = $("ks-loader"), winEl = $("klWindow"), svg = $("klSvg"), statusEl = $("klStatus");
  if (!loaderEl || !winEl || !svg || !statusEl) return;   // page has no loader markup — do nothing
  var reduceMotion = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- tiny helpers ---------- */
  function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function span(t, w) { return clamp((t - w[0]) / (w[1] - w[0])); }
  function easeOut(x) { return 1 - Math.pow(1 - x, 3); }
  function easeInOut(x) { return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function backOut(x) { var c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); }
  function setText(node, str) { if (node.__t !== str) { node.textContent = str; node.__t = str; } }
  function toggle(node, cls, on) { if (node.__c !== on) { node.classList.toggle(cls, on); node.__c = on; } }
  function el(tag, attrs, parent) {
    var n = document.createElementNS(NS, tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function column(n, gap, center) {          // n evenly-spaced positions centred on `center`
    var out = []; for (var i = 0; i < n; i++) out.push(center + (i - (n - 1) / 2) * gap); return out;
  }

  /* ---------- cookie auto-accept (runs once per play, at the end of the "cookies" window) ---------- */
  var cookiesSaved = false;
  function acceptCookies() {
    if (cookiesSaved) return; cookiesSaved = true;
    try { localStorage.setItem("ks_cookies", "accepted"); } catch (e) {}
    try { document.cookie = "ks_cookies=accepted; max-age=31536000; path=/; SameSite=Lax"; } catch (e) {}
  }

  /* ---------- layout: wide screens go left→right, phones go top→bottom ---------- */
  function layout(portrait) {
    var nI = CONFIG.inputNodes, nH = CONFIG.hiddenNodes, nO = CONFIG.outputNodes, L = { portrait: portrait }, i;
    if (!portrait) {
      L.w = 1000; L.h = 410; var cy = 222;
      L.user = { x: 90, y: cy, r: 34 };
      L.userLabel = { x: 90, y: cy + 52 }; L.chip = { x: 90, y: cy + 80, w: 150, h: 24 };
      L.layers = [
        { name: "INPUT",  r: 24, pts: column(nI, 78, cy).map(function (y) { return { x: 300, y: y }; }), lab: { x: 300, y: 34, anchor: "middle", cls: "" } },
        { name: "HIDDEN", r: 26, pts: column(nH, 78, cy).map(function (y) { return { x: 520, y: y }; }), lab: { x: 520, y: 34, anchor: "middle", cls: "" } },
        { name: "OUTPUT", r: 28, pts: column(nO, 112, cy).map(function (y) { return { x: 725, y: y }; }), lab: { x: 725, y: 34, anchor: "middle", cls: "" } }
      ];
      L.card = { x: 806, y: cy - 84, w: 172, h: 168 };
      L.cardEnd = function (j, m) { return { x: L.card.x, y: cy + (j - (m - 1) / 2) * 24 }; };
    } else {
      L.w = 400; L.h = 664;
      L.user = { x: 200, y: 62, r: 28 };
      L.userLabel = { x: 200, y: 108 }; L.chip = { x: 200, y: 132, w: 150, h: 22 };
      L.layers = [
        { name: "INPUT",  r: 22, pts: column(nI, 96, 200).map(function (x) { return { x: x, y: 214 }; }), lab: { x: 10, y: 218, anchor: "start", cls: "small" } },
        { name: "HIDDEN", r: 22, pts: column(nH, 78, 200).map(function (x) { return { x: x, y: 324 }; }), lab: { x: 10, y: 328, anchor: "start", cls: "small" } },
        { name: "OUTPUT", r: 25, pts: column(nO, 110, 200).map(function (x) { return { x: x, y: 434 }; }), lab: { x: 10, y: 438, anchor: "start", cls: "small" } }
      ];
      L.card = { x: 80, y: 484, w: 240, h: 168 };
      L.cardEnd = function (j, m) { return { x: 200 + (j - (m - 1) / 2) * 40, y: L.card.y }; };
    }
    return L;
  }

  /* ---------- build the SVG (called at the start of every play) ---------- */
  var R, L;
  function build() {
    L = layout(window.innerWidth < 720);
    svg.innerHTML = "";
    svg.setAttribute("viewBox", "0 0 " + L.w + " " + L.h);
    R = { edges: [], layers: [] };

    var gEdges = el("g", {}, svg), gNodes = el("g", {}, svg), gUser = el("g", {}, svg), gChip = el("g", {}, svg), gCard = el("g", {}, svg);

    // column labels
    L.layers.forEach(function (ly) {
      var t = el("text", { x: ly.lab.x, y: ly.lab.y, "text-anchor": ly.lab.anchor, "class": "kl-col " + ly.lab.cls }, svg);
      t.textContent = ly.name;
    });

    // --- nodes (with a hard offset shadow, like everything else on the site) ---
    function makeNode(x, y, r, labelText) {
      var g = el("g", {}, gNodes);
      el("circle", { cx: 4, cy: 4, r: r, "class": "kl-shadow" }, g);
      el("circle", { cx: 0, cy: 0, r: r, "class": "kl-base" }, g);
      var glow = el("circle", { cx: 0, cy: 0, r: r - 1.5, "class": "kl-glow" }, g);
      var txt = null;
      if (labelText) { txt = el("text", { x: 0, y: 0, "class": "kl-nodetext" }, g); txt.textContent = labelText; }
      return { g: g, glow: glow, txt: txt, x: x, y: y, r: r };
    }
    L.layers.forEach(function (ly, li) {
      var arr = [];
      ly.pts.forEach(function (p, i) {
        var n = makeNode(p.x, p.y, ly.r, li === 2 ? (CONFIG.outputLabels[i] || "") : "");
        if (li === 2 && i === 0) n.glow.setAttribute("class", "kl-glow win");
        arr.push(n);
      });
      R.layers.push(arr);
    });

    // --- user icon (the "input"): circle + head + shoulders ---
    R.user = gUser;
    var us = L.user.r / 34;
    el("circle", { cx: 4 * us + L.user.x, cy: 4 * us + L.user.y, r: L.user.r, "class": "kl-shadow" }, gUser);
    var ug = el("g", { transform: "translate(" + L.user.x + " " + L.user.y + ") scale(" + us + ")" }, gUser);
    R.userInner = ug;
    el("circle", { cx: 0, cy: 0, r: 34, "class": "kl-base" }, ug);
    el("circle", { cx: 0, cy: -9, r: 8.5, "class": "kl-user-ico" }, ug);
    el("path", { d: "M-17 18 C-17 5 -9 2 0 2 C9 2 17 5 17 18 Z", "class": "kl-user-ico" }, ug);
    R.userLabelEl = el("text", { x: L.userLabel.x, y: L.userLabel.y, "text-anchor": "middle", "class": "kl-nodetext" }, svg);
    R.userLabelEl.textContent = "USER"; R.userLabelEl.style.letterSpacing = ".14em";

    // --- cookie chip ---
    var c = L.chip;
    R.chip = gChip;
    el("rect", { x: c.x - c.w / 2 + 3, y: c.y - c.h / 2 + 3, width: c.w, height: c.h, "class": "kl-shadow" }, gChip);
    R.chipBg = el("rect", { x: c.x - c.w / 2, y: c.y - c.h / 2, width: c.w, height: c.h, "class": "kl-chip-bg" }, gChip);
    R.chipText = el("text", { x: c.x, y: c.y + .5, "class": "kl-chip-text" }, gChip);

    // --- result card ---
    var cd = L.card, cx = cd.x + cd.w / 2;
    R.card = gCard;
    el("rect", { x: cd.x + 6, y: cd.y + 6, width: cd.w, height: cd.h, "class": "kl-shadow" }, gCard);
    el("rect", { x: cd.x, y: cd.y, width: cd.w, height: cd.h, "class": "kl-card-bg" }, gCard);
    var title = el("text", { x: cx, y: cd.y + 42, "class": "kl-card-title" }, gCard); title.textContent = CONFIG.resultTitle;
    var bw = 132, bh = 26;
    R.badgeBg = el("rect", { x: cx - bw / 2, y: cd.y + 56, width: bw, height: bh, "class": "kl-badge-bg" }, gCard);
    R.badgeText = el("text", { x: cx, y: cd.y + 56 + bh / 2 + .5, "class": "kl-badge-text" }, gCard);
    R.pct = el("text", { x: cx, y: cd.y + 126, "class": "kl-pct" }, gCard);
    R.barW = cd.w - 40;
    el("rect", { x: cd.x + 20, y: cd.y + 140, width: R.barW, height: 12, "class": "kl-bar-track" }, gCard);
    R.barFill = el("rect", { x: cd.x + 20, y: cd.y + 140, width: 0, height: 12, "class": "kl-bar-fill" }, gCard);

    // --- edges (fully connected between layers) ---
    function addEdge(a, b, stage, i, n, extra) {
      var dx = b.x - a.x, dy = b.y - a.y, d = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / d, uy = dy / d;
      var x1 = a.x + ux * (a.r + 2), y1 = a.y + uy * (a.r + 2), x2 = b.x - ux * ((b.r || 0) + 2), y2 = b.y - uy * ((b.r || 0) + 2);
      var base = el("line", { x1: x1, y1: y1, x2: x2, y2: y2, "class": "kl-edge" }, gEdges);
      var prog = el("line", { x1: x1, y1: y1, x2: x1, y2: y1, "class": "kl-prog" }, gEdges);
      var dot = el("circle", { cx: x1, cy: y1, r: 5, "class": "kl-dot" }, gEdges);
      var e = { prog: prog, dot: dot, x1: x1, y1: y1, x2: x2, y2: y2, stage: stage, i: i, n: n, rest: .5, win: !!(extra && extra.win), isResult: stage === "toResult" };
      R.edges.push(e);
    }
    var uNode = { x: L.user.x, y: L.user.y, r: L.user.r };
    R.layers[0].forEach(function (nd, i) { addEdge(uNode, nd, "toInput", i, R.layers[0].length); });
    var k = 0, nIH = R.layers[0].length * R.layers[1].length;
    R.layers[0].forEach(function (a) { R.layers[1].forEach(function (b) { addEdge(a, b, "toHidden", k++, nIH); }); });
    k = 0; var nHO = R.layers[1].length * R.layers[2].length;
    R.layers[1].forEach(function (a) { R.layers[2].forEach(function (b) { addEdge(a, b, "toOutput", k++, nHO); }); });
    R.layers[2].forEach(function (a, j) {
      var end = L.cardEnd(j, R.layers[2].length);
      addEdge(a, { x: end.x, y: end.y, r: 0 }, "toResult", j, R.layers[2].length, { win: j === 0 });
    });

    // when each node "receives" its signal
    R.layers[0].forEach(function (n, i) { n.arrive = S.toInput[1] + i * 18; });
    R.layers[1].forEach(function (n, i) { n.arrive = S.toHidden[1] + i * 18; });
    R.layers[2].forEach(function (n, i) { n.arrive = S.toOutput[1] + i * 18; });

    setText($("klTitle"), CONFIG.title);
    cookiesSaved = false;
  }

  /* ---------- one frame: t is time in "design ms" (0..2000) ---------- */
  function render(t) {
    // window + overall fade
    var w = easeOut(span(t, S.windowIn));
    winEl.style.opacity = w;
    winEl.style.transform = "translateY(" + ((1 - w) * 16) + "px)";
    loaderEl.style.opacity = 1 - easeInOut(span(t, S.fadeOut));

    // user icon pops in
    var u = span(t, S.userIn), us = .4 + .6 * backOut(u);
    var ux = L.user.x, uy = L.user.y;
    R.user.style.opacity = Math.min(1, u * 2.5);
    R.user.setAttribute("transform", "translate(" + (ux - ux * us) + " " + (uy - uy * us) + ") scale(" + us + ")");
    R.userLabelEl.style.opacity = u;

    // cookie chip: "accepting…" -> accepted ✓ (and actually store the flag)
    var ch = span(t, S.cookies), accepted = t >= S.cookies[1] - 5;
    R.chip.style.opacity = ch;
    R.chip.setAttribute("transform", "translate(0 " + ((1 - ch) * 8) + ")");
    setText(R.chipText, accepted ? "COOKIES \u2713 ACCEPTED" : "ACCEPTING COOKIES\u2026");
    toggle(R.chipBg, "ok", accepted); toggle(R.chipText, "ok", accepted);
    if (accepted) acceptCookies();

    // pulses travelling along the edges
    var decided = t >= S.toOutput[1] + 40;
    R.edges.forEach(function (e) {
      var st = S[e.stage], len = st[1] - st[0];
      var uP = span(t, [st[0] + (e.i / e.n) * len * .35, st[1]]);
      var p = easeInOut(uP);
      e.prog.setAttribute("x2", e.x1 + (e.x2 - e.x1) * p);
      e.prog.setAttribute("y2", e.y1 + (e.y2 - e.y1) * p);
      var rest = e.isResult ? (e.win ? 1 : .18) : .5;
      e.prog.style.opacity = uP <= 0 ? 0 : (uP < 1 ? 1 : (e.isResult && decided ? rest : (e.isResult ? 1 : rest)));
      var moving = uP > 0 && uP < 1;
      e.dot.style.opacity = moving ? 1 : 0;
      if (moving) { e.dot.setAttribute("cx", e.x1 + (e.x2 - e.x1) * p); e.dot.setAttribute("cy", e.y1 + (e.y2 - e.y1) * p); }
    });

    // neurons light up when their signal arrives
    var dec = span(t, [S.toOutput[1] + 40, S.toOutput[1] + 200]);
    R.layers.forEach(function (layer, li) {
      layer.forEach(function (n, i) {
        var a = span(t, [n.arrive - 70, n.arrive]);
        var pop = 1 + .16 * Math.sin(Math.PI * span(t, [n.arrive - 20, n.arrive + 170]));
        var isOut = li === 2, loser = isOut && i !== 0;
        n.glow.style.opacity = loser ? a * (1 - .85 * dec) : a;
        if (isOut && !loser) pop *= 1 + .08 * dec;
        n.g.setAttribute("transform", "translate(" + n.x + " " + n.y + ") scale(" + pop + ")");
        n.g.style.opacity = loser ? 1 - .5 * dec : 1;
        if (n.txt) { n.txt.style.fill = (!loser && a > .5) ? "#0B0B0D" : ""; }
      });
    });

    // result card: slides in, counts to 100%
    var ci = easeOut(span(t, S.cardIn));
    R.card.style.opacity = ci;
    R.card.setAttribute("transform", L.portrait ? "translate(0 " + ((1 - ci) * 22) + ")" : "translate(" + ((1 - ci) * 26) + " 0)");
    var pct = Math.round(100 * easeOut(span(t, S.count)));
    setText(R.pct, pct + "%");
    R.barFill.setAttribute("width", R.barW * pct / 100);
    var done = pct >= 100;
    setText(R.badgeText, done ? CONFIG.resultWord + " \u2713" : "recognizing\u2026");
    toggle(R.badgeBg, "ok", done); toggle(R.badgeText, "ok", done);

    // status line
    var msg = CONFIG.phases[0][1];
    CONFIG.phases.forEach(function (ph) { if (t >= ph[0]) msg = ph[1]; });
    if (done) msg = CONFIG.donePhase;
    setText(statusEl, msg);
  }

  /* ---------- run / finish ---------- */
  var raf = 0, lastRun = {};
  function finish() {
    loaderEl.style.display = "none";
    document.documentElement.classList.remove("ks-loading");
    lastRun.end = performance.now();
    document.dispatchEvent(new CustomEvent("ks-loader-done"));
  }
  function play() {
    cancelAnimationFrame(raf);
    // Re-read the saved theme so a replay always reflects the current choice.
    try { var s = localStorage.getItem("ks_theme"); document.documentElement.setAttribute("data-theme", s === "dark" ? "dark" : "light"); } catch (e) {}
    loaderEl.style.display = ""; loaderEl.style.opacity = 1;
    loaderEl.style.animation = "none"; void loaderEl.offsetWidth; loaderEl.style.animation = "";   // restart the CSS failsafe
    document.documentElement.classList.add("ks-loading");
    build();

    if (typeof window.KS_LOADER_FREEZE === "number") { render(window.KS_LOADER_FREEZE * DESIGN); return; }   // dev-only: still frame
    if (reduceMotion) { render(1800); setTimeout(finish, 900); return; }          // no motion: show the result briefly

    var k = CONFIG.duration / DESIGN, t0 = null;
    lastRun = { start: performance.now() };
    (function frame(now) {
      if (t0 === null) t0 = now;
      var elapsed = Math.min(now - t0, CONFIG.duration);
      render(elapsed / k);
      if (elapsed < CONFIG.duration) raf = requestAnimationFrame(frame); else finish();
    })(performance.now());
  }

  window.KSLoader = { play: play, config: CONFIG, get lastRun() { return lastRun; } };

  play();   // <- the loader runs on EVERY page load, no "only the first visit" check
})();
