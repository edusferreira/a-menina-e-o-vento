// Ponto de entrada: carrega o conteúdo JSON (editável pelo roteirista), monta o app e registra o modo offline (PWA).

import { criarApp } from './app.js';

const ARQUIVOS = ['capitais', 'pistas', 'dialogos', 'finais', 'avatar', 'regras'];

async function carregar(nome) {
  const resposta = await fetch(`data/${nome}.json`);
  if (!resposta.ok) throw new Error(`Não consegui carregar data/${nome}.json (${resposta.status})`);
  return resposta.json();
}

function storageSeguro() {
  try {
    const teste = '__amev__';
    window.localStorage.setItem(teste, teste);
    window.localStorage.removeItem(teste);
    return window.localStorage;
  } catch {
    return null;
  }
}

async function iniciar() {
  const raiz = document.getElementById('app');
  try {
    const [capitais, pistas, dialogos, finais, avatar, regras] = await Promise.all(ARQUIVOS.map(carregar));
    const porId = Object.fromEntries(capitais.map((c) => [c.id, c]));
    criarApp({ raiz, dados: { capitais, porId, pistas, dialogos, finais, avatar, regras }, storage: storageSeguro() });
  } catch (erro) {
    raiz.innerHTML = `<main class="tela"><h1>Ops, o Vento levou os arquivos</h1>
      <p>O jogo precisa ser aberto por um servidor (por exemplo, <code>npm run dev</code>), não direto do arquivo.</p>
      <p class="erro">${String(erro.message).replace(/[<>&]/g, '')}</p></main>`;
  }
  if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
}

iniciar();
