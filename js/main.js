/* ============================================================
   NoVA Listing Media — interaction layer
   Lenis smooth scroll + GSAP scroll-reveal choreography
   ============================================================ */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var year = document.getElementById("yr");
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- mobile nav ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var links = document.getElementById("navLinks");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", open);
    });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        links.classList.remove("open");
        toggle.classList.remove("open");
      });
    });
  }

  /* ---------- contact form → compose email (no backend) ---------- */
  var cform = document.getElementById("contactForm");
  if (cform) {
    /* package field: prefilled from "Book …" buttons, clearable, datalist dropdown */
    var pkgInput = document.getElementById("cfPackage");
    var pkgClear = document.getElementById("cfPackageClear");
    var syncClear = function () { pkgClear.hidden = !pkgInput.value; };
    pkgInput.addEventListener("input", syncClear);
    pkgClear.addEventListener("click", function () {
      pkgInput.value = "";
      syncClear();
      pkgInput.focus();
    });
    document.querySelectorAll("[data-package]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        pkgInput.value = btn.getAttribute("data-package");
        syncClear();
      });
    });

    cform.addEventListener("submit", function (e) {
      e.preventDefault();
      var el = cform.elements;
      var name = (el["name"].value || "").trim();
      var email = (el["email"].value || "").trim();
      var pkg = (el["package"].value || "").trim();
      var subj = (el["subject"].value || "").trim();
      var msg = (el["message"].value || "").trim();
      var note = document.getElementById("cfNote");
      var body = "Name: " + name + "\nEmail: " + email +
        (pkg ? "\nPackage: " + pkg : "") +
        (subj ? "\nProperty address: " + subj : "") + "\n\n" + msg;
      var subjLine = "Shoot inquiry" + (pkg ? " — " + pkg : "") + (subj ? " — " + subj : "");
      var href = "mailto:info@novalistingmedia.com" +
        "?subject=" + encodeURIComponent(subjLine) +
        "&body=" + encodeURIComponent(body);
      window.location.href = href;
      if (note) note.textContent = "Opening your email app… if nothing happens, email info@novalistingmedia.com directly.";
    });
  }

  /* ---------- ensure muted bg videos actually autoplay ---------- */
  document.querySelectorAll("video[autoplay]").forEach(function (v) {
    v.muted = true;
    var p = v.play();
    if (p && p.catch) p.catch(function () {});
  });

  /* ---------- reduced motion: reveal everything, skip the rest ---------- */
  if (reduce || typeof gsap === "undefined") {
    document.querySelectorAll("[data-animation]").forEach(function (el) {
      el.style.opacity = 1;
      el.style.transform = "none";
    });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* ---------- Lenis smooth scroll ---------- */
  var lenis = null;
  if (typeof Lenis !== "undefined") {
    lenis = new Lenis({
      duration: 1.15,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smoothWheel: true
    });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);

    // in-page anchor links go through Lenis
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      var id = a.getAttribute("href");
      if (id.length > 1) {
        a.addEventListener("click", function (e) {
          var target = document.querySelector(id);
          if (target) { e.preventDefault(); lenis.scrollTo(target, { offset: -90 }); }
        });
      }
    });
  }

  /* ---------- scroll-reveal choreography ----------
     data-animation: fade-up | slide-left | slide-right | scale-up | clip-reveal
     children that get staggered: .eyebrow,h1,h2,h3,p,.btn,.hero-cta,li,.step,.value,.tile,.pkg,.quote,.circle-arr
  */
  var fromState = {
    "fade-up":     { y: 56, opacity: 0 },
    "slide-left":  { x: -90, opacity: 0 },
    "slide-right": { x: 90, opacity: 0 },
    "scale-up":    { scale: 0.88, opacity: 0, transformOrigin: "50% 60%" },
    "clip-reveal": { clipPath: "inset(100% 0 0 0)", opacity: 0 }
  };

  var childSel = ".eyebrow, h1, h2, h3, h4, p, .btn, .hero-cta, .circle-arr, li, .step, .value, .tile, .pkg, .quote, .stat, .area-line, .tag, .phone";

  document.querySelectorAll("[data-animation]").forEach(function (section) {
    var type = section.getAttribute("data-animation");
    var conf = fromState[type] || fromState["fade-up"];
    var kids = section.querySelectorAll(childSel);
    var targets = kids.length ? kids : [section];

    gsap.set(targets, conf);

    ScrollTrigger.create({
      trigger: section,
      start: "top 82%",
      once: true,
      onEnter: function () {
        gsap.to(targets, {
          x: 0, y: 0, scale: 1, opacity: 1,
          clipPath: type === "clip-reveal" ? "inset(0% 0 0 0)" : undefined,
          duration: type === "clip-reveal" ? 1.1 : 0.85,
          ease: type === "scale-up" ? "power2.out" : (type === "clip-reveal" ? "power4.inOut" : "power3.out"),
          stagger: 0.09,
          overwrite: true
        });
      }
    });
  });

  /* ---------- hero load orchestration ---------- */
  var hero = document.querySelector(".hero");
  if (hero) {
    var hk = hero.querySelectorAll(".eyebrow, h1, .hero-sub, .hero-cta");
    gsap.set(hk, { y: 40, opacity: 0 });
    window.addEventListener("load", function () {
      gsap.to(hk, { y: 0, opacity: 1, duration: 1, ease: "power3.out", stagger: 0.12, delay: 0.15 });
    });
  }

  /* ---------- arc-reveal: media parallax + reversible panel slide ---------- */
  var isDesktop = window.matchMedia("(min-width: 881px)").matches;
  document.querySelectorAll(".arc").forEach(function (arc) {
    var media = arc.querySelector(".arc-media video, .arc-media img");
    if (media) {
      gsap.fromTo(media, { scale: 1.18 }, {
        scale: 1, ease: "none",
        scrollTrigger: { trigger: arc, start: "top bottom", end: "bottom top", scrub: true }
      });
    }
    var panel = arc.querySelector(".arc-panel");
    if (!panel) return;

    if (isDesktop) {
      // White content panel sweeps IN from the side to reveal the video as the
      // section enters, then sweeps back OUT to hide it as the section leaves —
      // fully scroll-linked, so it replays in reverse when scrolling back up.
      var coverX = arc.classList.contains("arc-right") ? "-58vw" : "58vw";
      gsap.set(panel, { x: coverX });
      var tl = gsap.timeline({
        scrollTrigger: { trigger: arc, start: "top bottom", end: "bottom top", scrub: true }
      });
      tl.to(panel, { x: "0vw", ease: "power1.out", duration: 1 })   // reveal (enter)
        .to(panel, { x: coverX, ease: "power1.in", duration: 1 });  // hide (leave)
    } else {
      gsap.from(panel, {
        y: 40, opacity: 0, duration: .9, ease: "power3.out",
        scrollTrigger: { trigger: arc, start: "top 75%", once: true }
      });
    }
  });

  /* ---------- converging heading lines (reversible) ----------
     [data-converge="left"|"right"] slide in from opposite sides toward
     their resting position as the section scrolls in, and back out on the way up. */
  document.querySelectorAll("[data-converge]").forEach(function (el) {
    var from = el.getAttribute("data-converge") === "right" ? "55vw" : "-55vw";
    var host = el.closest("[data-converge-group]") || el.parentElement;
    gsap.fromTo(el, { x: from, opacity: 0 }, {
      x: "0vw", opacity: 1, ease: "none",
      scrollTrigger: { trigger: host, start: "top 92%", end: "top 42%", scrub: true }
    });
  });

  /* ---------- camera scroll-scrub backgrounds (why, about) ---------- */
  function initScrub(holder) {
    var canvas = holder.querySelector("canvas");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var COUNT = parseInt(holder.dataset.frames, 10) || 121;
    var base = holder.dataset.base;
    var trigger = holder.parentElement;   // the .has-scrub section/wrapper
    var pad = 3;
    var imgs = new Array(COUNT);
    var current = -1;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);

    function src(i) {
      var n = String(i + 1);
      while (n.length < pad) n = "0" + n;
      return base + n + ".webp";
    }
    function size() {
      var r = holder.getBoundingClientRect();
      canvas.width = r.width * dpr;
      canvas.height = r.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(current < 0 ? 0 : current, true);
    }
    function draw(i, force) {
      if (i === current && !force) return;
      var img = imgs[i];
      if (!img || !img.complete) return;
      current = i;
      var cw = canvas.width / dpr, ch = canvas.height / dpr;
      var scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      var dw = img.naturalWidth * scale, dh = img.naturalHeight * scale;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, cw, ch);
      ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
    }
    function load(i) {
      var im = new Image();
      im.onload = function () { if (i === 0) size(); };
      im.src = src(i);
      imgs[i] = im;
    }
    load(0);
    for (var k = 1; k < COUNT; k++) load(k);
    window.addEventListener("resize", size);

    ScrollTrigger.create({
      trigger: trigger, start: "top bottom", end: "bottom top", scrub: true,
      onUpdate: function (self) {
        var idx = Math.min(COUNT - 1, Math.max(0, Math.floor(self.progress * (COUNT - 1))));
        requestAnimationFrame(function () { draw(idx); });
      }
    });
  }
  document.querySelectorAll(".scrub-bg").forEach(initScrub);

  /* ---------- pause offscreen videos (perf) ---------- */
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
        else v.pause();
      });
    }, { threshold: 0.1 });
    document.querySelectorAll("video[loop]").forEach(function (v) { io.observe(v); });
  }

  /* ---------- scroll-spy: highlight active nav link (gold) ---------- */
  (function () {
    var links = document.querySelectorAll('.nav-links a[href^="#"]:not(.btn)');
    var map = {};
    links.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
    function setActive(link) {
      links.forEach(function (x) { x.classList.remove("active"); });
      if (link) link.classList.add("active");
    }
    Object.keys(map).forEach(function (id) {
      var sec = document.getElementById(id);
      if (!sec) return;
      ScrollTrigger.create({
        trigger: sec, start: "top center", end: "bottom center",
        onToggle: function (self) { if (self.isActive) setActive(map[id]); }
      });
    });
  })();

  // recalc once everything (incl. fonts/videos) settles
  window.addEventListener("load", function () { ScrollTrigger.refresh(); });
})();
