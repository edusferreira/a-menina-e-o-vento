// Conjunto pequeno e previsível de capitais para testar o motor sem depender do conteúdo final.
import { readFileSync } from 'node:fs';

export const regras = JSON.parse(readFileSync(new URL('../data/regras.json', import.meta.url), 'utf8'));

const BASE = [
  ['belem', 'Norte', -1.46, -48.49, ['manaus', 'saoluis']],
  ['manaus', 'Norte', -3.12, -60.02, ['belem', 'portovelho']],
  ['portovelho', 'Norte', -8.76, -63.9, ['manaus', 'cuiaba']],
  ['saoluis', 'Nordeste', -2.53, -44.3, ['belem', 'recife']],
  ['recife', 'Nordeste', -8.05, -34.88, ['salvador', 'saoluis']],
  ['salvador', 'Nordeste', -12.97, -38.5, ['recife', 'rio']],
  ['rio', 'Sudeste', -22.91, -43.17, ['salvador', 'saopaulo']],
  ['saopaulo', 'Sudeste', -23.55, -46.63, ['rio', 'curitiba']],
  ['curitiba', 'Sul', -25.43, -49.27, ['saopaulo', 'portoalegre']],
  ['portoalegre', 'Sul', -30.03, -51.23, ['curitiba', 'cuiaba']],
  ['cuiaba', 'Centro-Oeste', -15.6, -56.1, ['brasilia', 'portovelho']],
  ['brasilia', 'Centro-Oeste', -15.79, -47.88, ['cuiaba', 'saopaulo']],
];

export const capitais = BASE.map(([id, regiao, lat, lon, distratores]) => ({
  id,
  nome: id.toUpperCase(),
  regiao,
  lat,
  lon,
  bioma: 'Bioma',
  distratores,
  locais: [0, 1, 2].map((n) => ({ nome: `${id}-local${n}`, rastro: `fez a coisa ${n} em ${id}` })),
}));

export const pistas = Object.fromEntries(
  BASE.map(([id]) => [
    id,
    [
      { nivel: 'direta', cat: 'comida', texto: `${id} direta comida`, porque: 'p' },
      { nivel: 'direta', cat: 'festa', texto: `${id} direta festa`, porque: 'p' },
      { nivel: 'dedutiva', cat: 'hidro', texto: `${id} dedutiva hidro`, porque: 'p' },
      { nivel: 'dedutiva', cat: 'historia', texto: `${id} dedutiva historia`, porque: 'p' },
    ],
  ]),
);

export const dados = { capitais, porId: Object.fromEntries(capitais.map((c) => [c.id, c])), pistas, regras };
