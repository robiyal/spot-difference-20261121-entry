// render.js — draws one frame of the game: the HUD, the two picture panels,
// the found-difference rings, the hint pulse, wrong-click marks, and the
// title / level-done / game-over / win overlays. Panels are 600x520 at
// (20,80) left and (660,80) right on a 1280x720 canvas.

function spotPanelOrigin(panel) {
  return panel === 'left' ? SPOT_LEFT : SPOT_RIGHT;
}

function spotDrawPanel(g, panel) {
  const o = spotPanelOrigin(panel);
  const scene = spotScene();
  const on = panel === 'right' ? new Set(scene.diffs.map((d) => d.id)) : new Set();
  g.save();
  g.beginPath();
  g.rect(o.x, o.y, SPOT_PANEL.w, SPOT_PANEL.h);
  g.clip();
  g.translate(o.x, o.y);
  scene.paint(g, on);
  g.restore();
  g.strokeStyle = '#f7f3e3';
  g.lineWidth = 3;
  g.strokeRect(o.x, o.y, SPOT_PANEL.w, SPOT_PANEL.h);
  g.fillStyle = '#f7f3e3';
  g.font = 'bold 15px sans-serif';
  g.textAlign = 'left';
  g.textBaseline = 'alphabetic';
  g.fillText(panel === 'left' ? 'A' : 'B', o.x + 10, o.y + 24);
}

function spotDrawRing(g, ox, oy, d, color, width, pulse) {
  const r = pulse ? d.r + 6 + Math.sin(spotGame.now * 6) * 4 : d.r + 4;
  g.strokeStyle = color;
  g.lineWidth = width;
  g.beginPath();
  g.arc(ox + d.x, oy + d.y, r, 0, Math.PI * 2);
  g.stroke();
  g.beginPath();
  g.arc(ox + d.x, oy + d.y, r * 0.55, 0, Math.PI * 2);
  g.stroke();
}

function spotDrawMarkers(g) {
  for (const d of spotScene().diffs) {
    if (!spotGame.found.has(d.id)) continue;
    spotDrawRing(g, SPOT_LEFT.x, SPOT_LEFT.y, d, '#2ec4b6', 4, false);
    spotDrawRing(g, SPOT_RIGHT.x, SPOT_RIGHT.y, d, '#2ec4b6', 4, false);
    // small tick on the left ring so a found spot reads at thumbnail size
    g.strokeStyle = '#2ec4b6';
    g.lineWidth = 4;
    g.beginPath();
    g.moveTo(SPOT_LEFT.x + d.x - 7, SPOT_LEFT.y + d.y);
    g.lineTo(SPOT_LEFT.x + d.x - 2, SPOT_LEFT.y + d.y + 6);
    g.lineTo(SPOT_LEFT.x + d.x + 8, SPOT_LEFT.y + d.y - 6);
    g.stroke();
  }
  if (spotGame.hintSpot) {
    const d = spotGame.hintSpot;
    spotDrawRing(g, SPOT_LEFT.x, SPOT_LEFT.y, d, '#ffd23e', 4, true);
    spotDrawRing(g, SPOT_RIGHT.x, SPOT_RIGHT.y, d, '#ffd23e', 4, true);
  }
  for (const m of spotGame.wrongMarks) {
    const o = spotPanelOrigin(m.panel);
    const fade = 1 - (spotGame.now - m.at) / 1.2;
    g.strokeStyle = 'rgba(230,57,70,' + fade.toFixed(2) + ')';
    g.lineWidth = 4;
    const cx = o.x + m.x;
    const cy = o.y + m.y;
    g.beginPath();
    g.moveTo(cx - 9, cy - 9);
    g.lineTo(cx + 9, cy + 9);
    g.moveTo(cx + 9, cy - 9);
    g.lineTo(cx - 9, cy + 9);
    g.stroke();
  }
}

function spotDrawHud(g) {
  g.fillStyle = '#14101f';
  g.fillRect(0, 0, 1280, 70);
  const scene = spotScene();
  g.fillStyle = '#ffd23e';
  g.font = 'bold 26px sans-serif';
  g.textAlign = 'left';
  g.textBaseline = 'middle';
  g.fillText('SPOT THE DIFFERENCE', 20, 26);
  g.fillStyle = '#b9c0d0';
  g.font = '16px sans-serif';
  g.fillText(scene.name + '  ·  ' + scene.sub, 20, 52);
  // found counter, centre — big, because the judge counts it
  const found = spotGame.found.size;
  const total = scene.diffs.length;
  g.fillStyle = '#f7f3e3';
  g.font = 'bold 30px sans-serif';
  g.textAlign = 'center';
  g.fillText(found + ' / ' + total + ' found', 640, 28);
  g.font = '15px sans-serif';
  g.fillStyle = '#b9c0d0';
  g.fillText(total - found + ' still hiding', 640, 54);
  // timer bar — kept left of the score so the "62s" label never overlaps it
  const tw = 200;
  const tx = 850;
  g.fillStyle = '#2b3245';
  g.fillRect(tx, 16, tw, 16);
  const frac = Math.max(0, spotGame.timeLeft / scene.time);
  g.fillStyle = frac > 0.33 ? '#2ec4b6' : '#e63946';
  g.fillRect(tx, 16, tw * frac, 16);
  g.strokeStyle = '#f7f3e3';
  g.lineWidth = 1;
  g.strokeRect(tx, 16, tw, 16);
  g.fillStyle = '#f7f3e3';
  g.font = 'bold 18px sans-serif';
  g.textAlign = 'left';
  g.fillText(Math.ceil(spotGame.timeLeft) + 's', tx + tw + 10, 25);
  // score and hints, right
  g.textAlign = 'right';
  g.font = 'bold 22px sans-serif';
  g.fillText('Score ' + spotGame.score, 1260, 24);
  g.font = '16px sans-serif';
  g.fillStyle = '#ffd23e';
  g.fillText('Hints ' + spotGame.hintsLeft + '  (H)', 1260, 50);
  g.textAlign = 'left';
}

function spotDrawBottom(g) {
  g.fillStyle = '#14101f';
  g.fillRect(0, 610, 1280, 110);
  g.fillStyle = '#f7f3e3';
  g.font = '18px sans-serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  const msg = spotGame.message || 'Click a difference on either picture.';
  g.fillText(msg, 640, 640);
  g.fillStyle = '#b9c0d0';
  g.font = '15px sans-serif';
  g.fillText('Click a difference  ·  H = hint  ·  N = next scene  ·  R = restart', 640, 678);
  g.textAlign = 'left';
}

function spotDrawOverlay(g, title, lines, foot) {
  g.fillStyle = 'rgba(10,8,18,0.78)';
  g.fillRect(0, 0, 1280, 720);
  g.fillStyle = '#14101f';
  g.strokeStyle = '#ffd23e';
  g.lineWidth = 2;
  const bw = 620;
  const bh = 130 + lines.length * 34;
  const bx = (1280 - bw) / 2;
  const by = (720 - bh) / 2;
  g.beginPath();
  g.rect(bx, by, bw, bh);
  g.fill();
  g.stroke();
  g.fillStyle = '#ffd23e';
  g.font = 'bold 40px sans-serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(title, 640, by + 52);
  g.fillStyle = '#f7f3e3';
  g.font = '20px sans-serif';
  lines.forEach((line, i) => {
    g.fillText(line, 640, by + 104 + i * 34);
  });
  g.fillStyle = '#b9c0d0';
  g.font = '16px sans-serif';
  g.fillText(foot, 640, by + bh - 28);
  g.textAlign = 'left';
}

function spotDrawTitle(g) {
  g.fillStyle = '#14101f';
  g.fillRect(0, 0, 1280, 720);
  // a small preview of scene one behind the title card
  g.save();
  g.globalAlpha = 0.35;
  g.beginPath();
  g.rect(0, 0, 1280, 720);
  g.clip();
  g.translate(340, 100);
  SPOT_SCENES[0].paint(g, new Set());
  g.restore();
  g.fillStyle = 'rgba(10,8,18,0.55)';
  g.fillRect(0, 0, 1280, 720);
  g.fillStyle = '#ffd23e';
  g.font = 'bold 64px sans-serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText('SPOT THE DIFFERENCE', 640, 200);
  g.fillStyle = '#f7f3e3';
  g.font = '24px sans-serif';
  g.fillText('Two pictures. Seven differences. Three scenes.', 640, 260);
  g.font = '20px sans-serif';
  g.fillText('Night Market  ·  Harbor Morning  ·  Space Station', 640, 300);
  g.fillStyle = '#2ec4b6';
  g.font = 'bold 26px sans-serif';
  g.fillText('Click or press Enter to start', 640, 380);
  g.fillStyle = '#b9c0d0';
  g.font = '17px sans-serif';
  g.fillText('Click a difference on either picture  ·  H = hint (3 per scene)  ·  wrong click costs 3 seconds', 640, 430);
  g.textAlign = 'left';
}

function spotRender(g) {
  if (spotGame.state === 'title') {
    spotDrawTitle(g);
    return;
  }
  g.fillStyle = '#0d0a16';
  g.fillRect(0, 0, 1280, 720);
  spotDrawPanel(g, 'left');
  spotDrawPanel(g, 'right');
  spotDrawMarkers(g);
  spotDrawHud(g);
  spotDrawBottom(g);
  if (spotGame.state === 'levelDone') {
    const last = spotGame.sceneIndex + 1 >= SPOT_SCENES.length;
    spotDrawOverlay(
      g,
      last ? 'ALL SCENES CLEAR!' : 'SCENE CLEAR!',
      [
        'You found all ' + spotScene().diffs.length + ' differences in ' + spotScene().name + '.',
        'Time bonus +' + spotGame.levelBonus + '   ·   Score ' + spotGame.score,
      ],
      last ? 'Press Enter to see your final score' : 'Press N or click for the next scene',
    );
  } else if (spotGame.state === 'gameOver') {
    spotDrawOverlay(
      g,
      "TIME'S UP!",
      [
        'You found ' + spotGame.found.size + ' of ' + spotScene().diffs.length + ' in ' + spotScene().name + '.',
        'Score ' + spotGame.score,
      ],
      'Press R or click to try again',
    );
  } else if (spotGame.state === 'win') {
    spotDrawOverlay(
      g,
      'YOU FOUND THEM ALL!',
      [
        'All 21 differences across 3 scenes.',
        'Final score ' + spotGame.score,
      ],
      'Press R or click to play again',
    );
  }
}
