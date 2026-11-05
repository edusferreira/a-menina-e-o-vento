// Servidor estático mínimo para desenvolvimento (o jogo carrega JSON via fetch, que não funciona em file://).
// Sem dependências: node scripts/serve.mjs [porta]

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = resolve(fileURLToPath(new URL('..', import.meta.url)));
const PORTA = Number(process.argv[2] ?? process.env.PORT ?? 5173);
const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
};
const BLOQUEADOS = ['node_modules', 'workflow-graph', '.git'];

async function servir(req, res) {
  const caminho = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const relativo = normalize(caminho === '/' ? '/index.html' : caminho).replace(/^([/\\])+/, '');
  const arquivo = join(RAIZ, relativo);
  if (!arquivo.startsWith(RAIZ) || BLOQUEADOS.some((b) => relativo.startsWith(b))) {
    res.writeHead(403).end('Proibido');
    return;
  }
  try {
    const info = await stat(arquivo);
    const final = info.isDirectory() ? join(arquivo, 'index.html') : arquivo;
    const corpo = await readFile(final);
    res.writeHead(200, { 'Content-Type': TIPOS[extname(final)] ?? 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(corpo);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Não encontrado');
  }
}

createServer(servir).listen(PORTA, () => {
  console.log(`A Menina e o Vento em http://localhost:${PORTA}`);
});
