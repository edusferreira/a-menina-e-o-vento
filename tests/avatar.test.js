// O avatar em camadas: todo penteado da lista tem desenho próprio, e as tias seguem o figurino do site do espetáculo.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { desenharAvatar } from '../src/ui/avatar.js';

const avatar = JSON.parse(readFileSync(new URL('../data/avatar.json', import.meta.url), 'utf8'));
const desenhar = (cfg) => desenharAvatar(cfg, { opcoes: avatar });
const TIAS = ['adelaide', 'adalgisa', 'aurelia'];

describe('avatar', () => {
  it('cada penteado da lista tem desenho próprio, inclusive o coque alto', () => {
    const svgs = avatar.cabelo.map((c) => desenhar({ ...avatar.padrao, cabelo: c.id }));
    expect(new Set(svgs).size).toBe(avatar.cabelo.length);
    expect(avatar.cabelo.map((c) => c.id)).toContain('coqueAlto');
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
