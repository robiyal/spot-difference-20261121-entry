// main.js — boot the game: wire the canvas, the loop and the input, then
// apply a staged ?shot= setup when one is given (deterministic screenshots).

(function spotBoot() {
  const canvas = document.getElementById('spot-canvas');
  const g = canvas.getContext('2d');
  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');

  if (shot) spotApplyShot(shot);

  function toCanvas(e) {
    const r = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width) * canvas.width,
      y: ((e.clientY - r.top) / r.height) * canvas.height,
    };
  }

  canvas.addEventListener('pointerdown', (e) => {
    const p = toCanvas(e);
    spotClick(p.x, p.y);
  });
  // the hint button lives in the page chrome under the canvas
  const hintBtn = document.getElementById('spot-hint-btn');
  if (hintBtn) hintBtn.addEventListener('click', () => spotUseHint());
  window.addEventListener('keydown', (e) => {
    if (e.key === ' ') e.preventDefault();
    spotKey(e.key);
  });

  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    spotUpdate(dt);
    spotRender(g);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // exposed for play-testing: state, scenes and helpers on one handle
  window.__spot = {
    game: spotGame,
    scenes: SPOT_SCENES,
    click: spotClick,
    hint: spotUseHint,
    key: spotKey,
  };
})();
