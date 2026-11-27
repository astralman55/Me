// Homepage blocks: dropped one at a time and settled with real 2D physics (Matter.js).
// A block that hangs too far off its support tips over, just like it would in real life.
(function () {
  var box = document.querySelector(".tiles");
  if (!box || !window.Matter) return;
  var M = window.Matter;
  var tiles = Array.prototype.slice.call(box.querySelectorAll(".tile"));
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var STEP = 1000 / 60, EVERY = 22; // a new block every 22 steps (~0.37s)
  var run = 0;

  function pct(el, name) { return parseFloat(el.style.getPropertyValue(name)) / 100; }

  function build() {
    var id = ++run;
    var W = box.clientWidth, H = box.clientHeight;
    if (!W || !H) return;
    box.classList.add("physics");

    var engine = M.Engine.create({ enableSleeping: true, positionIterations: 10, velocityIterations: 8 });
    engine.gravity.y = 1;
    var t = 40;
    M.Composite.add(engine.world, [
      M.Bodies.rectangle(W / 2, H + t / 2, W * 3, t, { isStatic: true, friction: 1 }),          // ground
      M.Bodies.rectangle(-W * 0.12 - t / 2, H / 2 - H, t, H * 4, { isStatic: true }),           // left stop
      M.Bodies.rectangle(W * 1.12 + t / 2, H / 2 - H, t, H * 4, { isStatic: true })             // right stop
    ]);

    var specs = tiles.map(function (el) {
      var w = pct(el, "--w") * W, h = pct(el, "--h") * H;
      var x = (pct(el, "--l") + pct(el, "--w") / 2) * W;
      var rot = (parseFloat(el.style.getPropertyValue("--r")) || 0) * Math.PI / 180;
      el.style.width = w + "px"; el.style.height = h + "px";
      el.style.visibility = "hidden";
      return { el: el, w: w, h: h, x: x, rot: rot, body: null };
    });

    var step = 0, spawned = 0;
    function spawn(s) {
      s.body = M.Bodies.rectangle(s.x, -s.h - H * 0.35, s.w, s.h, {
        angle: s.rot, friction: 0.8, frictionStatic: 1, restitution: 0.02, density: 0.002,
        chamfer: { radius: 1.5 }, sleepThreshold: 40
      });
      M.Composite.add(engine.world, s.body);
      s.el.style.visibility = "visible";
    }
    function tick() {
      if (spawned < specs.length && step >= spawned * EVERY) spawn(specs[spawned++]);
      M.Engine.update(engine, STEP);
      step++;
    }
    function draw() {
      specs.forEach(function (s) {
        if (!s.body) return;
        var p = s.body.position;
        s.el.style.transform = "translate(" + (p.x - s.w / 2) + "px," + (p.y - s.h / 2) + "px) rotate(" + s.body.angle + "rad)";
      });
    }
    function settled() {
      return spawned === specs.length && specs.every(function (s) { return s.body.isSleeping; });
    }

    if (reduce) { // no animation: work out the final pile, then show it
      for (var i = 0; i < 1500 && !settled(); i++) tick();
      draw();
      return;
    }
    var last = null, acc = 0;
    function frame(now) {
      if (id !== run) return; // a resize started a new pile
      if (last === null) last = now;
      acc += Math.min(now - last, 100); last = now;
      while (acc >= STEP) { tick(); acc -= STEP; }
      draw();
      if (!settled() && step < 1500) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  build();
  var lastW = box.clientWidth, timer;
  window.addEventListener("resize", function () {
    clearTimeout(timer);
    timer = setTimeout(function () {
      if (Math.abs(box.clientWidth - lastW) < 40) return;
      lastW = box.clientWidth; reduce = true; build();
    }, 250);
  });
})();
