/* Os quatro arquivos enviados, lidos como texto. São os mesmos arquivos
   que foram compilados com gcc para conferir o que a página afirma. */

import cabecalho from '../fontes/contaBancaria.h?raw';
import cores from '../fontes/ec_rgb_colors.h?raw';
import biblioteca from '../fontes/contaBancaria.c?raw';
import principal from '../fontes/main.c?raw';

const limpar = (texto: string) => texto.replace(/\r/g, '').replace(/\s+$/, '');

export type Fonte = { caminho: string; texto: string };

export const FONTES = {
  cabecalho: { caminho: 'include/contaBancaria.h', texto: limpar(cabecalho) },
  cores: { caminho: 'include/ec_rgb_colors.h', texto: limpar(cores) },
  biblioteca: { caminho: 'src/contaBancaria.c', texto: limpar(biblioteca) },
  principal: { caminho: 'apps/main.c', texto: limpar(principal) },
} satisfies Record<string, Fonte>;

export const linhaDe = (fonte: Fonte, n: number) => fonte.texto.split('\n')[n - 1] ?? '';
