/* EPIC HOME theme script — WHAT'S PLAYING NOW colours that never repeat.
   The frame and the words each drift on their own: every few seconds (a random 1.2–4.5 s)
   each one picks a new random speed and direction, sometimes nearly stopping,
   and eases into it. Nothing is on a loop, so no pattern to learn. */
(function(){
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.documentElement.classList.add('wp-js');
  var CYCLE = 120;                          // em, one full colour cycle
  function rnd(a,b){ return a + Math.random()*(b-a); }
  function layer(){
    return { x: rnd(0,CYCLE), v: 0, target: 0, next: 0 };
  }
  function pick(L, now){
    var r = Math.random();
    if (r < 0.15)      L.target = rnd(-0.6, 0.6);                     // almost still, just breathing
    else if (r < 0.75) L.target = (Math.random()<.5?-1:1) * rnd(1.5, 5); // easy drift
    else               L.target = (Math.random()<.5?-1:1) * rnd(5, 11); // a quick rush
    L.next = now + rnd(1200, 4500);
  }
  var rim = layer(), txt = layer(), els = [], last = 0, lastQuery = 0;
  function query(){ els = document.querySelectorAll('.hm-wpn, .hm-rb'); }
  function frame(now){
    if (!last) last = now;
    var dt = Math.min(0.1, (now - last) / 1000); last = now;
    if (now - lastQuery > 700){ query(); lastQuery = now; }
    [rim, txt].forEach(function(L){
      if (now >= L.next) pick(L, now);
      L.v += (L.target - L.v) * Math.min(1, dt * 1.6);   // ease into the new speed
      L.x = ((L.x + L.v * dt) % CYCLE + CYCLE) % CYCLE;
    });
    for (var i = 0; i < els.length; i++){
      var e = els[i];
      if (e.classList.contains('hm-wpn')) e.style.setProperty('--wpx', (-rim.x).toFixed(2) + 'em');
      else                                 e.style.setProperty('--wpx', (-txt.x).toFixed(2) + 'em');
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
