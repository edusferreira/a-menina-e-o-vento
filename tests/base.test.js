import { describe, it, expect } from 'vitest';
import { normalizarSemente, gerarSemente, hashTexto, criarRng, proximo, embaralhar } from '../src/engine/rng.js';
import { distanciaKm } from '../src/engine/geo.js';
import { momento, totalPeriodos, custoViagem, opacidadeMaria } from '../src/engine/tempo.js';
import { sortearRota, opcoesDestino } from '../src/engine/rota.js';
import { capitais, regras, dados } from './fixture.js';

describe('semente', () => {
  it('normaliza códigos de caso de 4 caracteres e rejeita inválidos', () => {
    expect(normalizarSemente(' 4f2a ')).toBe('4F2A');
    expect(normalizarSemente('4F2')).toBeNull();
    expect(normalizarSemente('4F2I')).toBeNull(); // I e O ficam fora para não confundir com 1 e 0
  });

  it('gera códigos válidos', () => {
    for (let i = 0; i < 50; i += 1) expect(normalizarSemente(gerarSemente())).not.toBeNull();
  });

  it('a mesma semente produz a mesma sequência', () => {
    const a = criarRng(hashTexto('4F2A'));
    const b = criarRng(hashTexto('4F2A'));
    expect([a.random(), a.random(), a.random()]).toEqual([b.random(), b.random(), b.random()]);
  });

  it('proximo é puro e devolve o novo estado', () => {
    const r1 = proximo(123);
    const r2 = proximo(123);
    expect(r1).toEqual(r2);
    expect(r1.valor).toBeGreaterThanOrEqual(0);
    expect(r1.valor).toBeLessThan(1);
    expect(r1.estado).not.toBe(123);
  });

  it('embaralhar não altera a lista original', () => {
    const lista = [1, 2, 3, 4, 5];
    const nova = embaralhar(lista, criarRng(7));
    expect(lista).toEqual([1, 2, 3, 4, 5]);
    expect([...nova].sort()).toEqual(lista);
  });
});

describe('tempo', () => {
  it('distância entre Belém e Manaus fica perto de 1.290 km', () => {
    const km = distanciaKm(dados.porId.belem, dados.porId.manaus);
    expect(km).toBeGreaterThan(1200);
    expect(km).toBeLessThan(1350);
  });

  it('viagem acima de 2.000 km custa 2 períodos', () => {
    expect(custoViagem(1999, regras)).toBe(1);
    expect(custoViagem(2001, regras)).toBe(2);
  });

  it('calcula o dia e o período a partir dos períodos gastos', () => {
    expect(momento(0, 4, regras)).toMatchObject({ dia: 0, diaNome: 'Segunda', periodo: 0, periodoNome: 'Manhã' });
    expect(momento(5, 4, regras)).toMatchObject({ dia: 1, periodoNome: 'Tarde' });
    expect(momento(9, 5, regras)).toMatchObject({ dia: 1, periodoNome: 'Madrugada' });
    expect(totalPeriodos(4, regras)).toBe(28);
    expect(totalPeriodos(5, regras)).toBe(35);
  });

  it('Maria só fica translúcida a partir da noite de sábado', () => {
    expect(opacidadeMaria(0, 4)).toBe(1);
    expect(opacidadeMaria(22, 4)).toBe(1); // sábado, fim de tarde
    expect(opacidadeMaria(23, 4)).toBeLessThan(1); // sábado, noite
    expect(opacidadeMaria(28, 4)).toBeGreaterThan(0);
  });
});

describe('rota', () => {
  it('sorteia sem repetir e sem dois saltos seguidos na mesma região', () => {
    for (let s = 0; s < 200; s += 1) {
      const rota = sortearRota(capitais, 9, criarRng(s));
      expect(new Set(rota).size).toBe(9);
      for (let i = 1; i < rota.length; i += 1) {
        expect(dados.porId[rota[i]].regiao).not.toBe(dados.porId[rota[i - 1]].regiao);
      }
    }
  });

  it('opções de destino trazem a certa, distratores da tabela e nada excluído', () => {
    const ops = opcoesDestino('belem', dados.porId, { excluir: ['saoluis'], quantidade: 3 }, criarRng(3));
    expect(ops).toHaveLength(3);
    expect(ops).toContain('belem');
    expect(ops).toContain('manaus');
    expect(ops).not.toContain('saoluis');
    expect(new Set(ops).size).toBe(3);
  });

  it('completa com capitais da mesma região quando faltam distratores', () => {
    const ops = opcoesDestino('belem', dados.porId, { excluir: ['saoluis'], quantidade: 4 }, criarRng(3));
    expect(ops).toHaveLength(4);
    expect(ops).toContain('portovelho');
  });
});
