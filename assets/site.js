(function () {
  var y = document.querySelector(".js-year");
  if (y) y.textContent = new Date().getFullYear();

  // ---- menu ----
  var burger = document.querySelector(".burger");
  var menu = document.getElementById("menu");
  function setMenu(open) {
    if (!menu) return;
    menu.hidden = !open;
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.classList.toggle("menu-open", open);
  }
  if (burger) burger.addEventListener("click", function () { setMenu(menu.hidden); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
  if (menu) menu.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });

  // ---- home deck: one panel per swipe, ticks on the right ----
  var deck = document.querySelector(".deck");
  if (deck) {
    var panels = Array.prototype.slice.call(deck.querySelectorAll(".panel"));
    var ticks = document.querySelector(".ticks");
    var buttons = panels.map(function (p, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", p.getAttribute("aria-label") || "Panel " + (i + 1));
      b.addEventListener("click", function () { p.scrollIntoView({ behavior: "smooth" }); });
      ticks.appendChild(b);
      return b;
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var i = panels.indexOf(en.target);
        buttons.forEach(function (b, j) { b.setAttribute("aria-current", j === i ? "true" : "false"); });
        var id = en.target.id;
        try { history.replaceState(null, "", id && id !== "top" ? "#" + id : location.pathname); } catch (e) {}
      });
    }, { root: deck, threshold: 0.6 });
    panels.forEach(function (p) { io.observe(p); });

    // honor #section on load, and in-page tile links
    function go(hash) { var t = hash && document.getElementById(hash.slice(1)); if (t) t.scrollIntoView(); }
    go(location.hash);
    deck.addEventListener("click", function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (a) { e.preventDefault(); go(a.getAttribute("href")); }
    });
    document.addEventListener("keydown", function (e) {
      if (/INPUT|TEXTAREA/.test(document.activeElement.tagName)) return;
      var i = buttons.findIndex(function (b) { return b.getAttribute("aria-current") === "true"; });
      if (["ArrowDown", "PageDown", " "].indexOf(e.key) > -1 && panels[i + 1]) { e.preventDefault(); panels[i + 1].scrollIntoView({ behavior: "smooth" }); }
      if (["ArrowUp", "PageUp"].indexOf(e.key) > -1 && panels[i - 1]) { e.preventDefault(); panels[i - 1].scrollIntoView({ behavior: "smooth" }); }
    });
  }

  // ---- newsletter forms (work without JS too) ----
  var params = new URLSearchParams(location.search);
  document.querySelectorAll(".js-subscribe").forEach(function (form) {
    var msg = form.nextElementSibling;
    var btn = form.querySelector("button");
    if (params.has("subscribed")) msg.textContent = "Check your inbox to confirm.";
    else if (params.has("error")) msg.textContent = "Something went wrong. Try again in a minute.";
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var data = new FormData(form);
      btn.disabled = true;
      msg.textContent = "Sending...";
      fetch(form.action, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email: data.get("email"), website: data.get("website") })
      })
        .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
        .then(function (res) {
          msg.textContent = res.ok ? (res.j.message || "You're in. Check your inbox to confirm.") : (res.j.error || "Something went wrong. Try again in a minute.");
          if (res.ok) form.reset();
        })
        .catch(function () { msg.textContent = "Network error. Try again in a minute."; })
        .finally(function () { btn.disabled = false; });
    });
  });
})();
