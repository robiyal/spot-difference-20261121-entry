// scenes.js — the three original scenes and their seven differences each.
//
// Every scene is drawn procedurally on a 600x520 panel. The painter gets a
// Set of "on" difference ids: the left panel always gets an empty set (the
// base picture), the right panel gets the scene's difference ids. A
// difference is one of three kinds:
//   change — the base draws version A, the set draws version B
//   missing — the base draws the thing, the set leaves it out
//   extra — the base leaves it out, the set draws it
// Difference spots are listed in panel coordinates with a click radius.

function sceneRoundRect(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

function sceneDisc(g, x, y, r) {
  g.beginPath();
  g.arc(x, y, r, 0, Math.PI * 2);
  g.closePath();
}

function sceneStar(g, x, y, r, points) {
  g.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const rad = i % 2 === 0 ? r : r * 0.45;
    const a = (i * Math.PI) / points - Math.PI / 2;
    const px = x + Math.cos(a) * rad;
    const py = y + Math.sin(a) * rad;
    if (i === 0) g.moveTo(px, py);
    else g.lineTo(px, py);
  }
  g.closePath();
}

function sceneSky(g, top, bottom) {
  const grad = g.createLinearGradient(0, 0, 0, 520);
  grad.addColorStop(0, top);
  grad.addColorStop(1, bottom);
  g.fillStyle = grad;
  g.fillRect(0, 0, 600, 520);
}

function sceneGull(g, x, y, s) {
  g.strokeStyle = '#33414f';
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(x - 9 * s, y);
  g.quadraticCurveTo(x - 4 * s, y - 6 * s, x, y);
  g.quadraticCurveTo(x + 4 * s, y - 6 * s, x + 9 * s, y);
  g.stroke();
}

// ---------------------------------------------------------------- scene 1
function paintNightMarket(g, on) {
  sceneSky(g, '#2b1a4e', '#ff9a5c');
  // fixed stars
  g.fillStyle = '#fff8d6';
  const stars = [[40, 40], [120, 26], [210, 52], [330, 30], [430, 44], [560, 24]];
  for (const [sx, sy] of stars) {
    sceneDisc(g, sx, sy, 2);
    g.fill();
  }
  // moon, top right — difference "moon": a face appears
  g.fillStyle = '#ffeebb';
  sceneDisc(g, 520, 70, 28);
  g.fill();
  g.fillStyle = '#e8d28a';
  sceneDisc(g, 510, 62, 5);
  g.fill();
  sceneDisc(g, 530, 78, 4);
  g.fill();
  if (on.has('moon')) {
    g.fillStyle = '#7a5c28';
    sceneDisc(g, 512, 66, 3);
    g.fill();
    sceneDisc(g, 528, 66, 3);
    g.fill();
    g.strokeStyle = '#7a5c28';
    g.lineWidth = 2;
    g.beginPath();
    g.arc(520, 74, 8, 0.15 * Math.PI, 0.85 * Math.PI);
    g.stroke();
  }
  // string lights across the top — difference "lantern": centre lamp turns teal
  g.strokeStyle = '#1d1426';
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(0, 40);
  g.quadraticCurveTo(300, 90, 600, 40);
  g.stroke();
  const bulbs = [60, 150, 240, 300, 380, 470, 550];
  for (const bx of bulbs) {
    if (bx === 300) continue; // the centre lamp is the lantern difference below
    const by = 40 + Math.sin((bx / 600) * Math.PI) * 42;
    g.fillStyle = '#ffd23e';
    sceneDisc(g, bx, by + 8, 6);
    g.fill();
  }
  g.fillStyle = on.has('lantern') ? '#2ec4b6' : '#e63946';
  sceneDisc(g, 300, 96, 10);
  g.fill();
  g.strokeStyle = '#ffd23e';
  g.lineWidth = 2;
  sceneDisc(g, 300, 96, 14);
  g.stroke();
  // ground
  g.fillStyle = '#4a2c1a';
  g.fillRect(0, 400, 600, 120);
  g.fillStyle = '#5d3a22';
  g.fillRect(0, 400, 600, 8);
  // left stall — fruit, striped awning
  g.fillStyle = '#c1272d';
  g.fillRect(40, 200, 160, 26);
  g.fillStyle = '#f7f3e3';
  for (let i = 0; i < 4; i++) g.fillRect(60 + i * 40, 200, 20, 26);
  g.fillStyle = '#7a4a21';
  g.fillRect(48, 226, 144, 96);
  g.fillStyle = '#8b5a2b';
  g.fillRect(48, 322, 144, 10);
  // fruit piles
  g.fillStyle = '#ff7b00';
  for (const [fx, fy] of [[80, 310], [96, 306], [88, 296]]) {
    sceneDisc(g, fx, fy, 9);
    g.fill();
  }
  g.fillStyle = '#e63946';
  for (const [fx, fy] of [[130, 310], [146, 306]]) {
    sceneDisc(g, fx, fy, 9);
    g.fill();
  }
  g.fillStyle = '#7b2fbe';
  for (const [fx, fy] of [[170, 312], [182, 306]]) {
    sceneDisc(g, fx, fy, 7);
    g.fill();
  }
  // difference "apple": one more apple on the counter
  if (on.has('apple')) {
    g.fillStyle = '#e63946';
    sceneDisc(g, 150, 300, 9);
    g.fill();
    g.strokeStyle = '#2d6a2d';
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(150, 292);
    g.lineTo(154, 284);
    g.stroke();
  }
  // middle stall — noodle cart with pot and steam
  g.fillStyle = '#2a9d8f';
  g.fillRect(240, 210, 140, 24);
  g.fillStyle = '#f7f3e3';
  for (let i = 0; i < 4; i++) g.fillRect(252 + i * 34, 210, 17, 24);
  g.fillStyle = '#5d3a22';
  g.fillRect(248, 234, 124, 96);
  g.fillStyle = '#333333';
  sceneDisc(g, 310, 260, 30);
  g.fill();
  g.fillStyle = '#f4a261';
  sceneDisc(g, 310, 260, 22);
  g.fill();
  // steam puffs — difference "steam": the middle puff is gone
  g.fillStyle = 'rgba(255,255,255,0.85)';
  sceneDisc(g, 288, 228, 9);
  g.fill();
  if (!on.has('steam')) {
    sceneDisc(g, 310, 216, 10);
    g.fill();
  }
  sceneDisc(g, 332, 228, 9);
  g.fill();
  // cart sign — difference "sign": MIE reads MIA
  g.fillStyle = '#fff3c4';
  sceneRoundRect(g, 272, 176, 76, 26, 6);
  g.fill();
  g.fillStyle = '#1d3557';
  g.font = 'bold 18px sans-serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(on.has('sign') ? 'MIA' : 'MIE', 310, 190);
  // right stall — toys, blue awning, balloon bunch
  g.fillStyle = '#1d3557';
  g.fillRect(420, 200, 150, 26);
  g.fillStyle = '#f7f3e3';
  for (let i = 0; i < 4; i++) g.fillRect(436 + i * 36, 200, 18, 26);
  g.fillStyle = '#7a4a21';
  g.fillRect(428, 226, 134, 96);
  // balloons — difference "balloon": the middle balloon is missing
  const balloonCols = ['#e63946', '#ffd23e', '#2a9d8f'];
  const balloonX = [470, 495, 520];
  for (let i = 0; i < 3; i++) {
    if (on.has('balloon') && i === 1) continue;
    g.fillStyle = balloonCols[i];
    sceneDisc(g, balloonX[i], 150, 14);
    g.fill();
    g.strokeStyle = '#f7f3e3';
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(balloonX[i], 164);
    g.lineTo(balloonX[i] - 4, 190);
    g.stroke();
  }
  // toy shelf: a kite and a drum
  g.strokeStyle = '#e63946';
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(450, 250);
  g.lineTo(470, 280);
  g.lineTo(450, 300);
  g.lineTo(435, 272);
  g.closePath();
  g.stroke();
  g.fillStyle = '#ffd23e';
  sceneDisc(g, 530, 290, 14);
  g.fill();
  g.fillStyle = '#e63946';
  g.fillRect(516, 288, 28, 4);
  // cat on a crate — difference "cat": tail hangs down instead of up
  g.fillStyle = '#8b5a2b';
  g.fillRect(440, 420, 70, 60);
  g.strokeStyle = '#5d3a22';
  g.lineWidth = 2;
  g.strokeRect(440, 420, 70, 60);
  g.fillStyle = '#3d3d3d';
  sceneDisc(g, 472, 408, 20);
  g.fill();
  sceneDisc(g, 492, 402, 13);
  g.fill();
  g.beginPath();
  g.moveTo(484, 392);
  g.lineTo(488, 380);
  g.lineTo(494, 391);
  g.closePath();
  g.fill();
  g.beginPath();
  g.moveTo(496, 390);
  g.lineTo(502, 380);
  g.lineTo(504, 392);
  g.closePath();
  g.fill();
  g.strokeStyle = '#3d3d3d';
  g.lineWidth = 5;
  g.beginPath();
  if (on.has('cat')) {
    g.moveTo(452, 414);
    g.quadraticCurveTo(442, 430, 448, 446);
  } else {
    g.moveTo(452, 414);
    g.quadraticCurveTo(438, 400, 446, 388);
  }
  g.stroke();
  g.fillStyle = '#ffd23e';
  sceneDisc(g, 488, 400, 2);
  g.fill();
  sceneDisc(g, 496, 400, 2);
  g.fill();
}

// ---------------------------------------------------------------- scene 2
function paintHarbor(g, on) {
  sceneSky(g, '#9fd8ef', '#eafaff');
  // sun — difference "sun": rays appear
  g.fillStyle = '#ffd23e';
  sceneDisc(g, 520, 80, 26);
  g.fill();
  if (on.has('sun')) {
    g.strokeStyle = '#ffd23e';
    g.lineWidth = 4;
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      g.beginPath();
      g.moveTo(520 + Math.cos(a) * 32, 80 + Math.sin(a) * 32);
      g.lineTo(520 + Math.cos(a) * 44, 80 + Math.sin(a) * 44);
      g.stroke();
    }
  }
  // clouds
  g.fillStyle = 'rgba(255,255,255,0.9)';
  for (const [cx, cy] of [[150, 70], [330, 50], [430, 110]]) {
    sceneDisc(g, cx, cy, 18);
    g.fill();
    sceneDisc(g, cx + 20, cy + 4, 14);
    g.fill();
    sceneDisc(g, cx - 20, cy + 4, 14);
    g.fill();
  }
  // gulls — difference "gull": one gull fewer (four become three)
  sceneGull(g, 220, 120, 1);
  sceneGull(g, 280, 100, 0.9);
  sceneGull(g, 340, 130, 1);
  if (!on.has('gull')) sceneGull(g, 400, 90, 1);
  // sea
  g.fillStyle = '#1d6f9f';
  g.fillRect(0, 330, 600, 190);
  g.strokeStyle = 'rgba(255,255,255,0.5)';
  g.lineWidth = 2;
  for (const [wx, wy, wl] of [[60, 380, 70], [220, 420, 90], [380, 390, 80], [480, 460, 90], [120, 470, 70]]) {
    g.beginPath();
    g.moveTo(wx, wy);
    g.quadraticCurveTo(wx + wl / 2, wy - 8, wx + wl, wy);
    g.stroke();
  }
  // dock
  g.fillStyle = '#7a4a21';
  g.fillRect(0, 420, 260, 100);
  g.fillStyle = '#8b5a2b';
  for (let i = 0; i < 5; i++) g.fillRect(0, 436 + i * 16, 260, 3);
  // crates — difference "crate": the top crate is gone
  g.fillStyle = '#b08954';
  g.fillRect(120, 380, 44, 40);
  g.fillRect(168, 380, 44, 40);
  if (!on.has('crate')) {
    g.fillStyle = '#c49a6c';
    g.fillRect(144, 340, 44, 40);
    g.strokeStyle = '#7a4a21';
    g.lineWidth = 2;
    g.strokeRect(144, 340, 44, 40);
  }
  g.strokeStyle = '#7a4a21';
  g.lineWidth = 2;
  g.strokeRect(120, 380, 44, 40);
  g.strokeRect(168, 380, 44, 40);
  // lighthouse — difference "stripes": three red bands instead of two
  g.fillStyle = '#f7f3e3';
  g.beginPath();
  g.moveTo(70, 420);
  g.lineTo(82, 150);
  g.lineTo(118, 150);
  g.lineTo(130, 420);
  g.closePath();
  g.fill();
  g.fillStyle = '#e63946';
  g.fillRect(76, 200, 48, 22);
  g.fillRect(73, 300, 54, 22);
  if (on.has('stripes')) g.fillRect(79, 250, 42, 18);
  g.fillStyle = '#1d3557';
  g.fillRect(78, 128, 44, 24);
  g.fillStyle = '#ffd23e';
  sceneDisc(g, 100, 140, 10);
  g.fill();
  g.fillStyle = 'rgba(255,210,62,0.25)';
  g.beginPath();
  g.moveTo(100, 140);
  g.lineTo(220, 110);
  g.lineTo(220, 170);
  g.closePath();
  g.fill();
  // boat one — difference "flag": square flag instead of triangle
  g.fillStyle = '#5d3a22';
  g.beginPath();
  g.moveTo(250, 330);
  g.lineTo(340, 330);
  g.lineTo(325, 355);
  g.lineTo(265, 355);
  g.closePath();
  g.fill();
  g.fillStyle = '#f7f3e3';
  g.beginPath();
  g.moveTo(295, 330);
  g.lineTo(295, 240);
  g.lineTo(345, 310);
  g.closePath();
  g.fill();
  g.strokeStyle = '#5d3a22';
  g.lineWidth = 3;
  g.beginPath();
  g.moveTo(295, 330);
  g.lineTo(295, 235);
  g.stroke();
  g.fillStyle = '#e63946';
  if (on.has('flag')) {
    g.fillRect(295, 235, 22, 16);
  } else {
    g.beginPath();
    g.moveTo(295, 235);
    g.lineTo(317, 243);
    g.lineTo(295, 251);
    g.closePath();
    g.fill();
  }
  // boat two
  g.fillStyle = '#2a9d8f';
  g.beginPath();
  g.moveTo(420, 380);
  g.lineTo(490, 380);
  g.lineTo(478, 400);
  g.lineTo(432, 400);
  g.closePath();
  g.fill();
  g.strokeStyle = '#1d3557';
  g.lineWidth = 3;
  g.beginPath();
  g.moveTo(455, 380);
  g.lineTo(455, 320);
  g.stroke();
  g.fillStyle = '#ffd23e';
  g.beginPath();
  g.moveTo(455, 320);
  g.lineTo(455, 360);
  g.lineTo(490, 340);
  g.closePath();
  g.fill();
  // buoy — difference "buoy": yellow instead of red
  g.fillStyle = on.has('buoy') ? '#ffd23e' : '#e63946';
  sceneDisc(g, 480, 440, 14);
  g.fill();
  g.fillStyle = '#f7f3e3';
  g.fillRect(472, 436, 16, 6);
  g.strokeStyle = '#1d3557';
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(480, 426);
  g.lineTo(480, 414);
  g.stroke();
  // jumping fish — difference "fish": a fish leaps from the sea
  if (on.has('fish')) {
    g.fillStyle = '#f4a261';
    g.beginPath();
    g.ellipse(380, 428, 16, 7, -0.5, 0, Math.PI * 2);
    g.fill();
    g.beginPath();
    g.moveTo(394, 422);
    g.lineTo(404, 414);
    g.lineTo(402, 428);
    g.closePath();
    g.fill();
    g.fillStyle = 'rgba(255,255,255,0.8)';
    sceneDisc(g, 366, 444, 4);
    g.fill();
    sceneDisc(g, 396, 444, 3);
    g.fill();
  }
}

// ---------------------------------------------------------------- scene 3
function paintStation(g, on) {
  sceneSky(g, '#070b18', '#131a33');
  // fixed stars
  g.fillStyle = '#ffffff';
  const stars = [[40, 60], [90, 130], [150, 40], [210, 90], [260, 30], [340, 60], [420, 40], [470, 110], [540, 50], [570, 160], [60, 220], [180, 180]];
  for (const [sx, sy] of stars) {
    sceneDisc(g, sx, sy, 2);
    g.fill();
  }
  // bright star — difference "star": it is gone
  if (!on.has('star')) {
    g.fillStyle = '#fff8d6';
    sceneStar(g, 520, 90, 12, 4);
    g.fill();
  }
  // big round window with a planet — difference "ring": the planet wears a ring
  g.fillStyle = '#0e1626';
  sceneDisc(g, 300, 170, 118);
  g.fill();
  g.strokeStyle = '#3d5a80';
  g.lineWidth = 8;
  sceneDisc(g, 300, 170, 118);
  g.stroke();
  g.save();
  g.beginPath();
  g.arc(300, 170, 110, 0, Math.PI * 2);
  g.clip();
  g.fillStyle = '#1b2a4a';
  g.fillRect(190, 60, 220, 220);
  g.fillStyle = '#e07840';
  sceneDisc(g, 300, 160, 52);
  g.fill();
  g.fillStyle = '#c25e2e';
  g.fillRect(252, 140, 96, 8);
  g.fillRect(258, 168, 84, 6);
  if (on.has('ring')) {
    g.strokeStyle = '#ffd23e';
    g.lineWidth = 5;
    g.beginPath();
    g.ellipse(300, 160, 78, 16, -0.35, 0, Math.PI * 2);
    g.stroke();
  }
  // window crack — difference "crack": a crack spiders across the glass
  if (on.has('crack')) {
    g.strokeStyle = 'rgba(255,255,255,0.75)';
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(380, 180);
    g.lineTo(396, 168);
    g.moveTo(380, 180);
    g.lineTo(394, 192);
    g.moveTo(380, 180);
    g.lineTo(368, 196);
    g.stroke();
  }
  g.restore();
  // floor and wall panels
  g.fillStyle = '#2b3245';
  g.fillRect(0, 400, 600, 120);
  g.strokeStyle = '#1a2030';
  g.lineWidth = 2;
  for (let i = 0; i < 6; i++) {
    g.beginPath();
    g.moveTo(i * 100, 400);
    g.lineTo(i * 100, 520);
    g.stroke();
  }
  g.fillStyle = '#232a3d';
  g.fillRect(0, 300, 600, 100);
  // control console — difference "light": one lamp turns red instead of green
  g.fillStyle = '#3d5a80';
  sceneRoundRect(g, 80, 360, 120, 90, 10);
  g.fill();
  g.fillStyle = '#0e1626';
  sceneRoundRect(g, 92, 372, 96, 40, 6);
  g.fill();
  const lampCols = ['#2ec4b6', '#ffd23e', '#2ec4b6'];
  for (let i = 0; i < 3; i++) {
    g.fillStyle = on.has('light') && i === 1 ? '#e63946' : lampCols[i];
    sceneDisc(g, 108 + i * 30, 400, 7);
    g.fill();
  }
  g.fillStyle = '#2ec4b6';
  g.fillRect(100, 424, 80, 6);
  // cable loop — difference "cable": a second loop hangs beside the first
  g.strokeStyle = '#8b93a7';
  g.lineWidth = 4;
  g.beginPath();
  g.moveTo(200, 300);
  g.quadraticCurveTo(200, 380, 230, 360);
  g.quadraticCurveTo(250, 344, 240, 320);
  g.stroke();
  if (on.has('cable')) {
    g.beginPath();
    g.moveTo(260, 300);
    g.quadraticCurveTo(260, 390, 292, 366);
    g.quadraticCurveTo(310, 350, 300, 322);
    g.stroke();
  }
  // astronaut — difference "visor": the visor lifts and shows a face
  g.fillStyle = '#f7f3e3';
  sceneDisc(g, 450, 300, 26);
  g.fill();
  g.fillStyle = '#dfe6ee';
  sceneRoundRect(g, 424, 322, 52, 66, 16);
  g.fill();
  g.fillStyle = '#2a9d8f';
  g.fillRect(436, 340, 28, 10);
  g.strokeStyle = '#dfe6ee';
  g.lineWidth = 8;
  g.beginPath();
  g.moveTo(428, 340);
  g.lineTo(408, 320);
  g.stroke();
  g.beginPath();
  g.moveTo(472, 340);
  g.lineTo(492, 320);
  g.stroke();
  if (on.has('visor')) {
    g.fillStyle = '#f4a261';
    sceneDisc(g, 450, 298, 14);
    g.fill();
    g.fillStyle = '#1d3557';
    sceneDisc(g, 445, 296, 2);
    g.fill();
    sceneDisc(g, 455, 296, 2);
    g.fill();
    g.strokeStyle = '#1d3557';
    g.lineWidth = 1.5;
    g.beginPath();
    g.arc(450, 302, 5, 0.15 * Math.PI, 0.85 * Math.PI);
    g.stroke();
  } else {
    g.fillStyle = '#1b2a4a';
    sceneDisc(g, 450, 298, 15);
    g.fill();
    g.fillStyle = 'rgba(255,255,255,0.5)';
    g.fillRect(440, 288, 12, 4);
  }
  // robot arm — difference "claw": the claw opens
  g.strokeStyle = '#b9c0d0';
  g.lineWidth = 10;
  g.beginPath();
  g.moveTo(560, 250);
  g.lineTo(530, 300);
  g.lineTo(520, 350);
  g.stroke();
  g.fillStyle = '#e63946';
  sceneDisc(g, 560, 250, 10);
  g.fill();
  sceneDisc(g, 530, 300, 8);
  g.fill();
  g.strokeStyle = '#e63946';
  g.lineWidth = 5;
  if (on.has('claw')) {
    g.beginPath();
    g.moveTo(520, 350);
    g.lineTo(500, 372);
    g.moveTo(520, 350);
    g.lineTo(540, 372);
    g.stroke();
  } else {
    g.beginPath();
    g.moveTo(520, 350);
    g.lineTo(512, 372);
    g.moveTo(520, 350);
    g.lineTo(528, 372);
    g.stroke();
  }
}

// ------------------------------------------------------------- scene table
const SPOT_SCENES = [
  {
    name: 'Night Market',
    sub: 'Pasar Malam',
    time: 90,
    paint: paintNightMarket,
    diffs: [
      { id: 'moon', x: 520, y: 70, r: 26 },
      { id: 'lantern', x: 300, y: 96, r: 18 },
      { id: 'balloon', x: 495, y: 150, r: 22 },
      { id: 'cat', x: 466, y: 410, r: 24 },
      { id: 'sign', x: 310, y: 190, r: 26 },
      { id: 'apple', x: 150, y: 300, r: 16 },
      { id: 'steam', x: 310, y: 216, r: 20 },
    ],
  },
  {
    name: 'Harbor Morning',
    sub: 'Pelabuhan Pagi',
    time: 75,
    paint: paintHarbor,
    diffs: [
      { id: 'stripes', x: 95, y: 250, r: 26 },
      { id: 'gull', x: 400, y: 90, r: 20 },
      { id: 'buoy', x: 480, y: 440, r: 20 },
      { id: 'flag', x: 305, y: 243, r: 18 },
      { id: 'crate', x: 166, y: 360, r: 24 },
      { id: 'sun', x: 520, y: 80, r: 26 },
      { id: 'fish', x: 380, y: 428, r: 20 },
    ],
  },
  {
    name: 'Space Station',
    sub: 'Stasiun Luar Angkasa',
    time: 60,
    paint: paintStation,
    diffs: [
      { id: 'ring', x: 300, y: 160, r: 40 },
      { id: 'light', x: 138, y: 400, r: 14 },
      { id: 'star', x: 520, y: 90, r: 16 },
      { id: 'visor', x: 450, y: 298, r: 24 },
      { id: 'cable', x: 285, y: 350, r: 22 },
      { id: 'crack', x: 380, y: 180, r: 18 },
      { id: 'claw', x: 520, y: 360, r: 22 },
    ],
  },
];
