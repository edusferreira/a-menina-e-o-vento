// O avatar em camadas: todo penteado da lista tem desenho próprio, e as tias seguem o figurino do site do espetáculo.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { desenharAvatar } from '../src/ui/avatar.js';

const avatar = JSON.parse(readFileSync(new URL('../data/avatar.json', import.meta.url), 'utf8'));
const dialogos = JSON.parse(readFileSync(new URL('../data/dialogos.json', import.meta.url), 'utf8'));
const desenhar = (cfg) => desenharAvatar(cfg, { opcoes: avatar });
const TIAS = ['adelaide', 'adalgisa', 'aurelia'];

describe('avatar', () => {
  it('cada penteado da lista tem desenho próprio, inclusive o coque alto', () => {
    const svgs = avatar.cabelo.map((c) => desenhar({ ...avatar.padrao, cabelo: c.id }));
    expect(new Set(svgs).size).toBe(avatar.cabelo.length);
    expect(avatar.cabelo.map((c) => c.id)).toContain('coqueAlto');
  });

  it('cada tipo de olho da lista tem desenho próprio, inclusive o olhar de lado', () => {
    const svgs = avatar.olhos.map((o) => desenhar({ ...avatar.padrao, olhos: o.id }));
    expect(new Set(svgs).size).toBe(avatar.olhos.length);
    expect(avatar.olhos.map((o) => o.id)).toContain('deLado');
  });

  it('Maria: cacheado preso no alto com laço vermelho, vestido azul-marinho de gola branca e mangas bufantes', () => {
    const maria = avatar.personagens.maria;
    expect(maria).toMatchObject({ cabelo: 'puffAlto', acessorio: 'nenhum', boca: 'aberta' });
    const svg = desenhar(maria);
    ['laco', 'gola-redonda', 'mangas-bufantes'].forEach((camada) => expect(svg).toContain(`data-camada="${camada}"`));
    expect(svg).toContain(maria.roupa);
  });

  it('Pedro: repartido de lado, camisa branca, colete azul com botões dourados, gravata-borboleta e olhar de lado', () => {
    const pedro = avatar.personagens.pedro;
    expect(pedro).toMatchObject({ cabelo: 'repartido', olhos: 'deLado', acessorio: 'nenhum' });
    const svg = desenhar(pedro);
    ['colete', 'gravata-borboleta'].forEach((camada) => expect(svg).toContain(`data-camada="${camada}"`));
    // A paleta de pele vai do mais claro (0) ao mais escuro (5).
    expect(pedro.pele).toBeLessThan(avatar.personagens.maria.pele);
  });

  it('pode recortar só um pedaço do desenho (ex.: a cabeça da Maria para a Maria-brisa)', () => {
    expect(desenharAvatar(avatar.personagens.maria, { opcoes: avatar, recorte: '20 0 64 80' })).toContain('viewBox="20 0 64 80"');
    expect(desenhar(avatar.padrao)).toContain('viewBox="0 0 104 124"');
  });

  const camadas = (svg) => [...svg.matchAll(/data-camada="([^"]+)"/g)].map((m) => m[1]);

  it('Mãe: lisa e escura, adereço azul, vestido vermelho de bolinhas, blusa branca, pérolas e folha na mão', () => {
    const mae = avatar.personagens.mae;
    expect(mae).toMatchObject({ cabelo: 'liso', estampa: { tipo: 'bolinhas' } });
    expect(mae.extras).not.toContain('telefone');
    expect(camadas(desenhar(mae))).toEqual(expect.arrayContaining(['estampa', 'blusa-branca', 'perolas', 'fascinador', 'folha-na-mao']));
  });

  it('Vovó: curto ondulado claro, chapeuzinho escuro, blusa de babados, saia salmão com faixa, olhar para cima', () => {
    const vovo = avatar.personagens.vovo;
    expect(vovo).toMatchObject({ cabelo: 'ondulado', olhos: 'paraCima', acessorio: 'nenhum' });
    expect(vovo.saia && vovo.cinto).toBeTruthy();
    expect(camadas(desenhar(vovo))).toEqual(expect.arrayContaining(['chapeuzinho', 'babados', 'mangas-bufantes', 'cinto']));
  });

  it('Velha que Viu: longo ondulado, chapéu preto, roupa preta com brilhos, echarpe clara e sorriso aberto', () => {
    const velha = avatar.personagens.velha;
    expect(velha).toMatchObject({ cabelo: 'onduladoLongo', boca: 'aberta', estampa: { tipo: 'brilhos' } });
    // Cabelo rosa e pele clara (a paleta de pele vai do mais claro, 0, ao mais escuro, 5).
    expect(velha).toMatchObject({ pele: 0, corCabelo: '#e391b8' });
    expect(velha.extras).not.toContain('lenco');
    expect(camadas(desenhar(velha))).toEqual(expect.arrayContaining(['chapeu-aba', 'echarpe', 'estampa']));
  });

  it('A Repórter: boina preta, óculos grandes, terno bordô, gravata vermelha, microfone amarelo e sorriso aberto', () => {
    const reporter = avatar.personagens.reporter;
    expect(reporter).toMatchObject({ boca: 'aberta', paleto: '#7a1f33', gravata: { cor: '#c8262b' } });
    expect(dialogos.personagens.reporter.nome).toBe('A Repórter');
    expect(camadas(desenhar(reporter))).toEqual(expect.arrayContaining(['boina', 'oculos-grandes', 'paleto', 'gravata', 'microfone']));
  });

  it('A Fotógrafa: boné azul-escuro, casaco marrom com bolsos, gravata escura, câmera, bolsa e calça azul-escura', () => {
    const fotografa = avatar.personagens.fotografa;
    expect(fotografa).toMatchObject({ boca: 'aberta', paleto: '#7a5236', calca: { cor: '#1f2a44' } });
    expect(camadas(desenhar(fotografa))).toEqual(expect.arrayContaining(['bone-escuro', 'paleto', 'bolsos', 'gravata', 'camera', 'bolsa-transversal', 'calca']));
  });

  it('tons de pele: Repórter mais clara; Fotógrafa morena, mais escura que ela; Plácido no tom da Fotógrafa', () => {
    // A paleta de pele vai do mais claro (0) ao mais escuro (5); o 5 fica fora porque a Fotógrafa é morena, não negra.
    const { reporter, fotografa, placido } = avatar.personagens;
    expect(reporter.pele).toBeLessThan(fotografa.pele);
    expect(fotografa.pele).toBeLessThan(5);
    expect(placido.pele).toBe(fotografa.pele);
  });

  it('Comissário Plácido: chapéu preto de aba curta, paletó preto, gravata estampada, lupa branca, xadrez e boca aberta', () => {
    const placido = avatar.personagens.placido;
    expect(placido).toMatchObject({ boca: 'aberta', paleto: '#1b1b20', chapeuAba: { aba: 'curta' }, calca: { xadrez: expect.any(String) } });
    expect(placido.extras).not.toContain('quepe');
    expect(placido).toMatchObject({ rosto: 'bochechudo', porte: 'gordinho' });
    // Pescoço mais grosso e mais curto que o normal.
    const pescoco = (svg) => {
      const [, largura, altura] = /data-camada="pescoco"[^>]*width="([\d.]+)" height="([\d.]+)"/.exec(svg);
      return { largura: Number(largura), altura: Number(altura) };
    };
    const normal = pescoco(desenhar(avatar.padrao));
    const dele = pescoco(desenhar(placido));
    expect(dele.largura).toBeGreaterThan(normal.largura);
    expect(dele.altura).toBeLessThan(normal.altura);
    expect(camadas(desenhar(placido))).toEqual(expect.arrayContaining(['chapeu-aba', 'paleto', 'gravata', 'lupa', 'calca', 'porte-gordinho']));
  });

  it('Crispina: cabelo escuro preso, boina vermelha, colete preto bordado, gravata vermelha, brincos e rosto sério', () => {
    const crispina = avatar.personagens.crispina;
    expect(crispina).toMatchObject({ cabelo: 'presoAtras', corCabelo: 0, boca: 'timida', olhos: 'redondos', acessorio: 'nenhum' });
    expect(crispina.colete).toMatchObject({ cor: '#18181d', bordado: expect.any(String) });
    expect(camadas(desenhar(crispina))).toEqual(expect.arrayContaining(['boina-vermelha', 'colete', 'bordado', 'gravata', 'brincos']));
  });

  it('Atlântica: boina vermelha de borda escura, colete preto, gravata, brincos, microfone de rosto, boca aberta e olhar de lado', () => {
    const atlantica = avatar.personagens.atlantica;
    expect(atlantica).toMatchObject({ cabelo: 'presoAtras', corCabelo: 0, boca: 'aberta', olhos: 'deLado' });
    expect(atlantica.boina.borda).not.toBe(atlantica.boina.cor);
    expect(camadas(desenhar(atlantica))).toEqual(expect.arrayContaining(['boina-vermelha', 'colete', 'gravata', 'brincos', 'microfone-rosto']));
  });

  it.each(TIAS)('%s usa coque alto e chapéu de aba com enfeite', (id) => {
    const tia = avatar.personagens[id];
    expect(tia.cabelo).toBe('coqueAlto');
    expect(tia.chapeuAba.enfeite).toMatch(/pena|flor/);
    const svg = desenhar(tia);
    expect(svg).toContain('data-camada="chapeu-aba"');
    expect(svg).toContain(tia.chapeuAba.cor);
    expect(svg).toContain('data-camada="gola-alta"');
    expect(svg).not.toMatch(/undefined|NaN/);
  });

  it('cada tia tem sua cor, e a Adelaide tem saia vermelha e colar', () => {
    const roupas = TIAS.map((id) => avatar.personagens[id].roupa);
    expect(new Set(roupas).size).toBe(3);
    const adelaide = desenhar(avatar.personagens.adelaide);
    expect(adelaide).toContain(avatar.personagens.adelaide.saia);
    expect(adelaide).toContain('data-camada="colar"');
  });
});
