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

  /* tour sample: Walk / Dollhouse / Floor plan buttons switch the view */
  document.querySelectorAll("[data-tour]").forEach(function (tour) {
    var views = tour.querySelectorAll(".tour-view");
    var btns = tour.querySelectorAll("[data-view-btn]");

    function setView(name) {
      views.forEach(function (v) { v.classList.toggle("is-on", v.dataset.view === name); });
      btns.forEach(function (b) {
        var on = b.dataset.viewBtn === name;
        b.classList.toggle("on", on);
        b.setAttribute("aria-pressed", on);
      });
    }

    btns.forEach(function (b) { b.addEventListener("click", function () { setView(b.dataset.viewBtn); }); });
    tour.querySelectorAll(".tour-dot").forEach(function (dot) {
      var go = function () { setView("walk"); };
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
