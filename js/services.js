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
