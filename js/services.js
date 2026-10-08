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

  /* tour sample: switch views, and "walk" between rooms from the floor hotspots */
  document.querySelectorAll("[data-tour]").forEach(function (tour) {
    var views = tour.querySelectorAll(".tour-view");
    var btns = tour.querySelectorAll("[data-view-btn]");
    var imgs = tour.querySelectorAll(".tour-img");
    var spots = tour.querySelectorAll(".hotspot");
    var label = tour.querySelector(".tour-room");
    var names = { kitchen: "Kitchen", living: "Living room" };
    var busy = false;

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
    function walk(spot) {
      if (busy) return;
      busy = true;
      var from = tour.querySelector(".tour-img.is-on");
      from.style.transformOrigin = spot.style.left + " " + spot.style.top;
      from.classList.add("is-step");
      spots.forEach(function (s) { s.hidden = true; });
      setTimeout(function () {
        setRoom(spot.dataset.go);
        setTimeout(function () { from.classList.remove("is-step"); busy = false; }, 750);
      }, 520);
    }

    btns.forEach(function (b) { b.addEventListener("click", function () { setView(b.dataset.viewBtn); }); });
    spots.forEach(function (s) { s.addEventListener("click", function () { walk(s); }); });
    tour.querySelectorAll(".tour-dot").forEach(function (dot) {
      var go = function () { setRoom(dot.dataset.go); setView("walk"); };
      dot.addEventListener("click", go);
      dot.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); }
      });
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
