// Registro das telas (seção 12): nome usado em api.ir(nome) -> função que monta a tela.

import { abertura, telaPatente, creditos } from './menu.js';
import { prologo } from './prologo.js';
import { recruta } from './recruta.js';
import { delegacia, briefing } from './delegacia.js';
import { capital, local } from './capital.js';
import { diario, mapa } from './diario.js';
import { aeroporto, errada } from './viagem.js';
import { encontro, teste, conversa } from './encontro.js';
import { final } from './final.js';
import { album, passeio } from './album.js';

export const TELAS = {
  abertura,
  prologo,
  recruta,
  delegacia,
  briefing,
  capital,
  local,
  diario,
  mapa,
  aeroporto,
  errada,
  encontro,
  teste,
  conversa,
  final,
  album,
  passeio,
  patente: telaPatente,
  creditos,
};
