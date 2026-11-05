import { describe, it, expect } from 'vitest';
import { criarCaso } from '../src/engine/caso.js';
import { dados } from './fixture.js';

const caso = (semente, nivel = 'medio', opcoes = {}) => criarCaso({ semente, nivel, dados, opcoes });

describe('criarCaso', () => {
  it('é determinístico pela semente e pelo nível', () => {
    expect(caso('4F2A')).toEqual(caso('4F2A'));
    expect(caso('4F2A').rota).not.toEqual(caso('ZZZZ').rota);
  });

  it('o tamanho da rota segue o nível', () => {
    expect(caso('AAAA', 'facil').rota).toHaveLength(5);
    expect(caso('AAAA', 'medio').rota).toHaveLength(7);
    expect(caso('AAAA', 'dificil').rota).toHaveLength(9);
  });

  it('cada parada (menos a última) tem 2 pistas de destino da próxima capital e 1 postal', () => {
    const c = caso('B7K9');
    c.paradas.slice(0, -1).forEach((p, i) => {
      const tipos = p.locais.map((l) => l.tipo).sort();
      expect(tipos).toEqual(['destino', 'destino', 'postal']);
      p.locais.filter((l) => l.tipo === 'destino').forEach((l) => {
        expect(l.pista.texto.startsWith(c.rota[i + 1])).toBe(true);
      });
      expect(p.locais.find((l) => l.tipo === 'postal').informante).toBe('mae');
    });
  });

  it('no médio, uma pista direta e uma dedutiva; no difícil, só dedutivas', () => {
    const niveis = (c) => c.paradas[0].locais.filter((l) => l.pista).map((l) => l.pista.nivel).sort();
    expect(niveis(caso('C3D4', 'medio'))).toEqual(['dedutiva', 'direta']);
    expect(niveis(caso('C3D4', 'dificil'))).toEqual(['dedutiva', 'dedutiva']);
  });

  it('informantes não se repetem numa parada e seguem a categoria', () => {
    caso('D5E6').paradas.slice(0, -1).forEach((p) => {
      const nomes = p.locais.map((l) => l.informante);
      expect(new Set(nomes).size).toBe(3);
      p.locais.filter((l) => l.pista?.cat === 'festa').forEach((l) => expect(l.informante).toBe('reporter'));
    });
  });

  it('aeroporto oferece a próxima capital entre as opções; difícil tem 4', () => {
    const c = caso('E7F8', 'dificil');
    c.paradas.slice(0, -1).forEach((p, i) => {
      expect(p.opcoes).toHaveLength(4);
      expect(p.opcoes).toContain(c.rota[i + 1]);
      expect(p.opcoes).not.toContain(p.capital);
      expect(p.opcoes).toContain(p.crispina);
    });
  });

  it('Crispina sugere destino errado, a menos que a patente a faça acertar', () => {
    const c = caso('F9G2');
    c.paradas.slice(0, -1).forEach((p, i) => expect(p.crispina).not.toBe(c.rota[i + 1]));
    const certeira = caso('F9G2', 'medio', { crispinaAcerto: 1 });
    certeira.paradas.slice(0, -1).forEach((p, i) => expect(p.crispina).toBe(certeira.rota[i + 1]));
  });

  it('a última parada não tem aeroporto e define o local certo do encontro', () => {
    const c = caso('G3H4');
    const ultima = c.paradas.at(-1);
    expect(ultima.opcoes).toEqual([]);
    expect([0, 1, 2]).toContain(c.final.localCerto);
  });

  it('Pedro dá a pista da primeira capital', () => {
    const c = caso('H5J6');
    expect(c.pedro.texto.startsWith(c.rota[0])).toBe(true);
  });
});
