/* ============================================================
   NoVA Listing Media — booking request form
   Five steps: property, package, extras, date + contact, review.
   Nothing is charged; the request is emailed to the studio.
   Prices here mirror pricing.html — change both together.
   ============================================================ */
(function () {
  "use strict";

  var form = document.getElementById("orderForm");
  if (!form) return;

  var PACKAGES = [
    { id: "essentials", name: "Essentials", price: 220, desc: "Everything a clean listing needs." },
    { id: "social",     name: "Social",     price: 350, desc: "Your listing and your personal brand, in one shoot.", tag: "Most popular" },
    { id: "showcase",   name: "Showcase",   price: 429, desc: "The full top-producer treatment." },
    { id: "none",       name: "No package", price: 0,   desc: "I'll pick individual services in the next step." }
  ];

  var GROUPS = [
    { name: "Photos", items: [
      { id: "hdr-set",        name: "HDR photo set · 5–40 images", price: 145 },
      { id: "hdr-all",        name: "HDR photos, no limit",        price: 170, from: true },
      { id: "twilight-shoot", name: "Twilight shoot",              price: 150 },
      { id: "nb-photos",      name: "Neighborhood photos",         price: 130 }
    ]},
    { name: "Video", items: [
      { id: "film",        name: "Full walkthrough film",            price: 315, from: true },
      { id: "reel",        name: "Social Reel",                      price: 170 },
      { id: "hosted-reel", name: "Hosted Reel, presenter on camera", price: 250 },
      { id: "nb-video",    name: "Neighborhood video",               price: 135 }
    ]},
    { name: "Drone", soon: true, items: [
      { id: "aerial-photos", name: "Aerial photos · 2–25",   price: 120, from: true },
      { id: "aerial-video",  name: "Aerial video",           price: 210 },
      { id: "aerial-both",   name: "Aerial photos + video",  price: 300 }
    ]},
    { name: "Tours & floor plans", items: [
      { id: "tour3d",      name: "3D walkthrough tour (Matterport)", price: 215, from: true },
      { id: "zillow-tour", name: "3D Home tour for Zillow",          price: 180, label: "$180–$310", from: true },
      { id: "fp2d",        name: "Floor plan, 2D",                   price: 150, label: "$150–$180", from: true },
      { id: "fp3d",        name: "Floor plan, 3D",                   price: 210 }
    ]},
    { name: "Photo editing", per: "photo", items: [
      { id: "stage-designer", name: "Virtual staging, by a designer", price: 20 },
      { id: "stage-ai",       name: "Virtual staging, by AI",         price: 15 },
      { id: "twilight-edit",  name: "Twilight edit",                  price: 15 },
      { id: "season",         name: "Season swap edit",               price: 15 },
      { id: "removal",        name: "Item removal",                   price: 5, from: true }
    ]},
    { name: "Marketing extras", items: [
      { id: "website",   name: "Single-listing website", price: 15 },
      { id: "flyers",    name: "Flyers",                 price: 50, from: true },
      { id: "brochures", name: "Brochures, 4 pages",     price: 70, from: true }
    ]}
  ];

  var SQFT_BASE = 2500, SQFT_STEP = 1000, SQFT_FEE = 45;   // packages only
  var cfg = window.NOVA_FORMS || {};
  var money = function (n) { return "$" + n.toLocaleString("en-US"); };
  var $ = function (sel, root) { return (root || form).querySelector(sel); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };

  /* ---------- build the package and extras lists ---------- */
  var pkgBox = document.getElementById("orderPackages");
  pkgBox.innerHTML = PACKAGES.map(function (p) {
    return '<label class="opt-card" data-pkg="' + p.id + '">' +
      '<input type="radio" name="package" value="' + p.id + '">' +
      (p.tag ? '<span class="opt-tag">★ ' + p.tag + "</span>" : "") +
      '<span class="opt-name">' + p.name + "</span>" +
      '<span class="opt-price">' + (p.price ? money(p.price) : "—") + "</span>" +
      '<span class="opt-desc">' + p.desc + "</span></label>";
  }).join("");

  var extraBox = document.getElementById("orderExtras");
  extraBox.innerHTML = GROUPS.map(function (g) {
    var rows = g.items.map(function (it) {
      var price = (it.label || ((it.from ? "From " : "") + money(it.price))) + (g.per ? "/" + g.per : "");
      if (g.per) {
        return '<div class="extra-row is-qty" data-id="' + it.id + '">' +
          '<span class="extra-name">' + it.name + "</span>" +
          '<span class="extra-price">' + price + "</span>" +
          '<span class="qty"><button type="button" class="qty-btn" data-d="-1" aria-label="Fewer: ' + it.name + '">−</button>' +
          '<input type="number" class="qty-in" name="qty-' + it.id + '" value="0" min="0" max="99" inputmode="numeric" aria-label="Number of photos: ' + it.name + '">' +
          '<button type="button" class="qty-btn" data-d="1" aria-label="More: ' + it.name + '">+</button></span></div>';
      }
      return '<label class="extra-row' + (g.soon ? " is-off" : "") + '" data-id="' + it.id + '">' +
        '<input type="checkbox" name="extra" value="' + it.id + '"' + (g.soon ? " disabled" : "") + ">" +
        '<span class="extra-name">' + it.name + "</span>" +
        '<span class="extra-price">' + price + "</span></label>";
    }).join("");
    return '<div class="extra-group' + (g.soon ? " is-soon" : "") + '"><div class="extra-head"><span>' + g.name.replace("&", "&amp;") + "</span>" +
      (g.soon ? '<em>Coming soon</em>' : (g.per ? "<em>Choose how many photos</em>" : "")) + "</div>" + rows + "</div>";
  }).join("");

  var ITEMS = {};
  GROUPS.forEach(function (g) { g.items.forEach(function (it) { ITEMS[it.id] = { item: it, group: g }; }); });

  /* ---------- arriving from a Book button ---------- */
  var params = new URLSearchParams(window.location.search);
  var wantPkg = params.get("package");
  if (wantPkg) { var r = $('input[name="package"][value="' + wantPkg + '"]'); if (r) r.checked = true; }
  var wantAdd = params.get("add");
  if (wantAdd && ITEMS[wantAdd] && !ITEMS[wantAdd].group.soon) {
    if (ITEMS[wantAdd].group.per) { $('input[name="qty-' + wantAdd + '"]').value = 1; }
    else { $('input[name="extra"][value="' + wantAdd + '"]').checked = true; }
  }
  var wantAsk = params.get("ask");
  if (wantAsk) $("#oNotes").value = "I'd like to ask about: " + wantAsk;

  /* earliest date that can be requested is tomorrow */
  var dateIn = $("#oDate");
  var tomorrow = new Date(Date.now() + 864e5);
  dateIn.min = tomorrow.getFullYear() + "-" + ("0" + (tomorrow.getMonth() + 1)).slice(-2) + "-" + ("0" + tomorrow.getDate()).slice(-2);

  /* ---------- read the current order ---------- */
  function read() {
    var pkgId = (form.elements["package"].value || "");
    var pkg = PACKAGES.filter(function (p) { return p.id === pkgId; })[0] || null;
    var lines = [], total = 0, from = false;
    if (pkg && pkg.price) { lines.push({ name: pkg.name + " package", amount: pkg.price }); total += pkg.price; }
    var sqft = parseInt($("#oSqft").value, 10) || 0;
    if (pkg && pkg.price && sqft > SQFT_BASE) {
      var fee = Math.ceil((sqft - SQFT_BASE) / SQFT_STEP) * SQFT_FEE;
      lines.push({ name: "Home over " + SQFT_BASE.toLocaleString("en-US") + " sq ft", amount: fee }); total += fee;
    }
    form.querySelectorAll('input[name="extra"]:checked').forEach(function (c) {
      var it = ITEMS[c.value].item;
      lines.push({ name: it.name, amount: it.price, from: !!it.from }); total += it.price; if (it.from) from = true;
    });
    form.querySelectorAll(".qty-in").forEach(function (q) {
      var n = Math.max(0, Math.min(99, parseInt(q.value, 10) || 0));
      if (!n) return;
      var it = ITEMS[q.name.slice(4)].item;
      lines.push({ name: it.name + " × " + n, amount: it.price * n, from: !!it.from }); total += it.price * n; if (it.from) from = true;
    });
    return { pkg: pkg, lines: lines, total: total, from: from, sqft: sqft };
  }

  /* ---------- summary panel + review ---------- */
  var sumList = document.getElementById("sumList");
  var sumTotal = document.getElementById("sumTotal");
  function renderSummary() {
    var o = read();
    form.querySelectorAll(".opt-card").forEach(function (c) { c.classList.toggle("is-on", !!o.pkg && c.dataset.pkg === o.pkg.id); });
    form.querySelectorAll(".extra-row").forEach(function (rw) {
      var cb = rw.querySelector('input[type="checkbox"]'), q = rw.querySelector(".qty-in");
      rw.classList.toggle("is-on", cb ? cb.checked : (parseInt(q.value, 10) || 0) > 0);
    });
    sumList.innerHTML = o.lines.length
      ? o.lines.map(function (l) { return "<li><span>" + esc(l.name) + "</span><b>" + (l.from ? "<small>from</small> " : "") + money(l.amount) + "</b></li>"; }).join("")
      : '<li class="sum-empty">Your choices will appear here.</li>';
    sumTotal.innerHTML = (o.from ? "<small>from</small> " : "") + money(o.total);
    return o;
  }
  function val(id) { return ($("#" + id).value || "").trim(); }
  function niceDate(v) {
    if (!v) return "";
    var p = v.split("-"), d = new Date(+p[0], +p[1] - 1, +p[2]);
    return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  }
  function renderReview() {
    var o = read();
    var rows = [
      ["Property", val("oAddress") + (o.sqft ? " · about " + o.sqft.toLocaleString("en-US") + " sq ft" : "") + (val("oStatus") ? " · " + val("oStatus") : "")],
      ["Order", o.lines.map(function (l) { return l.name; }).join(", ")],
      ["Estimated total", (o.from ? "from " : "") + money(o.total)],
      ["Preferred time", niceDate(val("oDate")) + (val("oTime") ? " · " + val("oTime") : "")],
      ["Access", val("oAccess")],
      ["Contact", [val("oName"), val("oEmail"), val("oPhone"), val("oBrokerage")].filter(Boolean).join(" · ")],
      ["Notes", val("oNotes")]
    ];
    document.getElementById("orderReview").innerHTML = rows.filter(function (r) { return r[1]; })
      .map(function (r) { return "<div><dt>" + r[0] + "</dt><dd>" + esc(r[1]) + "</dd></div>"; }).join("");
  }

  /* ---------- steps ---------- */
  var steps = form.querySelectorAll(".order-step");
  var dots = document.querySelectorAll(".order-dots li");
  var backBtn = document.getElementById("orderBack");
  var nextBtn = document.getElementById("orderNext");
  var sendBtn = document.getElementById("orderSend");
  var errBox = document.getElementById("orderError");
  var current = 0;

  function fail(msg, field) {
    errBox.textContent = msg;
    if (field) { field.setAttribute("aria-invalid", "true"); field.focus(); }
    return false;
  }
  function check(i) {
    errBox.textContent = "";
    form.querySelectorAll('[aria-invalid="true"]').forEach(function (f) { f.removeAttribute("aria-invalid"); });
    var o = read();
    if (i === 0) {
      if (!val("oAddress")) return fail("Please enter the property address.", $("#oAddress"));
      if (!(o.sqft > 0)) return fail("Please enter the approximate square footage.", $("#oSqft"));
    }
    if (i === 1 && !o.pkg) return fail("Please choose a package, or pick “No package” to choose individual services.");
    if (i === 2 && o.pkg && o.pkg.id === "none" && !o.lines.length) return fail("Please choose at least one service.");
    if (i === 3) {
      if (!val("oDate")) return fail("Please choose a preferred date.", dateIn);
      if (val("oDate") < dateIn.min) return fail("Please choose a date from tomorrow onwards.", dateIn);
      if (!val("oName")) return fail("Please enter your name.", $("#oName"));
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val("oEmail"))) return fail("Please enter a valid email address.", $("#oEmail"));
      if (val("oPhone").replace(/\D/g, "").length < 10) return fail("Please enter a phone number we can reach you on.", $("#oPhone"));
    }
    return true;
  }
  function show(i, scroll) {
    current = i;
    steps.forEach(function (s, n) { s.classList.toggle("is-on", n === i); });
    dots.forEach(function (d, n) {
      d.classList.toggle("is-on", n === i);
      d.classList.toggle("is-done", n < i);
      if (n === i) d.setAttribute("aria-current", "step"); else d.removeAttribute("aria-current");
    });
    backBtn.hidden = i === 0;
    nextBtn.hidden = i === steps.length - 1;
    sendBtn.hidden = i !== steps.length - 1;
    errBox.textContent = "";
    if (i === steps.length - 1) renderReview();
    if (scroll) {
      var top = form.getBoundingClientRect().top + window.pageYOffset - 110;
      window.scrollTo({ top: top, behavior: "smooth" });
    }
  }
  nextBtn.addEventListener("click", function () { if (check(current)) show(current + 1, true); });
  backBtn.addEventListener("click", function () { show(current - 1, true); });
  dots.forEach(function (d, n) {
    d.querySelector("button").addEventListener("click", function () {
      if (n < current) return show(n, true);
      for (var k = current; k < n; k++) { if (!check(k)) return show(k, true), check(k); }
      show(n, true);
    });
  });

  form.addEventListener("click", function (e) {
    var b = e.target.closest(".qty-btn");
    if (!b) return;
    var input = b.parentNode.querySelector(".qty-in");
    input.value = Math.max(0, Math.min(99, (parseInt(input.value, 10) || 0) + (+b.dataset.d)));
    renderSummary();
  });
  form.addEventListener("input", renderSummary);
  form.addEventListener("change", renderSummary);
  /* Enter moves to the next step instead of sending a half-finished request */
  form.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && e.target.tagName === "INPUT" && current < steps.length - 1) { e.preventDefault(); nextBtn.click(); }
  });

  /* ---------- send ---------- */
  function payload() {
    var o = read();
    var order = o.lines.map(function (l) { return "- " + l.name + ": " + (l.from ? "from " : "") + money(l.amount); }).join("\n");
    return {
      subject: "New booking request — " + (o.pkg && o.pkg.price ? o.pkg.name : "Custom order") + " — " + val("oAddress"),
      from_name: "NoVA Listing Media website",
      "Name": val("oName"),
      email: val("oEmail"),
      "Phone": val("oPhone"),
      "Brokerage": val("oBrokerage") || "—",
      "Property address": val("oAddress"),
      "Square footage": o.sqft.toLocaleString("en-US"),
      "Home status": val("oStatus") || "—",
      "Package": o.pkg ? o.pkg.name : "—",
      "Order": order,
      "Estimated total": (o.from ? "from " : "") + money(o.total) + " (pay on delivery)",
      "Preferred date": niceDate(val("oDate")),
      "Preferred time": val("oTime"),
      "Access": val("oAccess") || "—",
      "Notes": val("oNotes") || "—"
    };
  }
  function done() {
    document.getElementById("orderWrap").hidden = true;
    var ok = document.getElementById("orderDone");
    ok.hidden = false;
    document.getElementById("orderDoneEmail").textContent = val("oEmail");
    window.scrollTo({ top: ok.getBoundingClientRect().top + window.pageYOffset - 140, behavior: "smooth" });
  }
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    for (var k = 0; k < steps.length - 1; k++) { if (!check(k)) { show(k, true); check(k); return; } }
    if ($("#oBot").checked) return;            // spam trap
    var data = payload();

    if (!cfg.accessKey) {
      /* not connected yet: hand the request to the visitor's email app */
      var body = Object.keys(data).filter(function (k) { return k !== "subject" && k !== "from_name"; })
        .map(function (k) { return (k === "email" ? "Email" : k) + ": " + data[k]; }).join("\n");
      window.location.href = "mailto:" + (cfg.inbox || "info@novalistingmedia.com") +
        "?subject=" + encodeURIComponent(data.subject) + "&body=" + encodeURIComponent(body);
      errBox.textContent = "Opening your email app to send this request. If nothing happens, email " + (cfg.inbox || "info@novalistingmedia.com") + " directly.";
      return;
    }

    sendBtn.disabled = true;
    sendBtn.firstChild.textContent = "Sending… ";
    cfg.send(data).then(done).catch(function () {
      sendBtn.disabled = false;
      sendBtn.firstChild.textContent = "Request booking ";
      errBox.textContent = "Sorry, that didn't send. Please try again, or email " + (cfg.inbox || "info@novalistingmedia.com") + ".";
    });
  });

  renderSummary();
  show(0, false);
})();
