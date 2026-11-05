// Service worker (PWA, seção 13): jogável sem internet depois do primeiro acesso.
// Estratégia "rede primeiro, cache como reserva": quem edita o conteúdo vê a versão nova na hora.

const CACHE = 'amev-v1';
const ARQUIVOS = [
  './', 'index.html', 'css/style.css', 'icon.svg', 'manifest.webmanifest',
  'data/capitais.json', 'data/pistas.json', 'data/dialogos.json', 'data/finais.json', 'data/avatar.json', 'data/regras.json',
  'src/app/main.js', 'src/app/app.js', 'src/app/perfil.js', 'src/app/som.js',
  'src/engine/rng.js', 'src/engine/geo.js', 'src/engine/tempo.js', 'src/engine/rota.js', 'src/engine/caso.js',
  'src/engine/diario.js', 'src/engine/teste.js', 'src/engine/pontos.js', 'src/engine/jogo.js', 'src/engine/falas.js',
  'src/ui/dom.js', 'src/ui/avatar.js', 'src/ui/mapa.js', 'src/ui/cenas.js', 'src/ui/comum.js',
  'src/ui/telas/index.js', 'src/ui/telas/menu.js', 'src/ui/telas/prologo.js', 'src/ui/telas/recruta.js',
  'src/ui/telas/delegacia.js', 'src/ui/telas/capital.js', 'src/ui/telas/diario.js', 'src/ui/telas/viagem.js',
  'src/ui/telas/encontro.js', 'src/ui/telas/final.js', 'src/ui/telas/album.js',
];

self.addEventListener('install', (ev) => {
  ev.waitUntil(caches.open(CACHE).then((c) => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (ev) => {
  ev.waitUntil(caches.keys()
    .then((chaves) => Promise.all(chaves.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (ev) => {
  if (ev.request.method !== 'GET' || new URL(ev.request.url).origin !== self.location.origin) return;
  ev.respondWith(
    fetch(ev.request)
      .then((resposta) => {
        const copia = resposta.clone();
        caches.open(CACHE).then((c) => c.put(ev.request, copia));
        return resposta;
      })
      .catch(() => caches.match(ev.request)),
  );
});
