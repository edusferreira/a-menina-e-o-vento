import { describe, it, expect } from 'vitest';
import {
  carregarPerfil, salvarPerfil, salvarPartida, carregarPartida, apagarTudo, sincronizarAlbum, registrarFim, perksDoPerfil,
} from '../src/app/perfil.js';
import { preencher, falaInformante, ecoAdalgisa, recapAtlantica } from '../src/engine/falas.js';
import { novoJogo, visitarLocal, viajar } from '../src/engine/jogo.js';
import { dados, regras } from './fixture.js';

function storageFalso() {
  const mapa = new Map();
  return { getItem: (k) => mapa.get(k) ?? null, setItem: (k, v) => mapa.set(k, v), removeItem: (k) => mapa.delete(k) };
}

describe('perfil', () => {
  it('salva e recarrega perfil e partida; apagar limpa tudo', () => {
    const s = storageFalso();
    const p = { ...carregarPerfil(s, { nome: '' }), pontos: 42 };
    salvarPerfil(s, p);
    salvarPartida(s, { fase: 'capital' });
    expect(carregarPerfil(s, {}).pontos).toBe(42);
    expect(carregarPartida(s).fase).toBe('capital');
    apagarTudo(s);
    expect(carregarPerfil(s, {}).pontos).toBe(0);
    expect(carregarPartida(s)).toBeNull();
  });

  it('não quebra quando o storage falha', () => {
    const quebrado = { getItem: () => { throw new Error('x'); }, setItem: () => { throw new Error('x'); } };
    expect(carregarPerfil(quebrado, {}).pontos).toBe(0);
    expect(() => salvarPerfil(quebrado, {})).not.toThrow();
  });

  it('Álbum guarda capitais visitadas, inclusive as erradas, e os postais', () => {
    let e = novoJogo({ semente: '4F2A', nivel: 'facil', dados, perks: { semInterferencia: true } });
    const postal = e.caso.paradas[0].locais.findIndex((l) => l.tipo === 'postal');
    e = visitarLocal(e, postal, dados).estado;
    const errada = e.caso.paradas[0].opcoes.find((id) => id !== e.caso.rota[1]);
    e = viajar(e, errada, dados).estado;
    const p = sincronizarAlbum(carregarPerfil(storageFalso(), {}), e);
    expect(p.album[errada].visitada).toBe(true);
    expect(p.album[e.caso.rota[0]].postal).toBeTruthy();
  });

  it('registrar o fim soma pontos, guarda o final e libera vantagens', () => {
    const base = carregarPerfil(storageFalso(), {});
    const estado = { ...novoJogo({ semente: 'AAAA', nivel: 'facil', dados }), fim: { tipo: 'final2', pontos: 1600 }, gastos: 20 };
    const { perfil, subiu } = registrarFim(base, estado, regras);
    expect(perfil.pontos).toBe(1600);
    expect(perfil.finaisVistos).toEqual(['final2']);
    expect(subiu.id).toBe('vento');
    expect(perksDoPerfil(perfil, regras)).toMatchObject({ crispinaAcerto: 0.3, ventoFrequente: true, aureliaBonus: true });
  });
});

describe('falas', () => {
  it('preenche campos e põe em maiúsculas quando o campo está em maiúsculas', () => {
    expect(preencher('EXTRA! {PISTA}!', { pista: 'para o sul' })).toBe('EXTRA! PARA O SUL!');
    expect(preencher('Oi {nome}', { nome: 'Bia' })).toBe('Oi Bia');
  });

  it('usa a voz do informante e é estável pela chave', () => {
    const dialogos = { informantes: { velha: ['A {pista}.', 'B {pista}.'] } };
    const a = falaInformante('velha', { texto: 'x' }, dialogos, 'k1');
    expect(a).toBe(falaInformante('velha', { texto: 'x' }, dialogos, 'k1'));
    expect(a.endsWith('x.')).toBe(true);
  });

  it('Adalgisa e Atlântica repetem pedaços de pistas já ouvidas', () => {
    const dialogos = {
      interferencias: { adalgisa: ['eco: {eco}'], adalgisaSemEco: 'nada' },
      atlantica: 'Anotado: {lista}.', atlanticaVazia: 'vazio',
    };
    expect(ecoAdalgisa([], dialogos, 'k')).toBe('nada');
    expect(ecoAdalgisa([{ texto: 'onde todo mundo toma chimarrão no Guaíba' }], dialogos, 'k')).toBe('eco: mundo toma chimarrão no Guaíba');
    expect(recapAtlantica([{ texto: 'a cidade das pontes e rios' }], dialogos)).toBe('Anotado: das pontes e rios.');
  });
});
