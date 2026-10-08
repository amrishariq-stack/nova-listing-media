/* ============================================================
   NoVA Listing Media — services page
   Before / after comparison sliders
   ============================================================ */
(function () {
  "use strict";
  document.querySelectorAll(".ba").forEach(function (ba) {
    var range = ba.querySelector(".ba-range");
    if (!range) return;
    var sync = function () { ba.style.setProperty("--pos", range.value + "%"); };
    range.addEventListener("input", sync);
    sync();
  });

  /* tour sample: Walk / Dollhouse / Floor plan buttons switch the view;
     the gold dots on the floor plan open that room in Walk */
  document.querySelectorAll("[data-tour]").forEach(function (tour) {
    var views = tour.querySelectorAll(".tour-view");
    var btns = tour.querySelectorAll("[data-view-btn]");
    var imgs = tour.querySelectorAll(".tour-img");
    var spots = tour.querySelectorAll(".hotspot");
    var label = tour.querySelector(".tour-room");
    var names = { kitchen: "Kitchen", living: "Living room" };

    function setView(name) {
      views.forEach(function (v) { v.classList.toggle("is-on", v.dataset.view === name); });
      btns.forEach(function (b) {
        var on = b.dataset.viewBtn === name;
        b.classList.toggle("on", on);
        b.setAttribute("aria-pressed", on);
      });
    }
    function setRoom(room) {
      imgs.forEach(function (i) { i.classList.toggle("is-on", i.dataset.room === room); });
      spots.forEach(function (s) { s.hidden = s.dataset.room !== room; });
      if (label) label.textContent = names[room] || "";
    }

    btns.forEach(function (b) { b.addEventListener("click", function () { setView(b.dataset.viewBtn); }); });
    tour.querySelectorAll(".tour-dot").forEach(function (dot) {
      var go = function () { setRoom(dot.dataset.go); setView("walk"); };
      dot.addEventListener("click", go);
      dot.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); }
      });
    });
  });

  /* showcase sample: photo carousel, media tabs, and floor-plan dots linked to photos */
  document.querySelectorAll("[data-show]").forEach(function (show) {
    var views = show.querySelectorAll(".show-view");
    var tabs = show.querySelectorAll("[data-view-btn]");
    var photos = show.querySelectorAll(".show-img");
    var thumbs = show.querySelectorAll(".show-thumb");
    var count = show.querySelector('[data-view="photos"] .show-count');
    var current = 0;

    function setView(name) {
      views.forEach(function (v) { v.classList.toggle("is-on", v.dataset.view === name); });
      tabs.forEach(function (b) {
        var on = b.dataset.viewBtn === name;
        b.classList.toggle("on", on);
        b.setAttribute("aria-pressed", on);
      });
      thumbs.forEach(function (t, i) { t.classList.toggle("on", name === "photos" && i === current); });
    }
    function setPhoto(i) {
      current = (i + photos.length) % photos.length;
      photos.forEach(function (p, n) { p.classList.toggle("is-on", n === current); });
      if (count) count.innerHTML = "<b>" + photos[current].alt + "</b> · " + (current + 1) + " / " + photos.length;
      setView("photos");
    }

    tabs.forEach(function (b) { b.addEventListener("click", function () { setView(b.dataset.viewBtn); }); });
    thumbs.forEach(function (t) { t.addEventListener("click", function () { setPhoto(+t.dataset.photo); }); });
    show.querySelectorAll(".show-arrow").forEach(function (a) {
      a.addEventListener("click", function () { setPhoto(current + (+a.dataset.step)); });
    });
    show.querySelectorAll(".tour-dot").forEach(function (dot) {
      var go = function () { setPhoto(+dot.dataset.photo); };
      dot.addEventListener("click", go);
      dot.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); }
      });
    });
  });

  /* click-to-play sample videos (with sound); only one plays at a time */
  var players = document.querySelectorAll("[data-play]");
  players.forEach(function (fig) {
    var video = fig.querySelector("video");
    var btn = fig.querySelector(".vid-play");
    if (!video || !btn) return;
    btn.addEventListener("click", function () {
      players.forEach(function (other) {
        var v = other.querySelector("video");
        if (v && v !== video) v.pause();
      });
      video.controls = true;
      fig.classList.add("is-playing");
      var p = video.play();
      if (p && p.catch) p.catch(function () {});
    });
    video.addEventListener("ended", function () {
      video.controls = false;
      video.load();               // back to the poster frame
      fig.classList.remove("is-playing");
    });
  });

  /* samples marked data-live only animate while they are on screen */
  var live = document.querySelectorAll("[data-live]");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { e.target.classList.toggle("is-live", e.isIntersecting); });
    }, { threshold: 0.35 });
    live.forEach(function (el) { io.observe(el); });
  } else {
    live.forEach(function (el) { el.classList.add("is-live"); });
  }
})();
