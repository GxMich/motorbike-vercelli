// Motorbike Vercelli — concept "Cruscotto"
(function () {
  "use strict";

  var root = document.documentElement;
  var hasGSAP = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";
  if (!hasGSAP) root.classList.add("reduced"); // senza librerie: versione statica, tutto leggibile
  var reduced = root.classList.contains("reduced");
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------------------------------------------------------
     Orari (dal sito ufficiale) e stato aperto/chiuso
     --------------------------------------------------------- */
  var HOURS = [[], [[930, 1170]], [[540, 720], [930, 1170]], [[540, 720], [930, 1170]], [[540, 720], [930, 1170]], [[540, 720], [930, 1170]], [[540, 720], [930, 1170]]];
  var DAYS = ["domenica", "lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato"];
  function fmt(m) { var h = Math.floor(m / 60), mm = m % 60; return h + ":" + (mm < 10 ? "0" : "") + mm; }
  function rome() {
    try {
      var p = {}; new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Rome", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
        .formatToParts(new Date()).forEach(function (x) { p[x.type] = x.value; });
      return { day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(p.weekday), h: +p.hour, m: +p.minute, min: +p.hour * 60 + +p.minute };
    } catch (e) { var d = new Date(); return { day: d.getDay(), h: d.getHours(), m: d.getMinutes(), min: d.getHours() * 60 + d.getMinutes() }; }
  }
  function status() {
    var n = rome(), t = HOURS[n.day];
    for (var i = 0; i < t.length; i++) {
      if (n.min >= t[i][0] && n.min < t[i][1]) return { open: true, text: "Aperto ora, fino alle " + fmt(t[i][1]), big: "Aperto ora", day: n.day };
      if (n.min < t[i][0]) return { open: false, text: "Chiuso, riapre alle " + fmt(t[i][0]), big: "Riapre alle " + fmt(t[i][0]), day: n.day };
    }
    for (var k = 1; k <= 7; k++) {
      var d = (n.day + k) % 7;
      if (HOURS[d].length) {
        var when = k === 1 ? "domani" : DAYS[d];
        return { open: false, text: "Chiuso, riapre " + when + " alle " + fmt(HOURS[d][0][0]), big: "Riapre " + when, day: n.day };
      }
    }
    return { open: false, text: "Chiuso", big: "Chiuso", day: n.day };
  }
  function paintStatus() {
    var s = status();
    $$("[data-status]").forEach(function (el) { el.textContent = s.text; el.setAttribute("data-open", s.open); });
    $$("[data-status-big]").forEach(function (el) { el.textContent = s.big; el.setAttribute("data-open", s.open); });
    $$(".trip-row").forEach(function (r) { r.classList.toggle("today", +r.getAttribute("data-day") === s.day); });
  }
  paintStatus();
  setInterval(paintStatus, 20000);

  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------------------------------------------------------
     Wordmark: lettere separate e misura a tutta larghezza
     --------------------------------------------------------- */
  var h1 = $("#hero-title");
  if (h1) {
    h1.setAttribute("aria-label", "Motorbike Vercelli");
    $$("[data-split]", h1).forEach(function (el) {
      var t = el.textContent; el.textContent = ""; el.setAttribute("aria-hidden", "true");
      t.split("").forEach(function (c) { var s = document.createElement("span"); s.className = "ch"; s.textContent = c; el.appendChild(s); });
    });
  }
  var WM_W = 116; // larghezza finale del carattere variabile
  function fitWordmark() {
    if (!h1) return;
    var line = $(".wm-1", h1), wrap = h1.parentElement;
    var cs = getComputedStyle(wrap);
    var avail = wrap.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    var prevW = line.style.getPropertyValue("--w");
    h1.style.fontSize = "100px"; line.style.setProperty("--w", WM_W); line.style.display = "inline-block";
    var w = line.getBoundingClientRect().width;
    line.style.display = ""; if (prevW) line.style.setProperty("--w", prevW);
    var fs = 100 * avail / w;
    var maxByH = (window.innerHeight * (window.innerWidth < 760 ? .26 : .4)) / 1.25;
    h1.style.fontSize = Math.min(fs, maxByH) + "px";
  }

  var topbar = $("#top");
  function paintHeader() {
    if (topbar) topbar.classList.toggle("scrolled", window.scrollY > 40);
    document.body.classList.toggle("has-mobile-actions", window.scrollY > Math.min(180, window.innerHeight * .25));
  }
  paintHeader();
  window.addEventListener("scroll", paintHeader, { passive: true });

  if (!hasGSAP) {
    var ig0 = $("#ignition"); if (ig0) ig0.remove();
    fitWordmark(); window.addEventListener("resize", fitWordmark);
    initBooking(); initMenu(null); initMarqueesStatic();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* ---------------------------------------------------------
     Scroll morbido (Lenis) collegato a ScrollTrigger
     --------------------------------------------------------- */
  var lenis = null;
  if (!reduced && typeof window.Lenis !== "undefined") {
    lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
  function goTo(target) {
    if (!target) return;
    var pin = ScrollTrigger.getAll().find(function (s) { return s.pin && (s.trigger === target || target.contains(s.trigger)); });
    var destination = pin ? Math.max(0, pin.start) : target;
    if (lenis) lenis.scrollTo(destination, { duration: 1.4, easing: function (t) { return 1 - Math.pow(1 - t, 4); } });
    else if (typeof destination === "number") window.scrollTo({ top: destination, behavior: reduced ? "auto" : "smooth" });
    else target.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
  }
  document.addEventListener("click", function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute("href");
    if (id === "#main" || id.length < 2) return;
    var t = document.getElementById(id.slice(1));
    if (!t) return;
    e.preventDefault();
    closeMenu && closeMenu();
    goTo(t);
    history.replaceState(null, "", id);
  });

  /* ---------------------------------------------------------
     Avviamento
     --------------------------------------------------------- */
  var CX = 200, CY = 190, R = 150;
  function ang(v) { return (200 - v * 220 / 13) * Math.PI / 180; }
  function pt(v, r) { var a = ang(v); return [CX + r * Math.cos(a), CY - r * Math.sin(a)]; }
  function buildGauge() {
    var g = $("#gauge-ticks"); if (!g) return;
    var html = "";
    for (var v = 0; v <= 13; v += 0.5) {
      var major = v % 1 === 0, a = pt(v, R), b = pt(v, major ? R - 18 : R - 10);
      html += '<line class="tick' + (major ? " major" : "") + '" x1="' + a[0].toFixed(1) + '" y1="' + a[1].toFixed(1) + '" x2="' + b[0].toFixed(1) + '" y2="' + b[1].toFixed(1) + '"/>';
      if (major) { var c = pt(v, R - 36); html += '<text class="num" x="' + c[0].toFixed(1) + '" y="' + (c[1] + 5).toFixed(1) + '" text-anchor="middle">' + v + "</text>"; }
    }
    g.innerHTML = html;
    var s = pt(11, R + 8), e = pt(13, R + 8);
    $("#gauge-red").setAttribute("d", "M" + s[0] + " " + s[1] + " A" + (R + 8) + " " + (R + 8) + " 0 0 1 " + e[0] + " " + e[1]);
  }
  var needle = $("#gauge-needle"), leds = $$(".leds i");
  function drawNeedle(v) {
    var p = pt(v, 128); needle.setAttribute("x2", p[0]); needle.setAttribute("y2", p[1]);
    leds.forEach(function (l, i) { l.classList.toggle("on", v >= 4 + i * 1.3); });
  }

  var ign = $("#ignition");
  var seen = false;
  try { seen = sessionStorage.getItem("mv-avviamento") === "1"; } catch (e) {}

  function heroIn() {
    var chars = $$(".wm-1 .ch, .wm-2 .ch", h1);
    var line1 = $(".wm-1", h1);
    if (reduced) { line1.style.setProperty("--w", WM_W); return; }
    gsap.timeline()
      .fromTo(chars, { yPercent: 105, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1, ease: "expo.out", stagger: 0.035 }, 0)
      .fromTo(line1, { "--w": 50 }, { "--w": WM_W, duration: 1.6, ease: "expo.out" }, 0.1)
      .fromTo(".hero-tag", { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: .6, ease: "power3.out" }, .2)
      ;
  }

  function endIntro() {
    try { sessionStorage.setItem("mv-avviamento", "1"); } catch (e) {}
    if (ign && ign.parentNode) ign.remove();
    if (lenis) lenis.start();
    heroIn();
    ScrollTrigger.refresh();
  }

  buildGauge();
  fitWordmark();
  if (reduced || seen || !ign) {
    if (ign) ign.remove();
    $(".wm-1", h1).style.setProperty("--w", WM_W);
    if (!reduced) { gsap.set(".wm-1 .ch, .wm-2 .ch, .hero-tag", { opacity: 0 }); requestAnimationFrame(heroIn); }
  } else {
    if (lenis) lenis.stop();
    gsap.set(".wm-1 .ch, .wm-2 .ch, .hero-tag", { opacity: 0 });
    var needleV = { v: 0 };
    var intro = gsap.timeline({ delay: .12 })
      .to(needleV, { v: 13, duration: .4, ease: "power2.in", onUpdate: function () { drawNeedle(needleV.v); } })
      .fromTo("#ignition-brand", { "--w": 50, opacity: .2 }, { "--w": 125, opacity: 1, duration: .5, ease: "expo.out" }, 0)
      .to(needleV, { v: 0, duration: .4, ease: "power3.out", onUpdate: function () { drawNeedle(needleV.v); } }, ">")
      .to(ign, { clipPath: "inset(0 0 100% 0)", duration: .45, ease: "expo.inOut", onComplete: endIntro }, "-=.1");
    $("#ignition-skip").addEventListener("click", function () { intro.progress(1); });
  }

  /* ---------------------------------------------------------
     N — il faro segue il puntatore (o fa una spazzata da solo)
     --------------------------------------------------------- */
  var hero = $("#avvio"), beam = $("#beam"), glow = $("#beam-glow");
  var bx = .64, by = .4, tx = bx, ty = by, lastMove = -1e9, heroOn = true, clock0 = performance.now();
  hero.addEventListener("pointermove", function (e) {
    if (e.pointerType !== "mouse") return;
    var r = hero.getBoundingClientRect();
    tx = (e.clientX - r.left) / r.width; ty = (e.clientY - r.top) / r.height; lastMove = performance.now();
  });
  ScrollTrigger.create({ trigger: hero, start: "top top", end: "bottom top", onToggle: function (s) { heroOn = s.isActive; } });
  if (!reduced) {
    gsap.ticker.add(function () {
      if (!heroOn) return;
      var now = performance.now();
      if (now - lastMove > 3500) { var t = (now - clock0) / 1000; tx = .52 + .3 * Math.sin(t * .42); ty = .42 + .1 * Math.sin(t * .83); }
      bx += (tx - bx) * .07; by += (ty - by) * .07;
      var mx = (bx * 100).toFixed(2) + "%", my = (by * 100).toFixed(2) + "%";
      beam.style.setProperty("--mx", mx); beam.style.setProperty("--my", my);
      glow.style.setProperty("--mx", mx); glow.style.setProperty("--my", my);
    });
    // Uscendo dalla hero il marchio si comprime come in accelerazione
    gsap.to(".wm-1", { "--w": 52, yPercent: -18, ease: "none", immediateRender: false,
      scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } });
  }

  // Navigation tracks section positions, including the original pinned scenes.
  var sections = $$("main > section[id]");
  var sectionLinks = $$('.header-nav a[href^="#"], #menu nav a[href^="#"]');
  var current = -1;
  function setCurrentSection(i) {
    if (i === current) return;
    current = i;
    var id = "#" + sections[i].id;
    sectionLinks.forEach(function (a) {
      if (a.getAttribute("href") === id) a.setAttribute("aria-current", "location");
      else a.removeAttribute("aria-current");
    });
  }
  function sectionNavigation() {
    var stops = [];
    function paintSection() {
      var position = window.scrollY + window.innerHeight * .4, active = 0;
      stops.forEach(function (top, i) { if (position >= top) active = i; });
      setCurrentSection(active);
    }
    function measure() {
      stops = sections.map(function (sec) {
        var pin = ScrollTrigger.getAll().find(function (s) { return s.pin && (s.trigger === sec || sec.contains(s.trigger)); });
        return pin ? pin.start : sec.getBoundingClientRect().top + window.scrollY;
      });
      paintSection();
    }
    ScrollTrigger.addEventListener("refresh", measure);
    ScrollTrigger.create({ start: 0, end: "max", onUpdate: paintSection });
    measure();
  }

  // A little scroll response is retained for the existing brand ribbons.
  var lastY = window.scrollY, lastT = performance.now(), velSigned = 0;
  gsap.ticker.add(function () {
    if (document.hidden || reduced) return;
    var now = performance.now(), y = window.scrollY, dt = Math.max(1, now - lastT);
    var v = (y - lastY) / dt * 1000; lastY = y; lastT = now;
    velSigned += (v - velSigned) * .12;
  });

  /* ---------------------------------------------------------
     1 — 450 caschi che si compongono nel numero
     --------------------------------------------------------- */
  (function helmets() {
    var stage = $("#helmets-stage"), canvas = $("#helmets-canvas");
    if (!stage || !canvas) return;
    var ctx = canvas.getContext("2d"), N = 450, parts = [], W = 0, H = 0, dpr = 1, rad = 6, shelves = [];
    var target = reduced ? 1 : 0, prog = target, visible = false, px = -1e4, py = -1e4;
    var PALETTE = [["#f3f2ee", .19], ["#151a28", .25], ["#e3262b", .16], ["#8a93a6", .1], ["#d8f03a", .07], ["#2f6fe0", .09], ["#e94fb4", .05], ["#ff8a1e", .09]];
    function pick(r) { var a = 0; for (var i = 0; i < PALETTE.length; i++) { a += PALETTE[i][1]; if (r <= a) return PALETTE[i][0]; } return PALETTE[0][0]; }
    function rnd(seed) { var x = Math.sin(seed * 9301 + 49297) * 233280; return x - Math.floor(x); }

    function sampleText(rx, ry, rw, rh) {
      var oc = document.createElement("canvas"); oc.width = Math.ceil(rw); oc.height = Math.ceil(rh);
      var o = oc.getContext("2d"), fs = rh;
      o.font = "800 " + fs + "px Anybody, Arial Narrow, sans-serif";
      var m = o.measureText("450");
      fs = Math.min(fs * 1.12, fs * (rw / m.width));
      o.font = "800 " + fs + "px Anybody, Arial Narrow, sans-serif";
      o.textAlign = "center"; o.textBaseline = "middle"; o.fillStyle = "#fff";
      o.fillText("450", rw / 2, rh / 2 + fs * .04);
      var data = o.getImageData(0, 0, oc.width, oc.height).data;
      function grid(step) {
        var pts = [];
        for (var y = step / 2; y < oc.height; y += step) for (var x = step / 2; x < oc.width; x += step) {
          if (data[((y | 0) * oc.width + (x | 0)) * 4 + 3] > 140) pts.push([rx + x, ry + y]);
        }
        return pts;
      }
      var lo = 2, hi = 80, best = grid(lo);
      for (var it = 0; it < 18; it++) { var mid = (lo + hi) / 2, p = grid(mid); if (p.length >= N) { best = p; lo = mid; } else hi = mid; }
      rad = Math.max(2.6, lo * .42);
      var out = [], stride = best.length / N;
      for (var i = 0; i < N; i++) out.push(best[Math.floor(i * stride)]);
      return out;
    }

    function layout() {
      W = stage.clientWidth; H = stage.clientHeight; dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = W * dpr; canvas.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var mobile = W < 760;
      var rx = mobile ? W * .05 : W * .4, ry = mobile ? H * .12 : H * .14, rw = mobile ? W * .9 : W * .56, rh = mobile ? H * .4 : H * .64;
      var targets = sampleText(rx, ry, rw, rh);
      // Parete di scaffali: 30 x 15 nella stessa area
      var cols = mobile ? 18 : 30, rows = Math.ceil(N / cols), cw = rw / cols, ch = rh / rows, starts = [];
      shelves = [];
      for (var r = 0; r < rows; r++) { shelves.push(ry + (r + 1) * ch - ch * .12); for (var c = 0; c < cols && starts.length < N; c++) starts.push([rx + (c + .5) * cw, ry + (r + .5) * ch]); }
      var startR = Math.min(cw, ch) * .36;
      var si = starts.map(function (p, i) { return i; }).sort(function (a, b) { return starts[a][0] - starts[b][0]; });
      var ti = targets.map(function (p, i) { return i; }).sort(function (a, b) { return targets[a][0] - targets[b][0]; });
      parts = [];
      for (var i = 0; i < N; i++) {
        var s = starts[si[i]], t = targets[ti[i]], q = rnd(i + 1);
        parts.push({ sx: s[0], sy: s[1], tx: t[0], ty: t[1], r0: startR, color: pick(rnd(i * 7 + 3)),
          delay: (t[0] - rx) / rw * .32 + q * .08, lift: 30 + q * 90, swirl: (rnd(i * 3) - .5) * 120, ph: q * 6.28, ox: 0, oy: 0 });
      }
      draw(performance.now());
    }

    function ease(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
    function helmet(x, y, r, col) {
      var dark = col === "#151a28";
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.fill();
      if (dark) { ctx.strokeStyle = "rgba(154,165,189,.55)"; ctx.lineWidth = 1.2; ctx.stroke(); }
      ctx.fillStyle = dark ? "rgba(150,170,205,.55)" : "rgba(13,19,34,.78)";
      ctx.beginPath(); ctx.ellipse(x + r * .2, y - r * .02, r * .62, r * .34, 0, 0, 6.2832); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,.45)"; ctx.beginPath(); ctx.arc(x - r * .38, y - r * .42, r * .16, 0, 6.2832); ctx.fill();
    }
    function draw(now) {
      ctx.clearRect(0, 0, W, H);
      var shelfA = Math.max(0, 1 - prog * 3);
      if (shelfA > 0) {
        ctx.strokeStyle = "rgba(154,165,189," + (.28 * shelfA) + ")"; ctx.lineWidth = 2;
        var x0 = parts.length ? Math.min.apply(null, parts.map(function (p) { return p.sx; })) - rad * 2 : 0;
        var x1 = parts.length ? Math.max.apply(null, parts.map(function (p) { return p.sx; })) + rad * 2 : 0;
        shelves.forEach(function (y) { ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke(); });
      }
      var settled = prog > .97;
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        var t = Math.min(1, Math.max(0, (prog * 1.45 - p.delay) / 1));
        var e = ease(t), arc = Math.sin(e * Math.PI);
        var x = p.sx + (p.tx - p.sx) * e + arc * p.swirl;
        var y = p.sy + (p.ty - p.sy) * e - arc * p.lift;
        var r = p.r0 + (rad - p.r0) * e;
        // il puntatore sposta i caschi già in posizione
        var fx = 0, fy = 0;
        if (settled) {
          var dx = x - px, dy = y - py, d2 = dx * dx + dy * dy;
          if (d2 < 9000) { var d = Math.sqrt(d2) || 1, f = (95 - d) / 95 * 22; fx = dx / d * f; fy = dy / d * f; }
          y += Math.sin(now / 900 + p.ph) * .8;
        }
        p.ox += (fx - p.ox) * .15; p.oy += (fy - p.oy) * .15;
        helmet(x + p.ox, y + p.oy, r, p.color);
      }
    }

    var lines = $$(".steps-txt p", stage), step = 0;
    function setStep(i) {
      if (i === step || reduced) return;
      gsap.to(lines[step], { opacity: 0, y: -14, duration: .35, ease: "power2.in" });
      gsap.fromTo(lines[i], { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: .5, ease: "power3.out", delay: .1 });
      step = i;
    }

    canvas.addEventListener("pointermove", function (e) { var b = canvas.getBoundingClientRect(); px = e.clientX - b.left; py = e.clientY - b.top; });
    canvas.addEventListener("pointerleave", function () { px = py = -1e4; });

    if (!reduced) {
      ScrollTrigger.create({
        trigger: stage, start: "top top", end: "+=120%", pin: true, anticipatePin: 1,
        onUpdate: function (s) { target = s.progress; setStep(s.progress < .3 ? 0 : s.progress < .7 ? 1 : 2); }
      });
      ScrollTrigger.create({ trigger: "#caschi", start: "top bottom", end: "bottom top", onToggle: function (s) { visible = s.isActive; } });
      gsap.ticker.add(function () {
        if (!visible || document.hidden) return;
        prog += (target - prog) * .09;
        draw(performance.now());
      });
    }
    var rt; window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(layout, 150); });
    if (document.fonts && document.fonts.load) document.fonts.load('800 100px "Anybody"').then(layout, layout); else layout();
  })();

  /* ---------------------------------------------------------
     2 — Corsie: scroll orizzontale su desktop, swipe su telefono
     --------------------------------------------------------- */
  (function aisle() {
    var sec = $("#corsie"), track = $("#aisle-track"), vp = $("#aisle-viewport"), bays = $$(".bay", track);
    var label = $("#aisle-n"), bar = $("#aisle-bar"), n = bays.length;
    function setP(p) {
      var i = Math.min(n, Math.max(1, Math.round(p * (n - 1)) + 1));
      label.textContent = "Corsia " + i + "/" + n; bar.style.transform = "scaleX(" + (i / n) + ")";
    }
    vp.addEventListener("scroll", function () { if (!sec.classList.contains("pinned")) setP(vp.scrollLeft / Math.max(1, vp.scrollWidth - vp.clientWidth)); }, { passive: true });
    if (reduced) return;
    var mm = gsap.matchMedia();
    mm.add("(min-width: 900px)", function () {
      sec.classList.add("pinned");
      var dist = function () { return track.scrollWidth - window.innerWidth; };
      var tween = gsap.to(track, {
        x: function () { return -dist(); }, ease: "none",
        scrollTrigger: { trigger: sec, start: "top top", end: function () { return "+=" + dist(); }, pin: true, scrub: .8, invalidateOnRefresh: true, onUpdate: function (s) { setP(s.progress); } }
      });
      bays.forEach(function (b) {
        gsap.fromTo($(".bay-img img", b), { xPercent: -7 }, { xPercent: 7, ease: "none", scrollTrigger: { trigger: b, containerAnimation: tween, start: "left right", end: "right left", scrub: true } });
        gsap.fromTo($(".bay-num", b), { "--w": 45 }, { "--w": 62, ease: "none", scrollTrigger: { trigger: b, containerAnimation: tween, start: "left right", end: "center center", scrub: true } });
      });
      return function () { sec.classList.remove("pinned"); };
    });
  })();

  /* ---------------------------------------------------------
     3 — Nastri dei marchi che accelerano con lo scroll
     --------------------------------------------------------- */
  function initMarqueesStatic() { $$(".marquee").forEach(function (m) { m.style.flexWrap = "wrap"; m.style.justifyContent = "center"; $(".marquee-track", m).style.flexWrap = "wrap"; $(".marquee-track", m).style.justifyContent = "center"; }); }
  if (reduced) initMarqueesStatic();
  else {
    $$(".marquee").forEach(function (m) {
      var tr = $(".marquee-track", m), clone = tr.cloneNode(true);
      clone.setAttribute("aria-hidden", "true"); $$("img", clone).forEach(function (im) { im.alt = ""; });
      m.appendChild(clone);
      var clone2 = tr.cloneNode(true); clone2.setAttribute("aria-hidden", "true"); $$("img", clone2).forEach(function (im) { im.alt = ""; }); m.appendChild(clone2);
      var dir = +m.getAttribute("data-dir"), x = 0, on = false;
      ScrollTrigger.create({ trigger: m, start: "top bottom", end: "bottom top", onToggle: function (s) { on = s.isActive; } });
      gsap.ticker.add(function (t, dt) {
        if (!on || document.hidden) return;
        var wdt = tr.offsetWidth; if (!wdt) return;
        var speed = 28 + Math.min(220, Math.abs(velSigned) * .32);
        var sign = velSigned < -5 ? -1 : 1;
        x += sign * speed * dt / 1000;
        var m = ((x % wdt) + wdt) % wdt;
        var tx = dir > 0 ? -m : m - wdt;
        gsap.set([tr, clone, clone2], { x: tx });
      });
    });
  }

  /* ---------------------------------------------------------
     4 — La serranda dell'officina si alza
     --------------------------------------------------------- */
  if (!reduced) {
    gsap.timeline({ scrollTrigger: { trigger: "#shop-stage", start: "top top", end: "+=85%", pin: true, scrub: .6, anticipatePin: 1 } })
      .to("#shutter", { yPercent: -102, ease: "power2.in", duration: 1 }, .05)
      .fromTo(".shop-photo img", { scale: 1.2, filter: "brightness(.4)" }, { scale: 1, filter: "brightness(1)", ease: "none", duration: 1.2 }, 0)
      .fromTo("#officina-title", { "--w": 45, yPercent: 30, opacity: 0 }, { "--w": 70, yPercent: 0, opacity: 1, ease: "power3.out", duration: .5 }, .65)
      .fromTo(".shop-title p", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: .3 }, .9);
  }
  $$(".checks li").forEach(function (li, i) {
    if (reduced) { li.classList.add("done"); return; }
    ScrollTrigger.create({ trigger: li, start: "top 85%", once: true, onEnter: function () { setTimeout(function () { li.classList.add("done"); }, i * 140); } });
  });

  /* ---------------------------------------------------------
     Titoli che "allungano" il passo entrando in scena
     --------------------------------------------------------- */
  if (!reduced) {
    $$("h2.display").forEach(function (h) {
      if (h.id === "officina-title") return;
      var w = parseFloat(getComputedStyle(h).getPropertyValue("--w")) || 72;
      gsap.fromTo(h, { "--w": 42, y: 50, opacity: 0 }, { "--w": w, y: 0, opacity: 1, duration: 1.3, ease: "expo.out", scrollTrigger: { trigger: h, start: "top 88%", once: true } });
    });
    gsap.fromTo(".logo-tile", { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: .9, ease: "power3.out", stagger: .04, scrollTrigger: { trigger: "#moto .marquee", start: "top 85%", once: true } });
    gsap.from(".stars span", { width: 0, duration: 1.4, ease: "power2.out", scrollTrigger: { trigger: ".rating", start: "top 85%", once: true } });
  }

  /* ---------------------------------------------------------
     5 — Recensione parola per parola
     --------------------------------------------------------- */
  var bq = $("#big-quote");
  if (bq && !reduced) {
    var txt = bq.textContent; bq.textContent = "";
    var readable = document.createElement("span"); readable.className = "sr"; readable.textContent = txt; bq.appendChild(readable);
    txt.split(" ").forEach(function (w, i) {
      var s = document.createElement("span"); s.className = "w"; s.setAttribute("aria-hidden", "true"); s.textContent = w;
      bq.appendChild(s); if (i < txt.split(" ").length - 1) bq.appendChild(document.createTextNode(" "));
    });
    gsap.fromTo($$(".w", bq), { opacity: .12 }, { opacity: 1, stagger: .1, ease: "none", scrollTrigger: { trigger: bq, start: "top 78%", end: "bottom 45%", scrub: true } });
  }

  /* ---------------------------------------------------------
     Menu, prenotazione, rifiniture
     --------------------------------------------------------- */
  var closeMenu = initMenu(lenis);
  initBooking();
  sectionNavigation();

  window.addEventListener("resize", function () { fitWordmark(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { fitWordmark(); ScrollTrigger.refresh(); });
  window.addEventListener("load", function () { ScrollTrigger.refresh(); });

  function initMenu(lenisRef) {
    var menu = $("#menu"), openB = $("#menu-open"), closeB = $("#menu-close");
    if (!menu) return function () {};
    function open() { menu.inert = false; menu.classList.add("open"); document.body.classList.add("menu-open"); $("#main").inert = true; $(".foot").inert = true; openB.setAttribute("aria-expanded", "true"); if (lenisRef) lenisRef.stop(); setTimeout(function () { closeB.focus(); }, 50); }
    function close() {
      if (!menu.classList.contains("open")) return;
      menu.inert = true; menu.classList.remove("open"); document.body.classList.remove("menu-open"); $("#main").inert = false; $(".foot").inert = false; openB.setAttribute("aria-expanded", "false"); if (lenisRef) lenisRef.start(); openB.focus({ preventScroll: true });
    }
    openB.addEventListener("click", open); closeB.addEventListener("click", close);
    menu.addEventListener("click", function (e) { if (e.target.closest("a")) close(); });
    document.addEventListener("keydown", function (e) {
      if (!menu.classList.contains("open")) return;
      if (e.key === "Escape") close();
      if (e.key === "Tab") { // focus intrappolato nel menu
        var f = $$("a, button", menu), first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    return close;
  }

  function initBooking() {
    var form = $("#booking"); if (!form) return;
    var sets = $$("fieldset", form), bars = $$(".booking-steps i", form), i = 0;
    var back = $("#b-back"), next = $("#b-next"), send = $("#b-send"), msg = $("#booking-msg");
    var d = form.querySelector('input[type="date"]'); if (d) d.min = new Date().toISOString().slice(0, 10);
    function show(k) {
      sets.forEach(function (f, j) { f.classList.toggle("active", j === k); });
      bars.forEach(function (b, j) { b.classList.toggle("on", j <= k); });
      back.hidden = k === 0; next.hidden = k === sets.length - 1; send.hidden = k !== sets.length - 1;
      i = k;
      var first = sets[k].querySelector("input:not([type=radio]), input:checked");
      if (first) first.focus({ preventScroll: true });
      if (!reduced && typeof gsap !== "undefined") gsap.fromTo(sets[k], { x: 24, opacity: 0 }, { x: 0, opacity: 1, duration: .45, ease: "power3.out" });
    }
    function valid(k) { return $$("input[required]", sets[k]).every(function (inp) { return inp.reportValidity(); }); }
    next.addEventListener("click", function () { if (valid(i)) show(i + 1); });
    back.addEventListener("click", function () { show(i - 1); });
    form.addEventListener("keydown", function (e) { if (e.key === "Enter" && e.target.tagName === "INPUT" && i < sets.length - 1) { e.preventDefault(); next.click(); } });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!valid(i)) return;
      var el = form.elements, giorno = el.data.value ? new Date(el.data.value + "T12:00").toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" }) : "giorno da concordare";
      var body = "Richiesta officina: " + el.tipo.value + "\nMoto: " + el.moto.value + "\nGiorno preferito (da concordare): " + giorno + "\nNome: " + el.nome.value + "\nTelefono: " + el.tel.value + "\nNote: " + el.note.value;
      msg.innerHTML = "<strong>Bozza pronta, " + escapeHtml(el.nome.value.trim().split(" ")[0]) + "</strong><p>Apri il tuo programma di posta e invia la richiesta. L’appuntamento si concorda con l’officina.</p><a class=\"btn btn-red\" href=\"mailto:motorbikevercelli@gmail.com?subject=" + encodeURIComponent("Richiesta officina — " + el.tipo.value) + "&amp;body=" + encodeURIComponent(body) + "\">Apri la bozza email</a><br><small class=\"mute\">Nessun dato è stato inviato dal sito.</small>";
      msg.hidden = false;
      form.reset(); show(0); msg.focus();
    });
  }
  function escapeHtml(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
})();
