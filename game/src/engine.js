// engine.js — the game's state machine, input, timer, hints and scoring.
//
// States: title -> playing -> levelDone -> playing ... -> win, or -> gameOver.
// One scene at a time; each scene has 7 differences, a countdown, and 3 hints.
// Clicking a difference (on either panel) rings it on both panels. A wrong
// click costs 3 seconds. A hint pulses one unfound difference for 2 seconds.

const SPOT_PANEL = { w: 600, h: 520 };
const SPOT_LEFT = { x: 20, y: 80 };
const SPOT_RIGHT = { x: 660, y: 80 };
const SPOT_FIND_SCORE = 100;
const SPOT_WRONG_SECONDS = 3;
const SPOT_HINT_SECONDS = 2;

const spotGame = {
  state: 'title',
  sceneIndex: 0,
  found: new Set(),
  hintsLeft: 3,
  timeLeft: 90,
  score: 0,
  levelBonus: 0,
  message: '',
  messageAt: 0,
  wrongMarks: [],
  hintSpot: null,
  hintUntil: 0,
  now: 0,
  startedAt: 0,
  audio: null,
};

function spotScene() {
  return SPOT_SCENES[spotGame.sceneIndex];
}

function spotRemaining() {
  return spotScene().diffs.length - spotGame.found.size;
}

function spotStartScene(index) {
  const scene = SPOT_SCENES[index];
  spotGame.sceneIndex = index;
  spotGame.found = new Set();
  spotGame.hintsLeft = 3;
  spotGame.timeLeft = scene.time;
  spotGame.wrongMarks = [];
  spotGame.hintSpot = null;
  spotGame.hintSticky = false;
  spotGame.state = 'playing';
  spotGame.message = 'Find ' + scene.diffs.length + ' differences — click either picture!';
  spotGame.messageAt = spotGame.now;
}

function spotStartGame() {
  spotGame.score = 0;
  spotGame.levelBonus = 0;
  spotStartScene(0);
}

function spotToPanel(px, py) {
  // page point -> {panel: 'left'|'right', x, y} in panel space, or null
  const spots = [
    { panel: 'left', ox: SPOT_LEFT.x, oy: SPOT_LEFT.y },
    { panel: 'right', ox: SPOT_RIGHT.x, oy: SPOT_RIGHT.y },
  ];
  for (const s of spots) {
    const x = px - s.ox;
    const y = py - s.oy;
    if (x >= 0 && x < SPOT_PANEL.w && y >= 0 && y < SPOT_PANEL.h) {
      return { panel: s.panel, x, y };
    }
  }
  return null;
}

function spotNearestDiff(x, y) {
  let best = null;
  let bestD = 1e9;
  for (const d of spotScene().diffs) {
    if (spotGame.found.has(d.id)) continue;
    const dx = x - d.x;
    const dy = y - d.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < d.r + 10 && dist < bestD) {
      best = d;
      bestD = dist;
    }
  }
  return best;
}

function spotBeep(freq, dur, type) {
  try {
    if (!spotGame.audio) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      spotGame.audio = new AC();
    }
    const ctx = spotGame.audio;
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + dur);
  } catch (e) {
    // sound is garnish; a silent game still plays
  }
}

function spotClick(px, py) {
  if (spotGame.state === 'title') {
    spotStartGame();
    return;
  }
  if (spotGame.state === 'levelDone') {
    spotNextScene();
    return;
  }
  if (spotGame.state === 'gameOver' || spotGame.state === 'win') {
    spotStartGame();
    return;
  }
  const hit = spotToPanel(px, py);
  if (!hit) return;
  const diff = spotNearestDiff(hit.x, hit.y);
  if (diff) {
    spotGame.found.add(diff.id);
    spotGame.score += SPOT_FIND_SCORE;
    spotBeep(880, 0.12, 'sine');
    setTimeout(() => spotBeep(1318, 0.18, 'sine'), 90);
    if (spotGame.found.size === spotScene().diffs.length) {
      spotGame.levelBonus = Math.round(spotGame.timeLeft) * 5;
      spotGame.score += spotGame.levelBonus;
      spotGame.state = 'levelDone';
      spotBeep(1046, 0.15, 'triangle');
      setTimeout(() => spotBeep(1568, 0.25, 'triangle'), 120);
    } else {
      spotGame.message = 'Found it! ' + spotRemaining() + ' to go.';
      spotGame.messageAt = spotGame.now;
    }
  } else {
    spotGame.timeLeft = Math.max(0, spotGame.timeLeft - SPOT_WRONG_SECONDS);
    spotGame.wrongMarks.push({ x: hit.x, y: hit.y, panel: hit.panel, at: spotGame.now });
    spotBeep(160, 0.2, 'sawtooth');
    spotGame.message = 'Not there — minus 3 seconds!';
    spotGame.messageAt = spotGame.now;
  }
}

function spotUseHint() {
  if (spotGame.state !== 'playing') return;
  if (spotGame.hintsLeft <= 0) {
    spotGame.message = 'No hints left.';
    spotGame.messageAt = spotGame.now;
    return;
  }
  const left = spotScene().diffs.filter((d) => !spotGame.found.has(d.id));
  if (left.length === 0) return;
  spotGame.hintsLeft -= 1;
  spotGame.hintSpot = left[0];
  spotGame.hintUntil = spotGame.now + SPOT_HINT_SECONDS;
  spotGame.hintSticky = false;
  spotBeep(660, 0.15, 'sine');
  spotGame.message = 'Hint: look where the ring pulses…';
  spotGame.messageAt = spotGame.now;
}

function spotNextScene() {
  if (spotGame.sceneIndex + 1 >= SPOT_SCENES.length) {
    spotGame.state = 'win';
    return;
  }
  spotStartScene(spotGame.sceneIndex + 1);
}

function spotUpdate(dt) {
  spotGame.now += dt;
  if (spotGame.state === 'playing') {
    spotGame.timeLeft -= dt;
    if (spotGame.timeLeft <= 0) {
      spotGame.timeLeft = 0;
      spotGame.state = 'gameOver';
      spotBeep(220, 0.4, 'sawtooth');
    }
  }
  if (spotGame.hintSpot && !spotGame.hintSticky && spotGame.now > spotGame.hintUntil) spotGame.hintSpot = null;
  spotGame.wrongMarks = spotGame.wrongMarks.filter((m) => spotGame.now - m.at < 1.2);
}

function spotKey(key) {
  const k = key.toLowerCase();
  if (k === 'h') spotUseHint();
  else if (k === 'n' && spotGame.state === 'levelDone') spotNextScene();
  else if (k === 'r' && (spotGame.state === 'gameOver' || spotGame.state === 'win')) spotStartGame();
  else if ((k === 'enter' || k === ' ') && spotGame.state === 'title') spotStartGame();
  else if ((k === 'enter' || k === ' ') && spotGame.state === 'levelDone') spotNextScene();
  else if ((k === 'enter' || k === ' ') && (spotGame.state === 'gameOver' || spotGame.state === 'win')) spotStartGame();
}

// Staged shots: ?shot=play|hint|complete|orbit|start — deterministic setups
// so the screenshots are reproducible. No randomness anywhere in the game.
function spotApplyShot(shot) {
  if (shot === 'play') {
    spotStartScene(0);
    const ids = SPOT_SCENES[0].diffs.slice(0, 3).map((d) => d.id);
    spotGame.found = new Set(ids);
    spotGame.timeLeft = 62;
    spotGame.score = 300;
    spotGame.message = 'Found it! 4 to go.';
  } else if (shot === 'hint') {
    spotStartScene(1);
    const ids = SPOT_SCENES[1].diffs.slice(0, 2).map((d) => d.id);
    spotGame.found = new Set(ids);
    spotGame.timeLeft = 48;
    spotGame.score = 200;
    spotGame.hintsLeft = 2;
    spotGame.hintSpot = SPOT_SCENES[1].diffs[2];
    spotGame.hintUntil = 1e9;
    spotGame.hintSticky = true; // staged shot: the pulse stays for the screenshot
    spotGame.message = 'Hint: look where the ring pulses…';
  } else if (shot === 'complete') {
    spotStartScene(2);
    spotGame.found = new Set(SPOT_SCENES[2].diffs.map((d) => d.id));
    spotGame.timeLeft = 34;
    spotGame.levelBonus = 170;
    spotGame.score = 2150;
    spotGame.state = 'levelDone';
  } else if (shot === 'orbit') {
    spotStartScene(2);
    const ids = SPOT_SCENES[2].diffs.slice(0, 4).map((d) => d.id);
    spotGame.found = new Set(ids);
    spotGame.timeLeft = 41;
    spotGame.score = 400;
    spotGame.message = 'Found it! 3 to go.';
  } else {
    spotGame.state = 'title';
  }
  spotGame.now = 0;
}
