// main.ts — hands this entry in (Node 22, standard library only).
//
// It stages the entry into the output directory the grader reads: the whole
// game/ folder, the screenshots/ folder, and a dossier.json written by the
// vendored make.fun library from exactly those staged files. Outside the
// grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

function handIn() {
  const repoRoot = fileURLToPath(new URL('.', import.meta.url));
  const outputDir = resolve(process.env.MAKEFUN_OUTPUT_DIR ?? '/output');
  const stagedGame = join(outputDir, 'game');
  const stagedShots = join(outputDir, 'screenshots');

  // Fail loudly instead of handing in an entry with no game in it.
  if (!existsSync(join(repoRoot, 'game', 'index.html'))) {
    throw new Error('game/index.html is missing — nothing to hand in');
  }

  mkdirSync(stagedGame, { recursive: true });
  mkdirSync(stagedShots, { recursive: true });
  cpSync(join(repoRoot, 'game'), stagedGame, { recursive: true });
  if (existsSync(join(repoRoot, 'screenshots'))) {
    cpSync(join(repoRoot, 'screenshots'), stagedShots, { recursive: true });
  }

  // Caps mirror the gate in the competition's RULES.txt: the dossier text is
  // capped at 160 KiB, screenshots at 4 files of 256 KiB, game/ at 993 files
  // and 48 MiB with no path over 1000 bytes.
  const dossier = buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  });
  writeFileSync(join(outputDir, 'dossier.json'), dossier);
}

handIn();
