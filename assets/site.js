// Progressive enhancement: the form works without JS (posts to /api/subscribe).
(function () {
  var y = document.querySelector(".js-year");
  if (y) y.textContent = new Date().getFullYear();

  var params = new URLSearchParams(location.search);
  document.querySelectorAll(".js-subscribe").forEach(function (form) {
    var box = form.closest(".subscribe");
    var msg = box.querySelector(".msg");
    var btn = form.querySelector("button");

    if (params.has("subscribed")) {
      msg.textContent = "✓ Check your inbox to confirm.";
      msg.className = "msg ok";
    } else if (params.has("error")) {
      msg.textContent = "Something went wrong. Try again in a minute.";
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var data = new FormData(form);
      btn.disabled = true;
      msg.className = "msg";
      msg.textContent = "sending…";
      fetch(form.action, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email: data.get("email"), website: data.get("website") })
      })
        .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
        .then(function (res) {
          if (res.ok) {
            msg.textContent = "✓ " + (res.j.message || "You're in. Check your inbox to confirm.");
            msg.className = "msg ok";
            form.reset();
          } else {
            msg.textContent = res.j.error || "Something went wrong. Try again in a minute.";
          }
        })
        .catch(function () { msg.textContent = "Network error. Try again in a minute."; })
        .finally(function () { btn.disabled = false; });
    });
  });
})();
