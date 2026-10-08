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
})();
