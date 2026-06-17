import { createReadStream, existsSync } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { dirname, extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CONFIG } from '../src/config.js';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const port = Number(process.env.PORT || CONFIG.diagnostics.devServerPort);

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8'
};

function safeResolve(urlPath) {
  const cleaned = normalize(decodeURIComponent(urlPath.split('?')[0])).replace(/^\.\.(\/|\\|$)/, '');
  const requested = resolve(root, cleaned === '/' ? 'index.html' : cleaned.slice(1));
  return requested.startsWith(root) ? requested : join(root, 'index.html');
}

const server = createServer(async (request, response) => {
  try {
    let filePath = safeResolve(request.url || '/');
    const fileStat = await stat(filePath).catch(() => null);
    if (!fileStat || fileStat.isDirectory()) filePath = join(root, 'index.html');
    if (!existsSync(filePath)) {
      response.writeHead(CONFIG.http.notFoundStatus, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end(CONFIG.text.notFound);
      return;
    }
    response.writeHead(CONFIG.http.okStatus, { 'Content-Type': mimeTypes[extname(filePath)] || CONFIG.http.binaryContentType });
    createReadStream(filePath).pipe(response);
  } catch (error) {
    response.writeHead(CONFIG.http.errorStatus, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end(error.message);
  }
});

server.listen(port, () => {
  console.log(`${CONFIG.logging.prefix} Dev server running at http://localhost:${port}`);
});
