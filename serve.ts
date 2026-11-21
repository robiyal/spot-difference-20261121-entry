// serve.ts — a tiny static server for game/ while developing locally.
// Run `node serve.ts` (or `node serve.ts --port 8080`) from this directory,
// then open http://localhost:8080. Standard library only; serves nothing
// outside game/ and does nothing clever.
import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('./game', import.meta.url)));
const args = process.argv.slice(2);
const portIndex = args.indexOf('--port');
const port = portIndex === -1 ? 8080 : Number(args[portIndex + 1]) || 8080;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
};

createServer((req, res) => {
  const path = normalize(join(root, decodeURIComponent(req.url.split('?')[0])));
  if (!path.startsWith(root + sep) && path !== root) {
    res.writeHead(403);
    res.end();
    return;
  }
  const file = (() => {
    // normalize() keeps a trailing slash for the root request, so compare
    // with it stripped; a directory request serves its index.html.
    const clean = path.length > 1 && path.endsWith(sep) ? path.slice(0, -1) : path;
    if (clean === root) return join(root, 'index.html');
    try {
      if (statSync(clean).isDirectory()) return join(clean, 'index.html');
    } catch {}
    return clean;
  })();
  try {
    const st = statSync(file);
    if (!st.isFile()) throw new Error('not a file');
    res.writeHead(200, { 'content-type': MIME[extname(file)] ?? 'application/octet-stream' });
    createReadStream(file).pipe(res);
  } catch {
    res.writeHead(404);
    res.end('not found');
  }
}).listen(port, () => console.log('serving game/ at http://localhost:' + port));
