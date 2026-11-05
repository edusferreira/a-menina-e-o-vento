// Renderiza cada tela com o conteúdo real em vários momentos da partida: pega erros de montagem antes do navegador.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { TELAS } from '../src/ui/telas/index.js';
import { perfilVazio } from '../src/app/perfil.js';
import {
  novoJogo, visitarLocal, viajar, escolherLocalEncontro, responderTeste, escolherFinal,
} from '../src/engine/jogo.js';
import { esc, html } from '../src/ui/dom.js';

const ler = (nome) => JSON.parse(readFileSync(new URL(`../data/${nome}.json`, import.meta.url), 'utf8'));
const capitais = ler('capitais');
const dados = {
  capitais,
  porId: Object.fromEntries(capitais.map((c) => [c.id, c])),
  pistas: ler('pistas'),
  dialogos: ler('dialogos'),
  finais: ler('finais'),
  avatar: ler('avatar'),
  regras: ler('regras'),
};

function api(jogo, params = {}) {
  return { dados, perfil: { ...perfilVazio(dados.avatar.padrao), temAvatar: true }, jogo, params, som: {}, ir() {}, avisar() {} };
}

function renderizar(nome, jogo, params) {
  const saida = String(TELAS[nome](api(jogo, params)).html);
  expect(saida, nome).not.toMatch(/undefined|\[object Object\]|NaN/);
  return saida;
}

function partidaAte(fase) {
  let e = novoJogo({ semente: '4F2A', nivel: 'facil', dados, perks: {} });
  const eventos = [];
  while (e.fase === 'capital') {
    for (const i of [0, 1, 2]) {
      const r = visitarLocal(e, i, dados);
      eventos.push(r.evento);
      e = r.estado;
    }
    if (e.fase !== 'capital') break;
    const errada = e.caso.paradas[e.parada].opcoes.find((id) => id !== e.caso.rota[e.parada + 1]);
    if (fase === 'errada') return { e: viajar(e, errada, dados).estado, eventos };
    e = viajar(e, e.caso.rota[e.parada + 1], dados).estado;
  }
  if (fase === 'encontro') return { e, eventos };
  e = escolherLocalEncontro(e, e.caso.final.localCerto, dados).estado;
  if (fase === 'teste') return { e, eventos };
  e = responderTeste(e, e.encontro.teste.map((q) => q.correta), dados).estado;
  if (fase === 'conversa') return { e, eventos };
  return { e: escolherFinal(e, 'final1', dados).estado, eventos };
}

describe('telas', () => {
  it('escapa texto livre (nome do recruta) nos templates', () => {
    expect(esc('<b>"x"</b>')).toBe('&lt;b&gt;&quot;x&quot;&lt;/b&gt;');
    expect(String(html`<p>${'<script>'}</p>`)).toBe('<p>&lt;script&gt;</p>');
  });

  it('telas fora da partida renderizam', () => {
    ['abertura', 'recruta', 'delegacia', 'album', 'passeio', 'patente', 'creditos'].forEach((t) => renderizar(t, null, {}));
    [0, 1, 2, 3, 4].forEach((n) => renderizar('prologo', null, { n }));
    renderizar('passeio', null, { capital: 'belem' });
  });

  it('telas da partida renderizam em cada fase', () => {
    const inicio = novoJogo({ semente: '4F2A', nivel: 'dificil', dados, perks: { aureliaBonus: true, placidoChamaPeloNome: true } });
    const briefingSemNome = renderizar('briefing', inicio);
    expect(briefingSemNome).not.toMatch(/Recruta Recruta|Recruta ,/);
    expect(briefingSemNome).toContain('Recruta, o caso é simples');
    renderizar('capital', inicio, { chegada: 'inicio' });
    const r = visitarLocal(inicio, 0, dados);
    renderizar('local', r.estado, { idx: 0, evento: r.evento });
    const postal = inicio.caso.paradas[0].locais.findIndex((l) => l.tipo === 'postal');
    const rp = visitarLocal(r.estado, postal, dados);
    const telaCarta = renderizar('local', rp.estado, { idx: postal, evento: rp.evento });
    expect(telaCarta).toContain('folha-carta');
    expect(telaCarta).toContain(`Mãe, ${inicio.caso.paradas[0].locais[postal].carta}`);
    renderizar('aeroporto', r.estado, { escolha: inicio.caso.rota[1] });
    renderizar('diario', r.estado);
    ['regioes', 'biomas', 'rios', 'fusos'].forEach((camada) => renderizar('mapa', r.estado, { camada }));
    renderizar('capital', viajar(r.estado, inicio.caso.rota[1], dados).estado, { chegada: 'certa' });
    renderizar('errada', partidaAte('errada').e);
    const noEncontro = partidaAte('encontro').e;
    const ultimaCarta = noEncontro.caso.paradas.at(-1).locais[noEncontro.caso.final.localCerto].carta;
    expect(renderizar('encontro', noEncontro, { chegada: 'certa', crispina: true })).toContain(`Mãe, ${ultimaCarta}`);
    renderizar('teste', partidaAte('teste').e);
    renderizar('conversa', partidaAte('conversa').e);
    const fim = partidaAte('fim').e;
    expect(fim.fase).toBe('fim');
    renderizar('final', { ...fim, fim: { ...fim.fim, subiu: dados.regras.patentes[1] } });
  });

  it('interferências aparecem nas visitas e renderizam', () => {
    const vistos = new Set();
    for (const semente of ['AAAA', 'BBBB', 'CCCC', 'DDDD', 'EEEE', 'FFFF', 'GGGG', 'HHHH', 'JJJJ', 'KKKK']) {
      let e = novoJogo({ semente, nivel: 'medio', dados, perks: {} });
      for (const i of [0, 1, 2]) {
        const r = visitarLocal(e, i, dados);
        if (r.evento.interferencia) {
          vistos.add(r.evento.interferencia.tipo);
          renderizar('local', r.estado, { idx: i, evento: r.evento });
        }
        e = r.estado;
      }
    }
    expect(vistos.size).toBeGreaterThan(1);
  });

  it('derrota mostra a rota certa', () => {
    let e = novoJogo({ semente: '4F2A', nivel: 'medio', dados, perks: {} });
    while (e.fase !== 'fim') {
      const errada = e.caso.paradas[e.parada].opcoes.find((id) => id !== e.caso.rota[e.parada + 1]);
      e = viajar(e, errada, dados).estado;
      if (e.fase === 'errada') e = { ...e, fase: 'capital', capitalAtual: e.caso.rota[e.parada] };
    }
    const derrota = renderizar('final', e);
    expect(derrota).toContain('A rota de Maria');
    expect(derrota).toContain('Maria virando brisa');
  });
});
